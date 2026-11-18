import { Button, Form, Input } from "antd";
import { useState } from "react";
import { RobotOutlined } from "../../../shared/icons";
import { Badge } from "../../../shared/ui";

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
  // The text is an AI draft until the agent clears it (after sending).
  const isAiDraft = Boolean(suggestedReply) && draftMessage !== "" && message.length > 0;
  const isEdited = isAiDraft && draftMessage !== null && draftMessage !== suggestedReply;

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

  const hint =
    error ?? (disabled && disabledHint ? disabledHint : "Use AI to draft, then review before sending.");

  return (
    <div className="shrink-0 border-t border-line bg-canvas p-3 sm:px-5">
      <Form onFinish={handleSubmit}>
        {/* One rounded input with attached actions; AI drafts get a dashed edge and a label */}
        <div
          className={`rounded-lg bg-surface transition-colors duration-150 focus-within:border-accent ${
            isAiDraft ? "border border-dashed border-accent/60" : "border border-line-strong"
          }`}
        >
          {isAiDraft && (
            <div className="flex items-center gap-2 border-b border-dashed border-accent/30 px-3 pt-2 pb-1.5">
              <Badge tone="info" icon={<RobotOutlined />}>
                {isEdited ? "AI draft · edited" : "AI draft"}
              </Badge>
              <span className="text-xs text-fg-muted">Not sent yet. Review before sending.</span>
            </div>
          )}

          <Form.Item className="!mb-0">
            <Input.TextArea
              value={message}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Type a reply..."
              aria-label="Reply"
              disabled={disabled || sending}
              variant="borderless"
              autoSize={{ minRows: 2, maxRows: 8 }}
              className="!px-3 !pt-2.5 text-[13px]"
            />
          </Form.Item>

          <div className="flex items-center justify-between gap-3 px-2 pb-2">
            <Button
              type="text"
              size="small"
              icon={<RobotOutlined />}
              onClick={onGenerateReply}
              disabled={disabled || sending || isGeneratingReply}
              loading={isGeneratingReply}
            >
              Generate AI Reply
            </Button>

            <div className="flex min-w-0 items-center gap-3">
              <span
                role={error ? "alert" : undefined}
                className={`hidden min-w-0 truncate text-xs sm:block ${error ? "text-danger-text" : "text-fg-muted"}`}
              >
                {hint}
              </span>
              <Button
                type="primary"
                size="small"
                htmlType="submit"
                disabled={disabled || sending || !message.trim()}
                loading={sending}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
