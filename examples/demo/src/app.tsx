import { defineComponent } from "trrn";
import type { Ctx } from "trrn";
import { h } from "preact";
import { AdminLayout } from "./components/layout/AdminLayout.tsx";
import { AnalyticsPage } from "./pages/admin/Analytics.tsx";
import { DataExplorerPage } from "./pages/admin/DataExplorer.tsx";
import { KanbanBoardPage } from "./pages/admin/KanbanBoard.tsx";
import { WizardFormPage } from "./pages/admin/WizardForm.tsx";

const PAGE_TITLES: Record<string, string> = {
  "/admin/analytics": "实时分析",
  "/admin/data-explorer": "数据探索",
  "/admin/kanban": "看板",
  "/admin/wizard": "表单向导",
};

function resolvePath(p: string): string {
  if (p === "/" || p === "/admin") return "/admin/analytics";
  return p;
}

export const App = defineComponent<object>((_, { update, onMount, onUnmount }: Ctx) => {
  let path = resolvePath(location.pathname);

  function navigate(to: string) {
    history.pushState(null, "", to);
    path = resolvePath(to);
    update();
  }

  function onPopState() {
    path = resolvePath(location.pathname);
    update();
  }

  onMount(() => {
    addEventListener("popstate", onPopState);
    document.addEventListener("click", handleNavClick);
  });

  onUnmount(() => {
    removeEventListener("popstate", onPopState);
    document.removeEventListener("click", handleNavClick);
  });

  function handleNavClick(e: MouseEvent) {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (href && href.startsWith("/admin")) {
      e.preventDefault();
      navigate(href);
    }
  }

  const pages: Record<string, () => any> = {
    "/admin/analytics": () => h(AnalyticsPage, null),
    "/admin/data-explorer": () => h(DataExplorerPage, null),
    "/admin/kanban": () => h(KanbanBoardPage, null),
    "/admin/wizard": () => h(WizardFormPage, null),
  };

  return () => {
    const page = pages[path];
    if (!page) {
      return h(
        AdminLayout,
        { title: "404" },
        h(
          "div",
          { style: { textAlign: "center", padding: "40px", color: "#6b7280" } },
          "页面未找到",
        ),
      );
    }
    return h(AdminLayout, { title: PAGE_TITLES[path] ?? "" }, page());
  };
});
