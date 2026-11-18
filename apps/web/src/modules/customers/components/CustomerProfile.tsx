import {
  AuditOutlined,
  CommentOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Button, Card, Descriptions, Empty, Space, Statistic, Table, Tag, Timeline, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Customer, CustomerConversationSummary, CustomerSocialIdentity } from "../types/customers";

const { Paragraph, Text, Title } = Typography;

interface CustomerProfileProps {
  customer: Customer | null;
  onOpenInbox: () => void;
}

export function CustomerProfile({ customer, onOpenInbox }: CustomerProfileProps) {
  if (!customer) {
    return (
      <div className="grid h-full place-items-center p-8">
        <Empty description="Select a customer to view their profile." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Space wrap className="mb-2">
              <Title level={3} className="mb-0">
                {customer.name}
              </Title>
              <Tag color={segmentColors[customer.segment]}>{customer.segment}</Tag>
              <Tag color={statusColors[customer.status]}>{customer.status}</Tag>
            </Space>
            <Space wrap size={[16, 6]} className="text-slate-600">
              <Text type="secondary">
                <MailOutlined /> {customer.email}
              </Text>
              {customer.phone && (
                <Text type="secondary">
                  <PhoneOutlined /> {customer.phone}
                </Text>
              )}
              <Text type="secondary">
                <EnvironmentOutlined /> {customer.location}
              </Text>
            </Space>
          </div>

          <Button type="primary" icon={<CommentOutlined />} onClick={onOpenInbox}>
            Open conversations
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card size="small" className="">
            <Statistic
              title="Lifetime value"
              value={customer.lifetimeValue}
              prefix={<DollarOutlined />}
              precision={0}
            />
          </Card>
          <Card size="small" className="">
            <Statistic title="Conversations" value={customer.totalConversations} />
          </Card>
          <Card size="small" className="">
            <Statistic title="Connected identities" value={customer.socialIdentities.length} />
          </Card>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <section className="space-y-4">
          <Card title="Customer context" className="">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Primary segment">{customer.segment}</Descriptions.Item>
              <Descriptions.Item label="Last seen">
                {formatDateTime(customer.lastSeenAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                <Space wrap>
                  {customer.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>
            <Paragraph className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              {customer.notes}
            </Paragraph>
          </Card>

          <Card title="Recent conversations" className="">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              columns={conversationColumns}
              dataSource={customer.conversations}
            />
          </Card>

          <Card title="Social identities" className="">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              columns={identityColumns}
              dataSource={customer.socialIdentities}
            />
          </Card>
        </section>

        <section className="space-y-4">
          <Card title="Activity timeline" className="">
            <Timeline
              items={customer.activity.map((item) => ({
                content: (
                  <div>
                    <Text strong>{item.title}</Text>
                    <Text type="secondary" className="block text-xs">
                      {formatDateTime(item.createdAt)}
                    </Text>
                    <Text className="block text-sm text-slate-600">{item.description}</Text>
                  </div>
                ),
              }))}
            />
          </Card>
        </section>
      </div>
    </div>
  );
}

const identityColumns: ColumnsType<CustomerSocialIdentity> = [
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: CustomerSocialIdentity["platform"]) => (
      <Tag color={platformColors[platform]}>{platform}</Tag>
    ),
  },
  {
    title: "Username",
    dataIndex: "username",
  },
  {
    title: "External account",
    dataIndex: "externalAccountId",
    render: (value: string) => <Text code>{value}</Text>,
  },
  {
    title: "Company account",
    dataIndex: "socialAccountName",
  },
  {
    title: "Type",
    dataIndex: "isPrimary",
    render: (isPrimary: boolean) => (
      <Tag icon={<IdcardOutlined />} color={isPrimary ? "blue" : "default"}>
        {isPrimary ? "Primary" : "Linked"}
      </Tag>
    ),
  },
];

const conversationColumns: ColumnsType<CustomerConversationSummary> = [
  {
    title: "Topic",
    dataIndex: "topic",
  },
  {
    title: "Platform",
    dataIndex: "platform",
    render: (platform: CustomerConversationSummary["platform"]) => (
      <Tag color={platformColors[platform]}>{platform}</Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: CustomerConversationSummary["status"]) => (
      <Tag color={conversationStatusColors[status]}>{status}</Tag>
    ),
  },
  {
    title: "Last message",
    dataIndex: "lastMessageAt",
    render: (value: string) => (
      <Text type="secondary">
        <AuditOutlined /> {formatDateTime(value)}
      </Text>
    ),
  },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

const platformColors: Record<CustomerSocialIdentity["platform"], string> = {
  Instagram: "magenta",
  Facebook: "blue",
  X: "default",
  TikTok: "purple",
  WhatsApp: "green",
};

const statusColors: Record<Customer["status"], string> = {
  Active: "processing",
  "Needs attention": "error",
  Resolved: "success",
};

const segmentColors: Record<Customer["segment"], string> = {
  VIP: "gold",
  "Repeat buyer": "blue",
  "New lead": "green",
  "At risk": "red",
};

const conversationStatusColors: Record<CustomerConversationSummary["status"], string> = {
  Open: "processing",
  Pending: "warning",
  Resolved: "success",
  Escalated: "error",
};
