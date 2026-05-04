import { defineComponent } from "trrn-h";
import { useLocation } from "preact-iso";

interface AdminLayoutProps {
  children?: any;
}

const SIDEBAR_ITEMS = [
  { path: "/admin/analytics", label: "实时分析", icon: "📊" },
  { path: "/admin/data-explorer", label: "数据探索", icon: "🔍" },
  { path: "/admin/kanban", label: "看板", icon: "📋" },
  { path: "/admin/wizard", label: "表单向导", icon: "🧭" },
  { path: "/admin/zustand", label: "Zustand", icon: "⚡" },
  { path: "/admin/vanity", label: "VanityH", icon: "🎨" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin/analytics": "实时分析",
  "/admin/data-explorer": "数据探索",
  "/admin/kanban": "看板",
  "/admin/wizard": "表单向导",
  "/admin/zustand": "Zustand",
  "/admin/vanity": "VanityH",
};

export const AdminLayout = defineComponent<AdminLayoutProps>(() => {
  return (p) => {
    const { url, route } = useLocation();
    const title = PAGE_TITLES[url] ?? "trrn-h";

    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
        <nav style={{ width: "220px", background: "#1f2937", color: "#fff", padding: "20px 0" }}>
          <div
            style={{
              padding: "0 20px 20px",
              borderBottom: "1px solid #374151",
              marginBottom: "8px",
            }}
          >
            <strong style={{ fontSize: "18px", color: "#6366f1" }}>trrn-h</strong>
            <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "6px" }}>demo</span>
          </div>
          {SIDEBAR_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                route(item.path);
              }}
              style={{
                display: "block",
                padding: "10px 20px",
                color: url === item.path ? "#fff" : "#9ca3af",
                textDecoration: "none",
                fontSize: "14px",
                borderLeft: "3px solid transparent",
                background: url === item.path ? "#374151" : "transparent",
                borderLeftColor: url === item.path ? "#6366f1" : "transparent",
              }}
            >
              {item.icon} {item.label}
            </a>
          ))}
        </nav>
        <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
            {title}
          </h1>
          {p.children}
        </main>
      </div>
    );
  };
});
