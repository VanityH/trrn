import type { RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";

export function AboutPage(): RenderFn {
  return () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
          关于 trrn
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          trrn 是一个实验性的前端框架，探索"闭包即状态"的编程模型。 它构建在 Preact
          之上，旨在提供一种更简洁、更可预测的状态管理方式。
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <Card title="设计理念">
          <p style={{ margin: 0, lineHeight: 1.7, color: "#4b5563", fontSize: "14px" }}>
            传统 React/Preact 框架通过 hooks 管理状态，但 hooks 有严格的调用规则和依赖数组。 trrn
            回归到更基本的 JavaScript 模式——闭包。
            外层函数执行一次，闭包中的变量天然就是持久化状态。 这消除了对 useState、useEffect 等
            hooks 的依赖，让状态管理回归直觉。
          </p>
        </Card>
        <Card title="技术栈">
          <p style={{ margin: 0, lineHeight: 1.7, color: "#4b5563", fontSize: "14px" }}>
            trrn 底层使用 Preact 11 beta 作为渲染引擎。 通过适配器模式将 trrn 组件转换为 Preact
            组件，无需修改 Preact 源码。 核心适配层仅 200 行代码，遵循组合优于修改的原则。 支持
            TypeScript 完整类型推断、JSX 自动转换和 Preact 生态组件。
          </p>
        </Card>
        <Card title="项目状态">
          <p style={{ margin: 0, lineHeight: 1.7, color: "#4b5563", fontSize: "14px" }}>
            trrn 目前处于实验性阶段，API 可能发生变动。
            核心功能已完成：组件系统、渲染更新、Context、错误边界、生命周期和开发工具。 测试覆盖 45
            个测试用例，涵盖基础渲染到 Context 集成。 欢迎在 GitHub 上提出建议和反馈。
          </p>
        </Card>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "40px",
          background: "#f9fafb",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "12px" }}>
          开始使用
        </h2>
        <pre
          style={{
            background: "#1f2937",
            color: "#e5e7eb",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "left",
            overflowX: "auto",
            fontSize: "13px",
            lineHeight: 1.6,
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          {`npm install trrn preact

import { render, h } from "trrn";

function Counter(_props, ctx) {
  let count = 0;

  return () => h("div", null,
    h("button", { onClick: () => {
      count++;
      ctx.update();
    }}, String(count)),
  );
}

render(Counter, document.body);`}
        </pre>
      </div>
    </div>
  );
}
