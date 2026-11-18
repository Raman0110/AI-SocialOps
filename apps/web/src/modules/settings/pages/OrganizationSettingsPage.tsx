import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  createMembership,
  deleteMembership,
  getMemberships,
  updateMembershipRole,
  type CreateMembershipInput,
  type Membership,
} from "../../../api/memberships";
import type { OrganizationRole } from "../../auth/types/auth";

const { Text, Title } = Typography;
const roles: OrganizationRole[] = ["Owner", "Admin", "Agent", "Viewer"];

interface OrganizationSettingsPageProps {
  currentUserId: string;
  currentRole: OrganizationRole;
  organizationName: string;
}

export function OrganizationSettingsPage({
  currentUserId,
  currentRole,
  organizationName,
}: OrganizationSettingsPageProps) {
  const canManage = currentRole === "Owner" || currentRole === "Admin";
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(canManage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateMembershipInput>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!canManage) {
      return;
    }

    async function load() {
      try {
        setMembers(await getMemberships());
      } catch {
        setError("Unable to load organization members.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [canManage]);

  if (!canManage) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Administrator access required"
        description="Only organization owners and administrators can manage memberships."
      />
    );
  }

  const handleCreate = async (values: CreateMembershipInput) => {
    setSaving(true);
    try {
      const created = await createMembership(values);
      setMembers((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      form.resetFields();
      setModalOpen(false);
      messageApi.success("Member added to the organization.");
    } catch {
      messageApi.error("Unable to add the member. Check the email, password, and role.");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (membership: Membership, role: OrganizationRole) => {
    try {
      const updated = await updateMembershipRole(membership.id, role);
      setMembers((current) => current.map((item) => item.id === updated.id ? updated : item));
      messageApi.success("Member role updated.");
    } catch {
      messageApi.error("Unable to change this role.");
    }
  };

  const handleDelete = async (membership: Membership) => {
    try {
      await deleteMembership(membership.id);
      setMembers((current) => current.filter((item) => item.id !== membership.id));
      messageApi.success("Member removed.");
    } catch {
      messageApi.error("Unable to remove this membership.");
    }
  };

  return (
    <div className="space-y-5">
      {contextHolder}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="mb-1">Organization members</Title>
            <Text type="secondary">
              Manage access to {organizationName}. Authorization is enforced by the API.
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Add member
          </Button>
        </div>
      </section>

      {error && <Alert type="error" showIcon message={error} />}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="grid min-h-48 place-items-center"><Spin /></div>
        ) : (
          <Table<Membership>
            rowKey="id"
            pagination={false}
            dataSource={members}
            columns={[
              {
                title: "Member",
                render: (_, member) => (
                  <div>
                    <Text strong>{member.name}</Text>
                    <Text type="secondary" className="block text-xs">{member.email}</Text>
                  </div>
                ),
              },
              {
                title: "Role",
                render: (_, member) => member.userId === currentUserId ? (
                  <Tag color="blue">{member.role} · You</Tag>
                ) : (
                  <Select
                    value={member.role}
                    className="w-32"
                    onChange={(role: OrganizationRole) => void handleRoleChange(member, role)}
                    options={roles
                      .filter((role) => currentRole === "Owner" || role !== "Owner")
                      .map((role) => ({ value: role, label: role }))}
                  />
                ),
              },
              {
                title: "Joined",
                dataIndex: "createdAt",
                render: (value: string) => new Date(value).toLocaleDateString(),
              },
              {
                title: "",
                align: "right",
                render: (_, member) => member.userId !== currentUserId && (
                  <Popconfirm
                    title="Remove this member?"
                    description="They will lose access to this organization."
                    onConfirm={() => void handleDelete(member)}
                  >
                    <Button danger type="text" icon={<DeleteOutlined />} aria-label={`Remove ${member.name}`} />
                  </Popconfirm>
                ),
              },
            ]}
          />
        )}
      </section>

      <Modal
        title="Add organization member"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Add member"
      >
        <Form<CreateMembershipInput>
          form={form}
          layout="vertical"
          initialValues={{ role: "Agent" }}
          onFinish={(values) => void handleCreate(values)}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input autoComplete="name" />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true }, { type: "email" }]}>
            <Input autoComplete="email" />
          </Form.Item>
          <Form.Item
            label="Temporary password"
            name="temporaryPassword"
            extra="Required for a new user; ignored when adding an existing user to another workspace."
            rules={[{ min: 8 }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select
              options={roles
                .filter((role) => currentRole === "Owner" || role !== "Owner")
                .map((role) => ({ value: role, label: role }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
