import { Alert, Button } from "antd";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CloseOutlined,
  RobotOutlined,
} from "../../../shared/icons";
import { useState } from "react";
import { PlatformBadge, Skeleton, StatusBadge } from "../../../shared/ui";
import type { ConversationDetails as ConversationDetailsType } from "../types/conversations";
import type { ConversationMessage } from "../types/conversations";
import {
  MessageDeliveryStatus,
  MessageDirection,
  MessageSenderType,
  MessageSenderTypeLabel,
} from "../types/conversations";
import { AgentActionsPanel } from "./AgentActionPanel";
import type { AgentActionsState, AgentReplyState, AnalysisState } from "../pages/InboxPage";
import { ReplyBox } from "./ReplyBox";

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

/** Consecutive messages from the same sender are rendered as one group. */
function groupMessages(messages: ConversationMessage[]) {
  const groups: Array<{ senderType: MessageSenderType; messages: ConversationMessage[] }> = [];

  for (const message of messages) {
    const last = groups[groups.length - 1];
    if (last && last.senderType === message.senderType) {
      last.messages.push(message);
    } else {
      groups.push({ senderType: message.senderType, messages: [message] });
    }
  }

  return groups;
}

const iconButton =
  "grid size-8 shrink-0 place-items-center rounded-md text-base transition-colors duration-150";

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
      <div className="space-y-3 p-6" role="status" aria-busy="true">
        <span className="sr-only">Loading conversation...</span>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="ml-auto h-12 w-1/2" />
      </div>
    );
  }

  const groups = groupMessages(conversation.messages);

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header: back, who, where, state */}
      <header className="shrink-0 border-b border-line bg-surface px-3 py-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            aria-label="Back to inbox"
          >
            <span className="hidden sm:inline">Back to inbox</span>
          </Button>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full bg-inset text-xs font-medium text-fg-secondary"
          >
            {conversation.customerName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="m-0 truncate text-sm font-semibold text-fg">{conversation.customerName}</h2>
              <PlatformBadge platform={conversation.platform} />
            </div>
            <p className="m-0 truncate text-xs text-fg-muted">
              {conversation.username} · Company account: {conversation.socialAccountName}
            </p>
          </div>
          <StatusBadge status={conversation.status} />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {/* Thread + composer: only the message list scrolls */}
        <div className="flex min-w-0 flex-1 flex-col bg-canvas">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-5">
              {groups.map((group) => {
                const isCustomer = group.messages[0].direction === MessageDirection.Inbound;
                const isAi = group.senderType === MessageSenderType.AiAgent;
                const first = group.messages[0];

                return (
                  <section
                    key={first.id}
                    className={`flex gap-2.5 ${isCustomer ? "" : "flex-row-reverse"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium ${
                        isAi
                          ? "bg-selected text-accent-fg"
                          : isCustomer
                            ? "bg-inset text-fg-secondary"
                            : "bg-bubble text-fg-secondary"
                      }`}
                    >
                      {isAi ? <RobotOutlined /> : isCustomer ? conversation.customerName.slice(0, 1).toUpperCase() : "A"}
                    </span>

                    <div className={`flex min-w-0 max-w-[85%] flex-col gap-1 sm:max-w-[70%] ${isCustomer ? "items-start" : "items-end"}`}>
                      <div className={`flex items-baseline gap-2 text-xs ${isCustomer ? "" : "flex-row-reverse"}`}>
                        <span className="font-medium text-fg-secondary">
                          {MessageSenderTypeLabel[group.senderType]}
                        </span>
                        <time className="tnum text-fg-muted" dateTime={first.sentAt}>
                          {new Date(first.sentAt).toLocaleString()}
                        </time>
                      </div>

                      {group.messages.map((message) => {
                        const isFailed =
                          !isCustomer && message.deliveryStatus === MessageDeliveryStatus.Failed;

                        return (
                          <div
                            key={message.id}
                            title={new Date(message.sentAt).toLocaleString()}
                            className={`rounded-lg px-3 py-2 text-fg ${
                              isCustomer
                                ? "rounded-tl-sm border border-line bg-surface"
                                : isFailed
                                  ? "rounded-tr-sm border border-danger bg-red-50"
                                  : isAi
                                    ? "rounded-tr-sm border border-line bg-surface"
                                    : "rounded-tr-sm bg-bubble"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words text-[13px] leading-5">
                              {message.content}
                            </div>

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
                        );
                      })}
                    </div>
                  </section>
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

        {/* Inspector: icon rail + panel; overlays the thread on narrow screens */}
        <aside
          className={`absolute inset-y-0 right-0 z-20 flex border-l border-line bg-surface transition-[width] duration-150 lg:static lg:z-auto ${
            activeAiPanel ? "w-80 max-w-[92vw]" : "w-12"
          }`}
        >
          <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-line bg-sidebar py-2">
            <button
              type="button"
              aria-label="Open AI analysis"
              aria-pressed={activeAiPanel === "analysis"}
              title="AI analysis"
              onClick={() => setActiveAiPanel((current) => current === "analysis" ? null : "analysis")}
              className={`${iconButton} ${
                activeAiPanel === "analysis" ? "bg-selected text-accent-fg" : "text-fg-muted hover:bg-black/5 hover:text-fg"
              }`}
            >
              <RobotOutlined />
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label="Open AI suggested actions"
                aria-pressed={activeAiPanel === "actions"}
                title="Suggested actions"
                onClick={() => setActiveAiPanel((current) => current === "actions" ? null : "actions")}
                className={`${iconButton} ${
                  activeAiPanel === "actions" ? "bg-selected text-accent-fg" : "text-fg-muted hover:bg-black/5 hover:text-fg"
                }`}
              >
                <BulbOutlined />
              </button>
              {agentActionsState.data.length > 0 && (
                <span className="tnum pointer-events-none absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-semibold text-[var(--accent-contrast)]">
                  {agentActionsState.data.length}
                </span>
              )}
            </div>
          </div>

          {activeAiPanel && (
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
                <h2 className="m-0 text-sm font-semibold text-fg">
                  {activeAiPanel === "analysis" ? "AI Analysis" : "Suggested Actions"}
                </h2>
                <button
                  type="button"
                  aria-label="Close AI panel"
                  onClick={() => setActiveAiPanel(null)}
                  className={`${iconButton} !size-7 text-fg-muted hover:bg-black/5 hover:text-fg`}
                >
                  <CloseOutlined />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
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
    return <small className="mt-1 block text-xs text-fg-muted">Sending...</small>;
  }

  if (message.deliveryStatus === MessageDeliveryStatus.Sent) {
    return <small className="mt-1 block text-xs text-fg-muted">Sent</small>;
  }

  if (message.deliveryStatus !== MessageDeliveryStatus.Failed) {
    return null;
  }

  return (
    <div role="alert" className="mt-2 border-t border-red-200 pt-2 text-xs text-danger-text">
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
        <Button block size="small" icon={<RobotOutlined />} onClick={onAnalyze} disabled={disabled}>
          Try analysis again
        </Button>
      </div>
    );
  }

  if (!analysisState.data) {
    return (
      <div className="flex flex-col items-center px-2 py-8 text-center">
        <span aria-hidden="true" className="mb-2 flex text-lg text-fg-muted">
          <RobotOutlined />
        </span>
        <p className="m-0 text-xs text-fg-muted">
          Detect intent, sentiment, urgency and risk from the latest message.
        </p>
        <Button
          type="primary"
          size="small"
          className="mt-3"
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
    <div>
      {/* Confidence: one compact row with a thin meter */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Confidence</span>
          <span className="tnum text-sm font-semibold text-fg">{confidence}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between text-xs text-fg-muted">
          <span>{confidenceLabel(confidence)}</span>
          <span>Updated {formatAnalysisTime(analysisState.data.analyzedAt)}</span>
        </div>
      </div>

      <dl className="m-0 mt-4 divide-y divide-line border-y border-line">
        <AnalysisRow label="Intent">
          <span className="text-[13px] font-medium text-fg">
            {humanizeAnalysisValue(analysisState.data.intent)}
          </span>
        </AnalysisRow>
        <AnalysisRow label="Sentiment">
          <SentimentChip value={analysisState.data.sentiment} />
        </AnalysisRow>
        <AnalysisRow label="Urgency">
          <LevelMeter value={analysisState.data.priority} />
        </AnalysisRow>
        <AnalysisRow label="Risk">
          <LevelMeter value={analysisState.data.risk} />
        </AnalysisRow>
      </dl>

      <p className="m-0 mt-3 text-xs leading-5 text-fg-muted">
        Based on the latest inbound message. Review the full thread before acting.
      </p>

      <Button
        block
        size="small"
        className="mt-3"
        icon={<RobotOutlined />}
        onClick={onAnalyze}
        loading={analysisState.isLoading}
        disabled={disabled}
      >
        Analyze again
      </Button>
    </div>
  );
}

function AnalysisRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="m-0 min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

function levelOf(value: string): { level: 0 | 1 | 2 | 3; color: string } {
  const key = value.toLowerCase();
  if (/(high|urgent|critical)/.test(key)) return { level: 3, color: "bg-danger" };
  if (/(medium|moderate|normal)/.test(key)) return { level: 2, color: "bg-warning" };
  if (/low/.test(key)) return { level: 1, color: "bg-line-strong" };
  return { level: 0, color: "bg-line-strong" };
}

/** Three small segments plus the label; colour only on elevated levels. */
function LevelMeter({ value }: { value: string }) {
  const { level, color } = levelOf(value);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 w-3 rounded-full ${segment <= level ? color : "bg-inset"}`}
          />
        ))}
      </span>
      <span className="text-[13px] font-medium text-fg">{humanizeAnalysisValue(value)}</span>
    </span>
  );
}

function SentimentChip({ value }: { value: string }) {
  const key = value.toLowerCase();
  const dot = /(negative|angry|frustrat)/.test(key)
    ? "bg-danger"
    : /(positive|happy|satisf)/.test(key)
      ? "bg-success"
      : "bg-fg-muted";

  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />
      {humanizeAnalysisValue(value)}
    </span>
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
