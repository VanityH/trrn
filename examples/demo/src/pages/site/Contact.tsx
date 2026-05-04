import type { Ctx, RenderFn } from "trrn";
import { Button } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { FormField } from "../../components/ui/FormField.tsx";
import { submitContactForm } from "../../mock/api.ts";

export function ContactPage(_: unknown, { update }: Ctx): RenderFn {
  let name = "";
  let email = "";
  let message = "";
  let errors: Record<string, string> = {};
  let submitting = false;
  let submitted = false;
  let serverError: string | null = null;

  const validate = (): boolean => {
    errors = {};
    if (!name.trim()) errors.name = "请输入姓名";
    if (!email.trim()) errors.email = "请输入邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "邮箱格式不正确";
    if (!message.trim()) errors.message = "请输入消息";
    else if (message.trim().length < 10) errors.message = "消息至少 10 个字";
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) {
      update();
      return;
    }
    submitting = true;
    serverError = null;
    update();

    const result = await submitContactForm({ name, email, message });
    if (result.ok) {
      submitted = true;
      submitting = false;
      update();
    } else {
      serverError = result.message;
      submitting = false;
      update();
    }
  };

  return () => {
    if (submitted) {
      return (
        <Card title="提交成功">
          <div style={{ textAlign: "center", padding: "24px" }}>
            <p style={{ fontSize: "40px", margin: "0 0 16px" }}>✅</p>
            <h3 style={{ margin: "0 0 8px", color: "#16a34a" }}>感谢你的反馈！</h3>
            <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
              我们会在 24 小时内回复你的邮件。
            </p>
            <Button
              variant="primary"
              onClick={() => {
                name = "";
                email = "";
                message = "";
                submitted = false;
                errors = {};
                update();
              }}
            >
              再发一条
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
            联系我们
          </h1>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>有问题或建议？给我们发消息吧</p>
        </div>

        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <Card>
            {serverError !== null && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginBottom: "16px",
                  border: "1px solid #fca5a5",
                }}
              >
                提交失败: {serverError}
              </div>
            )}

            <FormField label="姓名" error={errors.name}>
              <input
                value={name}
                onInput={(e: any) => {
                  name = e.target.value;
                  if (errors.name) {
                    errors = { ...errors };
                    delete errors.name;
                  }
                }}
                placeholder="你的名字"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${errors.name ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="邮箱" error={errors.email}>
              <input
                value={email}
                onInput={(e: any) => {
                  email = e.target.value;
                  if (errors.email) {
                    errors = { ...errors };
                    delete errors.email;
                  }
                }}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${errors.email ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <FormField label="消息" error={errors.message}>
              <textarea
                value={message}
                onInput={(e: any) => {
                  message = e.target.value;
                  if (errors.message) {
                    errors = { ...errors };
                    delete errors.message;
                  }
                }}
                placeholder="告诉我们你的想法..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${errors.message ? "#ef4444" : "#d1d5db"}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </FormField>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  name = "";
                  email = "";
                  message = "";
                  errors = {};
                  update();
                }}
              >
                清空
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "提交中..." : "提交"}
              </Button>
            </div>
          </Card>

          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: 2,
            }}
          >
            <div>📧 contact@trrn.dev</div>
            <div>🐦 @trrn_framework</div>
            <div>💬 GitHub Discussions</div>
          </div>
        </div>
      </div>
    );
  };
}
