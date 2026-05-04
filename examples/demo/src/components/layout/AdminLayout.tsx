import type { ComponentChildren } from "preact";
import type { Ctx, RenderFn } from "trrn";
import { Button } from "../ui/Button.tsx";

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { path: "/admin", label: "仪表盘", icon: "📊" },
  { path: "/admin/analytics", label: "实时分析", icon: "📈" },
  { path: "/admin/data-explorer", label: "数据探索", icon: "🔍" },
  { path: "/admin/users", label: "用户管理", icon: "👥" },
  { path: "/admin/products", label: "产品管理", icon: "📦" },
  { path: "/admin/orders", label: "订单管理", icon: "📋" },
  { path: "/admin/kanban", label: "看板", icon: "📋" },
  { path: "/admin/wizard", label: "表单向导", icon: "📝" },
  { path: "/admin/settings", label: "设置", icon: "⚙️" },
];

function AdminSidebar(_: unknown, _ctx: Ctx): RenderFn {
  return () => (
    <aside
      style={{
        width: "220px",
        background: "#1f2937",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "20px 18px",
          borderBottom: "1px solid #374151",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <strong style={{ fontSize: "18px", color: "#818cf8" }}>trrn Admin</strong>
        </a>
      </div>
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {SIDEBAR_ITEMS.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <a
              key={path}
              href={path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "8px",
                color: active ? "#fff" : "#9ca3af",
                textDecoration: "none",
                fontSize: "14px",
                background: active ? "#374151" : "transparent",
                marginBottom: "2px",
                transition: "all 0.15s",
              }}
              onMouseOver={(e: MouseEvent) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "#374151";
              }}
              onMouseOut={(e: MouseEvent) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </a>
          );
        })}
      </nav>
      <div style={{ padding: "12px 8px", borderTop: "1px solid #374151" }}>
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "8px",
            color: "#9ca3af",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          <span>←</span>
          <span>返回网站</span>
        </a>
      </div>
    </aside>
  );
}

function AdminHeader(
  { title, onLogout }: { title: string; onLogout: () => void },
  _ctx: Ctx,
): RenderFn {
  return () => (
    <div
      style={{
        height: "60px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>{title}</h2>
      <Button variant="ghost" onClick={onLogout}>
        退出登录
      </Button>
    </div>
  );
}

export function AdminLayout({
  title,
  children,
  onLogout,
}: {
  title: string;
  children?: ComponentChildren;
  onLogout: () => void;
}): RenderFn {
  return () => (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader title={title} onLogout={onLogout} />
        <div style={{ flex: 1, padding: "24px", overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
