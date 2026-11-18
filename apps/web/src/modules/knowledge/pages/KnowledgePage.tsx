import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Form, Input, Popconfirm, Spin, Typography, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  defaultKnowledgeDataSource,
  type KnowledgeDataSource,
} from "../services/knowledgeDataSource";
import {
  KNOWLEDGE_CONTENT_MAX_LENGTH,
  KNOWLEDGE_TITLE_MAX_LENGTH,
  type CreateKnowledgeEntryInput,
  type KnowledgeEntry,
} from "../types/knowledge";

const { Paragraph, Text, Title } = Typography;

interface KnowledgePageProps {
  dataSource?: KnowledgeDataSource;
}

export function KnowledgePage({ dataSource = defaultKnowledgeDataSource }: KnowledgePageProps) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm<CreateKnowledgeEntryInput>();
  const [messageApi, contextHolder] = message.useMessage();

  const filteredEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return entries;

    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(term) || entry.content.toLowerCase().includes(term),
    );
  }, [entries, searchTerm]);

  useEffect(() => {
    async function loadEntries() {
      try {
        setLoading(true);
        setEntries(await dataSource.getKnowledgeEntries());
      } catch {
        setError("Unable to load the knowledge base.");
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, [dataSource]);

  async function handleCreate(values: CreateKnowledgeEntryInput) {
    try {
      setSaving(true);
      const created = await dataSource.createKnowledgeEntry(values);
      setEntries((current) =>
        [...current, created].sort((a, b) => a.title.localeCompare(b.title)),
      );
      form.resetFields();
      messageApi.success("Knowledge entry added.");
    } catch {
      messageApi.error("Unable to add the entry. Admin access is required.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await dataSource.deleteKnowledgeEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
      messageApi.success("Knowledge entry deleted.");
    } catch {
      messageApi.error("Unable to delete the entry. Admin access is required.");
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spin description="Loading knowledge base..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Alert showIcon type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-slate-100 p-4">
      {contextHolder}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4">
          <Title level={4} className="mb-1">
            Business knowledge
          </Title>
          <Text type="secondary">
            {filteredEntries.length} of {entries.length} entries the AI agent can answer from
          </Text>

          <Input.Search
            className="mt-4"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search entries"
            allowClear
          />

          <div className="mt-4 flex flex-col gap-3">
            {filteredEntries.length === 0 ? (
              <Empty description="No knowledge entries yet" />
            ) : (
              filteredEntries.map((entry) => (
                <article key={entry.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <Text strong>{entry.title}</Text>
                    <Popconfirm
                      title="Delete this entry?"
                      okText="Delete"
                      onConfirm={() => handleDelete(entry.id)}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        aria-label={`Delete ${entry.title}`}
                      />
                    </Popconfirm>
                  </div>
                  <Paragraph className="mb-0 mt-1 whitespace-pre-wrap" type="secondary">
                    {entry.content}
                  </Paragraph>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 self-start rounded-md border border-slate-200 bg-white p-4">
          <Title level={5} className="mb-3">
            Add entry
          </Title>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, whitespace: true, message: "Title is required" }]}
            >
              <Input maxLength={KNOWLEDGE_TITLE_MAX_LENGTH} placeholder="e.g. Refund policy" />
            </Form.Item>
            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, whitespace: true, message: "Content is required" }]}
            >
              <Input.TextArea
                rows={6}
                maxLength={KNOWLEDGE_CONTENT_MAX_LENGTH}
                showCount
                placeholder="What should the agent tell customers?"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
              Add entry
            </Button>
          </Form>
        </section>
      </div>
    </div>
  );
}
