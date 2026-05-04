import type { ComponentChildren } from "preact";
import type { Ctx, RenderFn } from "trrn";

const NAV_ITEMS = [
  { path: "/", label: "首页" },
  { path: "/features", label: "功能" },
  { path: "/pricing", label: "定价" },
  { path: "/about", label: "关于" },
  { path: "/contact", label: "联系" },
];

function SiteHeader(_: unknown, _ctx: Ctx): RenderFn {
  let menuOpen = false;

  return () => (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <strong style={{ fontSize: "20px", color: "#6366f1" }}>trrn</strong>
        </a>
        <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {NAV_ITEMS.map(({ path, label }) => (
            <a
              key={path}
              href={path}
              style={{
                padding: "6px 14px",
                color: "#374151",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "14px",
                transition: "background 0.15s",
                ...(location.pathname === path ? { background: "#eef2ff", color: "#6366f1" } : {}),
              }}
              onMouseOver={(e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
              }}
              onMouseOut={(e: MouseEvent) => {
                (e.currentTarget as HTMLElement).style.background =
                  location.pathname === path ? "#eef2ff" : "";
              }}
            >
              {label}
            </a>
          ))}
          <span style={{ color: "#d1d5db" }}>|</span>
          <a
            href="/admin"
            style={{
              padding: "6px 14px",
              background: "#6366f1",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            管理后台
          </a>
        </nav>
        {/* 移动端菜单按钮 */}
        <button
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
          onClick={() => {
            menuOpen = !menuOpen;
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}

function SiteFooter(): RenderFn {
  return () => (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        background: "#f9fafb",
        padding: "40px 24px 24px",
        marginTop: "80px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 8px" }}>
          trrn — 基于闭包状态的前端框架
        </p>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
          Built with trrn framework · Demo Application
        </p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children?: ComponentChildren }, _ctx: Ctx): RenderFn {
  return () => (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}
    >
      <SiteHeader />
      <main
        style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "24px", width: "100%" }}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
