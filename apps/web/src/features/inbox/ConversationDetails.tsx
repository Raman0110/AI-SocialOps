import type {
  ConversationDetails as ConversationDetailsType,
} from "../../types/conversations";
import {
  MessageDirection,
  MessageSenderTypeLabel,
} from "../../types/conversations";
import type { AnalysisState } from "./InboxPage";
import { ReplyBox } from "./ReplayBox";

interface ConversationDetailsProps {
  conversation: ConversationDetailsType | null;
  onSendMessage: (content: string) => Promise<void>;
  analysisState: AnalysisState;
  onAnalyze: () => Promise<void>;
}

export function ConversationDetails({
  conversation,
  onSendMessage,
  analysisState,
  onAnalyze
}: ConversationDetailsProps) {
  if (!conversation) {
    return (
      <div className="grid h-full min-h-screen place-items-center px-6 text-sm font-medium text-slate-500">
        Select a conversation.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-950">
          {conversation.customerName}
        </h2>

        <div className="mt-1 text-sm text-slate-600">
          {conversation.platform} / {conversation.username}
        </div>

        <div className="mt-2 text-xs text-slate-500">
          Company account: {conversation.socialAccountName}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          Status: {conversation.status}
        </div>
      </header>

      <section
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>AI Analysis</strong>

          <button
            onClick={onAnalyze}
            disabled={analysisState.isLoading}
          >
            {analysisState.isLoading
              ? "Analyzing..."
              : "Analyze with AI"}
          </button>
        </div>

        {analysisState.error && (
          <p>{analysisState.error}</p>
        )}

        {analysisState.data && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(5, minmax(0, 1fr))",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <div>
              <small>Intent</small>
              <div>
                <strong>
                  {analysisState.data.intent}
                </strong>
              </div>
            </div>

            <div>
              <small>Sentiment</small>
              <div>
                <strong>
                  {analysisState.data.sentiment}
                </strong>
              </div>
            </div>

            <div>
              <small>Priority</small>
              <div>
                <strong>
                  {analysisState.data.priority}
                </strong>
              </div>
            </div>

            <div>
              <small>Risk</small>
              <div>
                <strong>
                  {analysisState.data.risk}
                </strong>
              </div>
            </div>

            <div>
              <small>Confidence</small>
              <div>
                <strong>
                  {Math.round(
                    analysisState.data.confidence * 100
                  )}
                  %
                </strong>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {conversation.messages.map((message) => {
          const isCustomer = message.direction === MessageDirection.Inbound;

          return (
            <div
              key={message.id}
              className={`mb-4 flex ${isCustomer ? "justify-start" : "justify-end"
                }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${isCustomer
                  ? "bg-white text-slate-900"
                  : "bg-sky-600 text-white"
                  }`}
              >
                <small
                  className={`text-xs font-medium ${isCustomer ? "text-slate-500" : "text-sky-100"
                    }`}
                >
                  {MessageSenderTypeLabel[message.senderType]}
                </small>

                <div className="mt-1 text-sm leading-6">
                  {message.content}
                </div>

                <small
                  className={`mt-2 block text-xs ${isCustomer ? "text-slate-400" : "text-sky-100"
                    }`}
                >
                  {new Date(
                    message.sentAt
                  ).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      <ReplyBox
        onSend={onSendMessage}
      />
    </div>
  );
}
