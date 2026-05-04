import type { Ctx, RenderFn } from "trrn";
import { AdminLayout } from "./components/layout/AdminLayout.tsx";

// Admin pages
import { AnalyticsPage } from "./pages/admin/Analytics.tsx";
import { DataExplorerPage } from "./pages/admin/DataExplorer.tsx";
import { KanbanBoardPage } from "./pages/admin/KanbanBoard.tsx";
import { WizardFormPage } from "./pages/admin/WizardForm.tsx";

interface Route {
  path: string;
  Page: (props?: any, ctx?: any) => RenderFn;
  title: string;
}

const ROUTES: Route[] = [
  { path: "/admin/analytics", Page: AnalyticsPage, title: "实时分析" },
  { path: "/admin/data-explorer", Page: DataExplorerPage, title: "数据探索" },
  { path: "/admin/kanban", Page: KanbanBoardPage, title: "看板" },
  { path: "/admin/wizard", Page: WizardFormPage, title: "表单向导" },
];

// ── App ────────────────────────────────────────────────────────

export function App(_: unknown, _ctx: Ctx): RenderFn {
  let redirecting = false;

  return () => {
    const path = location.pathname;

    // 重定向到默认页面
    if (path === "/" || path === "/admin") {
      if (!redirecting) {
        redirecting = true;
        setTimeout(() => {
          location.href = "/admin/analytics";
        }, 50);
      }
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          正在跳转...
        </div>
      );
    }

    // Admin routes
    const route = ROUTES.find((r) => r.path === path);
    if (route !== undefined) {
      const Page = route.Page;
      return (
        <AdminLayout title={route.title}>
          <Page key={path} />
        </AdminLayout>
      );
    }

    // 404
    return (
      <AdminLayout title="404">
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 style={{ fontSize: "72px", fontWeight: 800, color: "#e5e7eb", margin: "0 0 8px" }}>
            404
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>页面未找到</p>
          <a href="/admin/analytics" style={{ color: "#6366f1", textDecoration: "underline" }}>
            返回首页
          </a>
        </div>
      </AdminLayout>
    );
  };
}
