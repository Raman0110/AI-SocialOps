import { useState } from "react";
import type { FormEvent } from "react";

interface ReplyBoxProps {
  disabled?: boolean;
  onSend: (message: string) => Promise<void>;
}

export function ReplyBox({
  disabled = false,
  onSend,
}: ReplyBoxProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const content = message.trim();

    if (!content || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      await onSend(content);

      setMessage("");
    } catch {
      setError("Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white p-4"
    >
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Type a reply..."
          disabled={disabled || sending}
          rows={3}
          className="min-h-24 flex-1 resize-none rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />

        <button
          type="submit"
          disabled={
            disabled ||
            sending ||
            !message.trim()
          }
          className="h-10 self-end rounded-md bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {error && (
        <p className="mb-0 mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
