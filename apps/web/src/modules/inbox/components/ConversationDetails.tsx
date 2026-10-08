import { Alert, Button, Card, Empty, Space, Statistic, Tag, Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import type { ConversationDetails as ConversationDetailsType } from "../types/conversations";
import { MessageDirection, MessageSenderTypeLabel } from "../types/conversations";
import { AgentActionsPanel } from "./AgentActionPanel";
import type { AgentActionsState, AgentReplyState, AnalysisState } from "../pages/InboxPage";
import { ReplyBox } from "./ReplyBox";

const { Text, Title } = Typography;

interface ConversationDetailsProps {
  conversation: ConversationDetailsType | null;
  onSendMessage: (content: string) => Promise<void>;
  analysisState: AnalysisState;
  onAnalyze: () => Promise<void>;
  agentReplyState: AgentReplyState;
  onSuggestReply: () => Promise<void>;
  onApproveAction: (actionId: string) => Promise<void>;
  onRejectAction: (actionId: string) => Promise<void>;
  agentActionsState: AgentActionsState;
}

export function ConversationDetails({
  conversation,
  onSendMessage,
  analysisState,
  onAnalyze,
  agentReplyState,
  onSuggestReply,
  onApproveAction,
  onRejectAction,
  agentActionsState,
}: ConversationDetailsProps) {
  if (!conversation) {
    return (
      <div className="grid h-full min-h-screen place-items-center px-6">
        <Empty description="Select a conversation." />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="app-panel-shadow border-b border-slate-200 bg-white px-6 py-4">
        <Space className="w-full justify-between" align="start">
          <div>
            <Title level={4} className="mb-1">
              {conversation.customerName}
            </Title>
            <Space wrap>
              <Tag color="blue">{conversation.platform}</Tag>
              <Text type="secondary">{conversation.username}</Text>
              <Text type="secondary">
                Company account: {conversation.socialAccountName}
              </Text>
            </Space>
          </div>

          <Tag color={conversation.status === "Escalated" ? "red" : "processing"}>
            {conversation.status}
          </Tag>
        </Space>
      </header>

      <section className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card
            className="app-card-shadow"
            size="small"
            title="AI Analysis"
            extra={
              <Button
                icon={<RobotOutlined />}
                onClick={onAnalyze}
                loading={analysisState.isLoading}
              >
                Analyze with AI
              </Button>
            }
          >
            {analysisState.error && (
              <Alert showIcon type="error" message={analysisState.error} />
            )}

            {!analysisState.data && !analysisState.error && (
              <Empty description="Run analysis to classify the latest inbound message." />
            )}

            {analysisState.data && (
              <div className="grid gap-4 md:grid-cols-5">
                <Statistic title="Intent" value={analysisState.data.intent} />
                <Statistic title="Sentiment" value={analysisState.data.sentiment} />
                <Statistic title="Priority" value={analysisState.data.priority} />
                <Statistic title="Risk" value={analysisState.data.risk} />
                <Statistic
                  title="Confidence"
                  value={Math.round(analysisState.data.confidence * 100)}
                  suffix="%"
                />
              </div>
            )}
          </Card>

          <AgentActionsPanel
            actions={agentActionsState.data}
            isLoading={agentActionsState.isLoading}
            error={agentActionsState.error}
            onApprove={onApproveAction}
            onReject={onRejectAction}
          />
        </div>
      </section>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {conversation.messages.map((message) => {
          const isCustomer = message.direction === MessageDirection.Inbound;

          return (
            <div
              key={message.id}
              className={`mb-4 flex ${isCustomer ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${
                  isCustomer ? "bg-white text-slate-900" : "bg-sky-600 text-white"
                }`}
              >
                <small
                  className={`text-xs font-medium ${
                    isCustomer ? "text-slate-500" : "text-sky-100"
                  }`}
                >
                  {MessageSenderTypeLabel[message.senderType]}
                </small>

                <div className="mt-1 text-sm leading-6">
                  {message.content}
                </div>

                <small
                  className={`mt-2 block text-xs ${
                    isCustomer ? "text-slate-400" : "text-sky-100"
                  }`}
                >
                  {new Date(message.sentAt).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      <ReplyBox
        key={conversation.id}
        suggestedReply={agentReplyState.data?.reply ?? null}
        isGeneratingReply={agentReplyState?.isLoading}
        onGenerateReply={onSuggestReply}
        onSend={onSendMessage}
      />
    </div>
  );
}
