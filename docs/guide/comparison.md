# 框架对比

## trrn vs React/Preact

|            | trrn                               | React/Preact                          |
| ---------- | ---------------------------------- | ------------------------------------- |
| 状态管理   | 闭包变量                           | `useState` / `useReducer`             |
| 触发更新   | `ctx.update()`                     | `setState` / `dispatch`               |
| 清理       | `ctx.onUnmount(fn)`                | `useEffect(() => cleanup, [])`        |
| DOM 就绪   | `ctx.onMount(fn)`                  | `useEffect(fn, [])`                   |
| Context    | `ctx.consume(ctx)`                 | `useContext(ctx)`                     |
| 组件定义   | `(props, ctx) => (props) => VNode` | `(props) => VNode`                    |
| Hooks 规则 | 无（外层即初始化）                 | 条件限制                              |
| 依赖数组   | 无（闭包自动捕获）                 | 手动声明                              |
| 错误边界   | `ErrorBoundary`                    | `componentDidCatch` / `ErrorBoundary` |

## trrn vs Crank.js

|            | trrn                        | Crank.js              |
| ---------- | --------------------------- | --------------------- |
| 状态保持   | 闭包                        | 生成器闭包            |
| 更新触发   | `ctx.update()`              | `this.refresh()`      |
| 多阶段     | 条件分支                    | 多个 `yield`          |
| 异步       | 外层 async + `ctx.update()` | `async function*`     |
| 清理       | `ctx.onUnmount(fn)`         | `finally` 块          |
| Props 更新 | `render(newProps)`          | `for ({...} of this)` |

## 何时选择 trrn

- 你喜欢闭包自然的变量作用域，不想管理依赖数组
- 你希望状态更新是显式的（`ctx.update()`），而非响应式追踪
- 你想用普通函数写组件，无需 `defineComponent` 包装
- 你已经在用 Preact/React 生态，想用更轻量的组件模式
- 你偏好函数式编程风格

## 何时不选择 trrn

- 你依赖 React 生态的复杂 hooks 库
- 你需要虚拟列表、动画库等对 React hooks 有深度依赖的工具
- 你的团队已经深度投入 React/Preact 且迁移成本高
- 你需要生产级的 SSR 支持（目前未完整验证）
