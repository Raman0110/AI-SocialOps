import type {
  ConversationDetails as ConversationDetailsType,
} from "../../types/conversations";

interface ConversationDetailsProps {
  conversation: ConversationDetailsType | null;
}

export function ConversationDetails({
  conversation,
}: ConversationDetailsProps) {
  if (!conversation) {
    return (
      <div style={{ padding: "24px" }}>
        Select a conversation.
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <header
        style={{
          borderBottom: "1px solid #ddd",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <h2>{conversation.customerName}</h2>

        <div>
          {conversation.platform} · {conversation.username}
        </div>

        <div>
          Company account: {conversation.socialAccountName}
        </div>

        <div>
          Status: {conversation.status}
        </div>
      </header>

      <div>
        {conversation.messages.map((message) => {
          const isCustomer =
            message.direction === "Inbound";

          return (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent: isCustomer
                  ? "flex-start"
                  : "flex-end",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: isCustomer
                    ? "#eeeeee"
                    : "#dceeff",
                }}
              >
                <small>
                  {message.senderType}
                </small>

                <div>{message.content}</div>

                <small>
                  {new Date(
                    message.sentAt
                  ).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}