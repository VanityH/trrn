import type { Ctx, RenderFn } from "trrn";
import { SiteLayout } from "./components/layout/SiteLayout.tsx";
import { AdminLayout } from "./components/layout/AdminLayout.tsx";

// Site pages
import { HomePage } from "./pages/site/Home.tsx";
import { FeaturesPage } from "./pages/site/Features.tsx";
import { PricingPage } from "./pages/site/Pricing.tsx";
import { AboutPage } from "./pages/site/About.tsx";
import { ContactPage } from "./pages/site/Contact.tsx";

// Admin pages
import { DashboardPage } from "./pages/admin/Dashboard.tsx";
import { UsersPage } from "./pages/admin/Users.tsx";
import { ProductsPage } from "./pages/admin/Products.tsx";
import { OrdersPage } from "./pages/admin/Orders.tsx";
import { SettingsPage } from "./pages/admin/Settings.tsx";

// ── Site routes ────────────────────────────────────────────────

interface Route {
  path: string;
  Page: (props?: any, ctx?: any) => RenderFn;
}

const siteRoutes: Route[] = [
  { path: "/", Page: HomePage },
  { path: "/features", Page: FeaturesPage },
  { path: "/pricing", Page: PricingPage },
  { path: "/about", Page: AboutPage },
  { path: "/contact", Page: ContactPage },
];

const adminRoutes: { path: string; Page: (props?: any, ctx?: any) => RenderFn; title: string }[] = [
  { path: "/admin", Page: DashboardPage, title: "仪表盘" },
  { path: "/admin/users", Page: UsersPage, title: "用户管理" },
  { path: "/admin/products", Page: ProductsPage, title: "产品管理" },
  { path: "/admin/orders", Page: OrdersPage, title: "订单管理" },
  { path: "/admin/settings", Page: SettingsPage, title: "设置" },
];

// ── Admin shell: handles sub-routing within admin layout ───────

function AdminShell(_: unknown, ctx: Ctx): RenderFn {
  let loggedIn = true;

  const handleLogout = () => {
    loggedIn = false;
    ctx.update();
    // 模拟登出后跳转回首页
    setTimeout(() => {
      location.href = "/";
    }, 300);
  };

  return () => {
    if (!loggedIn) {
      return <p style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>正在登出...</p>;
    }

    const path = location.pathname;
    const match = adminRoutes.find((r) => r.path === path);
    const page = match ?? adminRoutes[0];
    const Page = page.Page;

    return (
      <AdminLayout title={page.title} onLogout={handleLogout}>
        <Page key={path} />
      </AdminLayout>
    );
  };
}

// ── App ────────────────────────────────────────────────────────

export function App(): RenderFn {
  return () => {
    const path = location.pathname;

    // Admin routes
    if (path === "/admin" || path.startsWith("/admin/")) {
      return <AdminShell />;
    }

    // Site routes
    const route = siteRoutes.find((r) => r.path === path);
    if (route !== undefined) {
      const Page = route.Page;
      return (
        <SiteLayout>
          <Page key={path} />
        </SiteLayout>
      );
    }

    // 404
    return (
      <SiteLayout>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <h1 style={{ fontSize: "72px", fontWeight: 800, color: "#e5e7eb", margin: "0 0 8px" }}>
            404
          </h1>
          <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "24px" }}>页面未找到</p>
          <a href="/" style={{ color: "#6366f1", textDecoration: "underline" }}>
            返回首页
          </a>
        </div>
      </SiteLayout>
    );
  };
}
