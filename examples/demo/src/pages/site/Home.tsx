import type { Ctx, RenderFn } from "trrn";
import { Button } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";

export function HomePage(_: unknown, { update }: Ctx): RenderFn {
  let counter = 0;

  return () => (
    <div>
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 60px",
          background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
          borderRadius: "16px",
          marginBottom: "48px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "#1e1b4b",
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}
        >
          闭包即状态
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#4b5563",
            maxWidth: "600px",
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          trrn 是一个基于闭包状态管理的前端框架，构建在 Preact 之上。 无需 useState，无需
          hooks——只有函数和闭包。
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a href="/features">
            <Button variant="primary" size="lg">
              了解更多
            </Button>
          </a>
          <a href="/admin">
            <Button variant="secondary" size="lg">
              进入管理后台
            </Button>
          </a>
        </div>
      </section>

      {/* 特性预览 */}
      <section style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "32px",
            color: "#111827",
          }}
        >
          核心特性
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              title: "闭包即状态",
              desc: "变量天然持久化，无需 useState。外层函数执行一次，闭包变量就是你的状态。",
            },
            {
              title: "显式更新",
              desc: "调用 ctx.update() 触发重渲染，无隐式依赖追踪，数据流向清晰可见。",
            },
            { title: "零包装器", desc: "组件就是普通函数，无需 defineComponent 或 class 继承。" },
            {
              title: "Preact 生态兼容",
              desc: "底层运行在 Preact 上，兼容 Preact 生态的组件和工具。",
            },
            {
              title: "轻量核心",
              desc: "核心适配层不足 200 行，不修改 Preact 源码，纯粹的组合模式。",
            },
            {
              title: "Context 支持",
              desc: "完整的 createContext + Provider + consume 模式，支持嵌套和动态切换。",
            },
          ].map(({ title, desc }) => (
            <Card key={title}>
              <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#111827" }}>{title}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
                {desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 交互式 Demo */}
      <section
        style={{
          textAlign: "center",
          padding: "40px",
          background: "#f9fafb",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px", color: "#111827" }}>
          试试看
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          下面是一个用闭包作为状态的计数器——不需要 useState
        </p>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "#6366f1", marginBottom: "16px" }}>
          {counter}
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <button
            onClick={() => {
              counter++;
              update();
            }}
            style={{
              padding: "8px 24px",
              fontSize: "18px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              counter = 0;
              update();
            }}
            style={{
              padding: "8px 24px",
              fontSize: "18px",
              background: "#e5e7eb",
              color: "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            重置
          </button>
          <button
            onClick={() => {
              if (counter > 0) {
                counter--;
                update();
              }
            }}
            style={{
              padding: "8px 24px",
              fontSize: "18px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            -
          </button>
        </div>
      </section>
    </div>
  );
}
