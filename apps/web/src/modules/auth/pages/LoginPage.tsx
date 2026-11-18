import { LockOutlined, MailOutlined } from "../../../shared/icons";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import type { LoginInput } from "../types/auth";

interface LoginPageProps {
  onLogin: (input: LoginInput) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginInput) => {
    setLoading(true);
    setError(null);

    try {
      await onLogin(values);
    } catch {
      setError("The email or password is incorrect, or the account is inactive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow m-0">AI SocialOps</p>
          <h1 className="m-0 mt-3 text-xl font-semibold tracking-tight text-fg">
            Sign in to your workspace
          </h1>
          <p className="m-0 mt-1 text-[13px] text-fg-muted">
            Your organization and permissions are loaded from your membership.
          </p>

          {error && <Alert className="mt-6" type="error" showIcon message={error} />}

          <Form<LoginInput> layout="vertical" requiredMark={false} className="mt-6" onFinish={(values) => void handleSubmit(values)}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true }, { type: "email" }]}
            >
              <Input prefix={<MailOutlined className="text-fg-subtle" />} autoComplete="email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-fg-subtle" />}
                autoComplete="current-password"
              />
            </Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              Sign in
            </Button>
          </Form>
        </div>
      </section>

      {/* Product context pane: quiet, left-aligned, desktop only */}
      <aside className="hidden border-l border-line bg-sidebar lg:flex lg:items-center lg:px-16">
        <div className="max-w-md">
          <p className="eyebrow m-0">What you can do here</p>
          <dl className="m-0 mt-5 space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="border-t border-line pt-4">
                <dt className="text-[13px] font-medium text-fg">{item.title}</dt>
                <dd className="m-0 mt-0.5 text-[13px] text-fg-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </main>
  );
}

const highlights = [
  { title: "Unified inbox", body: "Customer conversations from every connected social account in one queue." },
  { title: "Reviewed AI actions", body: "Generated replies and ticket proposals wait for approval before they reach a customer." },
  { title: "Agent run history", body: "Every tool call, latency and failure is recorded and inspectable." },
];
