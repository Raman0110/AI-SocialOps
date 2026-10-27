import { ThunderboltOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import { useState } from "react";

const { Text } = Typography;

interface ReplyBoxProps {
  disabled?: boolean;
  disabledHint?: string;
  suggestedReply: string | null;
  isGeneratingReply: boolean;
  onGenerateReply: () => Promise<void>;
  onSend: (message: string) => Promise<void>;
}

export function ReplyBox({
  disabled = false,
  disabledHint,
  onSend,
  suggestedReply,
  isGeneratingReply,
  onGenerateReply,
}: ReplyBoxProps) {
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const message = draftMessage ?? suggestedReply ?? "";

  async function handleSubmit() {
    const content = message.trim();

    if (!content || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      await onSend(content);

      setDraftMessage("");
    } catch {
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="app-header-shadow border-t border-slate-200 bg-white p-4">
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item className="mb-3">
          <Input.TextArea
            value={message}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder="Type a reply..."
            disabled={disabled || sending}
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Space className="w-full justify-between" align="center">
          <Text type={error ? "danger" : "secondary"}>
            {error ?? (disabled && disabledHint ? disabledHint : "Use AI to draft, then review before sending.")}
          </Text>

          <Space>
            <Button
              icon={<ThunderboltOutlined />}
              onClick={onGenerateReply}
              disabled={disabled || sending || isGeneratingReply}
              loading={isGeneratingReply}
            >
              Generate AI Reply
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              disabled={disabled || sending || !message.trim()}
              loading={sending}
            >
              Send
            </Button>
          </Space>
        </Space>
      </Form>
    </div>
  );
}
