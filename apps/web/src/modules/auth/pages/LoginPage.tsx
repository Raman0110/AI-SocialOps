import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import type { LoginInput } from "../types/auth";

const { Paragraph, Text, Title } = Typography;

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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-7">
          <Text className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            AI SocialOps
          </Text>
          <Title level={2} className="mb-2 mt-3">Sign in to your workspace</Title>
          <Paragraph type="secondary" className="mb-0">
            Your organization and permissions are loaded from your membership.
          </Paragraph>
        </div>

        {error && <Alert className="mb-5" type="error" showIcon message={error} />}

        <Form<LoginInput> layout="vertical" onFinish={(values) => void handleSubmit(values)}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input size="large" prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              autoComplete="current-password"
            />
          </Form.Item>
          <Button block size="large" type="primary" htmlType="submit" loading={loading}>
            Sign in
          </Button>
        </Form>
      </section>
    </main>
  );
}
