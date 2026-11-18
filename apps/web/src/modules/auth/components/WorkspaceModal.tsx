import { CheckOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Divider, Input, List, Modal, Tag, Typography } from "antd";
import { useState } from "react";
import type { AuthOrganization } from "../types/auth";

const { Text } = Typography;

interface WorkspaceModalProps {
  open: boolean;
  currentOrganizationId: string;
  memberships: AuthOrganization[];
  onClose: () => void;
  onSwitch: (organizationId: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
}

export function WorkspaceModal({
  open,
  currentOrganizationId,
  memberships,
  onClose,
  onSwitch,
  onCreate,
}: WorkspaceModalProps) {
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitch = async (organizationId: string) => {
    setSwitchingId(organizationId);
    try {
      await onSwitch(organizationId);
      onClose();
    } finally {
      setSwitchingId(null);
    }
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setCreating(true);
    setError(null);
    try {
      await onCreate(trimmedName);
      setName("");
      onClose();
    } catch {
      setError("The workspace could not be created. Check the name and try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal title="Switch workspace" open={open} onCancel={onClose} footer={null}>
      <List
        dataSource={memberships}
        renderItem={(membership) => {
          const active = membership.id === currentOrganizationId;
          return (
            <List.Item
              actions={[
                active ? (
                  <Tag key="active" color="blue" icon={<CheckOutlined />}>Current</Tag>
                ) : (
                  <Button
                    key="switch"
                    size="small"
                    loading={switchingId === membership.id}
                    onClick={() => void handleSwitch(membership.id)}
                  >
                    Switch
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                title={membership.name}
                description={<Text type="secondary">{membership.role}</Text>}
              />
            </List.Item>
          );
        }}
      />
      <Divider>Create a workspace</Divider>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          aria-label="Workspace name"
          placeholder="Workspace name"
          value={name}
          maxLength={200}
          onChange={(event) => setName(event.target.value)}
          onPressEnter={() => void handleCreate()}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={creating}
          disabled={!name.trim()}
          onClick={() => void handleCreate()}
        >
          Create
        </Button>
      </div>
    </Modal>
  );
}
