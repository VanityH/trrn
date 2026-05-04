import type { RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";

interface FeatureGroup {
  title: string;
  features: { name: string; desc: string; badge?: string }[];
}

const groups: FeatureGroup[] = [
  {
    title: "状态管理",
    features: [
      {
        name: "闭包状态",
        desc: "组件的状态存储在闭包变量中，无需 useState、useReducer 或类似 API。",
        badge: "核心",
      },
      {
        name: "显式更新",
        desc: "ctx.update() 在需要时触发重渲染，无隐式依赖追踪，数据流可预测。",
        badge: "核心",
      },
      {
        name: "Props 同步",
        desc: "update(newProps) 模式支持父组件向子组件传递更新数据，render 函数参数直接接收。",
      },
    ],
  },
  {
    title: "生命周期",
    features: [
      {
        name: "onMount",
        desc: "DOM 挂载后回调，适合初始化数据、绑定事件监听、启动定时器。",
        badge: "常用",
      },
      {
        name: "onUnmount",
        desc: "卸载清理回调，适合清除定时器、取消订阅、释放资源。",
        badge: "常用",
      },
      { name: "错误边界", desc: "ErrorBoundary 捕获渲染错误，显示 fallback UI 并支持重置。" },
    ],
  },
  {
    title: "上下文",
    features: [
      { name: "createContext", desc: "创建带默认值的 Context，支持嵌套 Provider 覆盖。" },
      { name: "ctx.consume", desc: "在 render 函数中读取最近的 Provider 值，响应式更新。" },
      { name: "嵌套覆盖", desc: "多个 Provider 嵌套时，内层 Provider 覆盖外层值。" },
    ],
  },
  {
    title: "开发体验",
    features: [
      {
        name: "TypeScript",
        desc: "完整的类型支持，包括 Component、Ctx、RenderFn 和 PropsOf 等工具类型。",
      },
      {
        name: "Dev Warnings",
        desc: "开发模式下检测 render 期间调用 update() 和已卸载组件调用 update()。",
      },
      {
        name: "StrictMode",
        desc: "double-invoke render 函数以检测副作用，类似 React.StrictMode。",
      },
      {
        name: "JSX 支持",
        desc: "通过 jsxImportSource 配置自动 JSX 转换，或使用 vanity-h 链式 DSL。",
      },
    ],
  },
  {
    title: "兼容性",
    features: [
      {
        name: "Preact 生态",
        desc: "自动识别标准 Preact 组件，通过 PreactPassthrough 原生渲染，无需额外配置。",
        badge: "核心",
      },
      { name: "vanity-h", desc: "可选链式调用 DSL，提供 class()、style()、onClick() 方法。" },
    ],
  },
];

export function FeaturesPage(): RenderFn {
  return () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
          功能特性
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
          trrn 提供了一套简洁但完整的 API，涵盖状态管理、生命周期、上下文和开发工具。
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.title} style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>
            {group.title}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {group.features.map(({ name, desc, badge }) => (
              <Card key={name}>
                <div
                  style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px", color: "#111827" }}>{name}</h3>
                  {badge !== undefined && <Badge label={badge} variant="info" />}
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
