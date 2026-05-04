import type { Ctx, RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { FormField } from "../../components/ui/FormField.tsx";

export function SettingsPage(_: unknown, { update }: Ctx): RenderFn {
  // 个人信息
  let profile = { name: "管理员", email: "admin@trrn.dev", bio: "" };
  let profileSaved = false;

  // 通知偏好
  let notifications = { email: true, sms: false, marketing: false };
  let notifSaved = false;

  // 主题
  let theme: "light" | "dark" = "light";

  const saveProfile = () => {
    profileSaved = true;
    update();
    setTimeout(() => {
      profileSaved = false;
      update();
    }, 2000);
  };

  const saveNotifications = () => {
    notifSaved = true;
    update();
    setTimeout(() => {
      notifSaved = false;
      update();
    }, 2000);
  };

  return () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 个人信息 */}
      <Card title="个人信息">
        <FormField label="姓名">
          <input
            value={profile.name}
            onInput={(e: any) => {
              profile = { ...profile, name: e.target.value };
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </FormField>
        <FormField label="邮箱">
          <input
            value={profile.email}
            onInput={(e: any) => {
              profile = { ...profile, email: e.target.value };
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </FormField>
        <FormField label="简介">
          <textarea
            value={profile.bio}
            onInput={(e: any) => {
              profile = { ...profile, bio: e.target.value };
            }}
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </FormField>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="primary" onClick={saveProfile}>
            保存
          </Button>
          {profileSaved && <span style={{ color: "#16a34a", fontSize: "13px" }}>已保存 ✓</span>}
        </div>
      </Card>

      {/* 通知偏好 */}
      <Card title="通知偏好">
        {[
          { key: "email", label: "邮件通知" },
          { key: "sms", label: "短信通知" },
          { key: "marketing", label: "营销邮件" },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 0",
              cursor: "pointer",
              fontSize: "14px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <input
              type="checkbox"
              checked={(notifications as Record<string, boolean>)[key]}
              onChange={() => {
                notifications = {
                  ...notifications,
                  [key]: !(notifications as Record<string, boolean>)[key],
                };
                update();
              }}
              style={{ width: "16px", height: "16px", accentColor: "#6366f1" }}
            />
            <span>{label}</span>
          </label>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
          <Button variant="primary" onClick={saveNotifications}>
            保存偏好
          </Button>
          {notifSaved && <span style={{ color: "#16a34a", fontSize: "13px" }}>已保存 ✓</span>}
        </div>
      </Card>

      {/* 主题切换 */}
      <Card title="主题设置">
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => {
              theme = "light";
              update();
            }}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: theme === "light" ? "2px solid #6366f1" : "1px solid #d1d5db",
              background: "#fff",
              color: "#111827",
              cursor: "pointer",
              fontWeight: theme === "light" ? 600 : 400,
              fontSize: "14px",
            }}
          >
            ☀️ 浅色模式
          </button>
          <button
            onClick={() => {
              theme = "dark";
              update();
            }}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: theme === "dark" ? "2px solid #6366f1" : "1px solid #d1d5db",
              background: "#1f2937",
              color: "#f3f4f6",
              cursor: "pointer",
              fontWeight: theme === "dark" ? 600 : 400,
              fontSize: "14px",
            }}
          >
            🌙 深色模式
          </button>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#6b7280" }}>
          当前主题: <strong>{theme === "light" ? "浅色模式" : "深色模式"}</strong>
          （此设置仅作为演示，实际样式需配合 CSS 变量实现）
        </p>
      </Card>

      {/* 关于 */}
      <Card title="关于">
        <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>trrn Admin</strong> — 管理后台演示
          </p>
          <p style={{ margin: "0 0 4px" }}>版本: 0.0.0</p>
          <p style={{ margin: 0 }}>技术栈: trrn + Preact + TypeScript</p>
        </div>
      </Card>
    </div>
  );
}
