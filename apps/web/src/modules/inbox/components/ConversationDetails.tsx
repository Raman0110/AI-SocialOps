import { Alert, Button, Card, Space, Spin, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CloseOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { ConversationDetails as ConversationDetailsType } from "../types/conversations";
import type { ConversationMessage } from "../types/conversations";
import {
  MessageDeliveryStatus,
  MessageDirection,
  MessageSenderTypeLabel,
} from "../types/conversations";
import { AgentActionsPanel } from "./AgentActionPanel";
import type { AgentActionsState, AgentReplyState, AnalysisState } from "../pages/InboxPage";
import { ReplyBox } from "./ReplyBox";

const { Text, Title } = Typography;

type AiPanel = "analysis" | "actions" | null;

interface ConversationDetailsProps {
  conversation: ConversationDetailsType | null;
  onBack: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onRetryMessage?: (messageId: string) => Promise<void>;
  analysisState: AnalysisState;
  onAnalyze: () => Promise<void>;
  agentReplyState: AgentReplyState;
  onSuggestReply: () => Promise<void>;
  onApproveAction: (actionId: string) => Promise<void>;
  onRejectAction: (actionId: string) => Promise<void>;
  agentActionsState: AgentActionsState;
  mutationsEnabled?: boolean;
}

export function ConversationDetails({
  conversation,
  onBack,
  onSendMessage,
  onRetryMessage,
  analysisState,
  onAnalyze,
  agentReplyState,
  onSuggestReply,
  onApproveAction,
  onRejectAction,
  agentActionsState,
  mutationsEnabled = true,
}: ConversationDetailsProps) {
  const [activeAiPanel, setActiveAiPanel] = useState<AiPanel>(null);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<{ messageId: string; text: string } | null>(null);

  async function handleRetry(messageId: string) {
    if (!onRetryMessage || retryingMessageId) {
      return;
    }

    try {
      setRetryingMessageId(messageId);
      setRetryError(null);

      await onRetryMessage(messageId);
    } catch {
      setRetryError({ messageId, text: "Unable to retry sending. Try again." });
    } finally {
      setRetryingMessageId(null);
    }
  }

  if (!conversation) {
    return (
      <div className="grid h-full place-items-center px-6">
        <Spin description="Loading conversation..." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-slate-50/60">
      <div className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-3 sm:px-5">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          aria-label="Back to inbox"
        >
          <span className="hidden sm:inline">Back to inbox</span>
        </Button>
      </div>

      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
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

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-5xl">
              {conversation.messages.map((message) => {
                const isCustomer = message.direction === MessageDirection.Inbound;
                const isFailed =
                  !isCustomer && message.deliveryStatus === MessageDeliveryStatus.Failed;

                return (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${isCustomer ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-md px-4 py-3 sm:max-w-[70%] ${isCustomer
                        ? "rounded-tl-md border border-slate-200 bg-white text-slate-900"
                        : isFailed
                          ? "rounded-tr-md border border-red-200 bg-red-50 text-slate-900"
                          : "rounded-tr-md bg-slate-800 text-white"
                        }`}
                    >
                      <small
                        className={`text-xs font-medium ${isCustomer || isFailed ? "text-slate-500" : "text-slate-300"
                          }`}
                      >
                        {MessageSenderTypeLabel[message.senderType]}
                      </small>

                      <div className="mt-1 text-sm leading-6">
                        {message.content}
                      </div>

                      <small
                        className={`mt-2 block text-xs ${isCustomer || isFailed ? "text-slate-400" : "text-slate-300"
                          }`}
                      >
                        {new Date(message.sentAt).toLocaleString()}
                      </small>

                      {!isCustomer && (
                        <DeliveryStatusLine
                          message={message}
                          isRetrying={retryingMessageId === message.id}
                          canRetry={Boolean(onRetryMessage) && !retryingMessageId}
                          retryError={retryError?.messageId === message.id ? retryError.text : null}
                          onRetry={() => handleRetry(message.id)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <ReplyBox
            key={conversation.id}
            suggestedReply={agentReplyState.data?.reply ?? null}
            isGeneratingReply={agentReplyState?.isLoading}
            onGenerateReply={onSuggestReply}
            onSend={onSendMessage}
            disabled={!mutationsEnabled}
            disabledHint="Live inbox reads are enabled. Reply and AI actions will be connected next."
          />
        </div>

        <aside
          className={`absolute inset-y-0 right-0 z-20 flex border-l border-slate-200 bg-white transition-[width] duration-200 lg:static lg:z-auto lg:shadow-none ${activeAiPanel ? "w-95 max-w-[92vw]" : "w-14"
            }`}
        >
          <div className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-slate-50 py-3">
            <Button
              type={activeAiPanel === "analysis" ? "primary" : "text"}
              shape="circle"
              icon={<RobotOutlined />}
              aria-label="Open AI analysis"
              title="AI analysis"
              onClick={() => setActiveAiPanel((current) => current === "analysis" ? null : "analysis")}
            />

            <div className="relative">
              <Button
                type={activeAiPanel === "actions" ? "primary" : "text"}
                shape="circle"
                icon={<BulbOutlined />}
                aria-label="Open AI suggested actions"
                title="Suggested actions"
                onClick={() => setActiveAiPanel((current) => current === "actions" ? null : "actions")}
              />
              {agentActionsState.data.length > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {agentActionsState.data.length}
                </span>
              )}
            </div>
          </div>

          {activeAiPanel && (
            <div className="min-w-0 flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Title level={5} className="m-0">
                  {activeAiPanel === "analysis" ? "AI Analysis" : "Suggested Actions"}
                </Title>
                <Button
                  type="text"
                  shape="circle"
                  icon={<CloseOutlined />}
                  aria-label="Close AI panel"
                  onClick={() => setActiveAiPanel(null)}
                />
              </div>

              {activeAiPanel === "analysis" ? (
                <AiAnalysisPanel
                  analysisState={analysisState}
                  onAnalyze={onAnalyze}
                  disabled={!mutationsEnabled}
                />
              ) : (
                <AgentActionsPanel
                  actions={agentActionsState.data}
                  isLoading={agentActionsState.isLoading}
                  error={agentActionsState.error}
                  onApprove={onApproveAction}
                  onReject={onRejectAction}
                />
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DeliveryStatusLine({
  message,
  isRetrying,
  canRetry,
  retryError,
  onRetry,
}: {
  message: ConversationMessage;
  isRetrying: boolean;
  canRetry: boolean;
  retryError: string | null;
  onRetry: () => void;
}) {
  if (message.deliveryStatus === MessageDeliveryStatus.Pending) {
    return <small className="mt-1 block text-xs text-slate-300">Sending...</small>;
  }

  if (message.deliveryStatus === MessageDeliveryStatus.Sent) {
    return <small className="mt-1 block text-xs text-slate-300">Sent</small>;
  }

  if (message.deliveryStatus !== MessageDeliveryStatus.Failed) {
    return null;
  }

  return (
    <div role="alert" className="mt-2 border-t border-red-200 pt-2 text-xs text-red-700">
      <span className="font-semibold">Failed to send</span>
      {message.deliveryError ? <span>: {message.deliveryError}</span> : null}

      <div className="mt-2">
        <Button
          size="small"
          danger
          loading={isRetrying}
          disabled={!canRetry && !isRetrying}
          onClick={onRetry}
        >
          Retry sending
        </Button>
        {retryError ? <span className="ml-2">{retryError}</span> : null}
      </div>
    </div>
  );
}

function AiAnalysisPanel({
  analysisState,
  onAnalyze,
  disabled,
}: {
  analysisState: AnalysisState;
  onAnalyze: () => Promise<void>;
  disabled: boolean;
}) {
  if (analysisState.error) {
    return (
      <div className="space-y-3">
        <Alert showIcon type="error" title={analysisState.error} />
        <Button block icon={<RobotOutlined />} onClick={onAnalyze} disabled={disabled}>
          Try analysis again
        </Button>
      </div>
    );
  }

  if (!analysisState.data) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-md bg-slate-100 text-lg text-slate-700">
          <RobotOutlined />
        </div>
        <Title level={5} className="mb-1">
          Understand this conversation
        </Title>
        <Text type="secondary" className="block text-sm leading-6">
          Detect customer intent, sentiment, urgency, and risk from the latest message.
        </Text>
        <Button
          type="primary"
          className="mt-5"
          icon={<RobotOutlined />}
          onClick={onAnalyze}
          loading={analysisState.isLoading}
          disabled={disabled}
        >
          Analyze conversation
        </Button>
      </div>
    );
  }

  const confidence = Math.round(analysisState.data.confidence * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Text type="secondary" className="block text-xs font-semibold uppercase tracking-[0.12em]">
              Analysis confidence
            </Text>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {confidence}%
            </div>
            <Text type="secondary" className="mt-1 block text-xs">
              Updated {formatAnalysisTime(analysisState.data.analyzedAt)}
            </Text>
          </div>
          <Text className="text-sm font-medium text-blue-600">
            {confidenceLabel(confidence)}
          </Text>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnalysisMetric
          label="Intent"
          value={humanizeAnalysisValue(analysisState.data.intent)}
        />
        <AnalysisMetric
          label="Sentiment"
          value={humanizeAnalysisValue(analysisState.data.sentiment)}
        />
        <AnalysisMetric
          label="Priority"
          value={humanizeAnalysisValue(analysisState.data.priority)}
        />
        <AnalysisMetric
          label="Risk"
          value={humanizeAnalysisValue(analysisState.data.risk)}
        />
      </div>

      <Card size="small" className="border-slate-200 bg-slate-50/80 shadow-none">
        <Text strong className="block text-sm">About this analysis</Text>
        <Text type="secondary" className="mt-1 block text-xs leading-5">
          This classification is based on the latest inbound message. Review the full thread before taking action.
        </Text>
      </Card>

      <div className="border-t border-slate-200 pt-4">
        <Button
          block
          icon={<RobotOutlined />}
          onClick={onAnalyze}
          loading={analysisState.isLoading}
          disabled={disabled}
        >
          Analyze again
        </Button>
      </div>
    </div>
  );
}

function AnalysisMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <Text type="secondary" className="block text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </Text>
      <span className="mt-2 block truncate text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function humanizeAnalysisValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAnalysisTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function confidenceLabel(confidence: number) {
  if (confidence >= 80) return "High confidence";
  if (confidence >= 60) return "Moderate confidence";
  return "Low confidence";
}
