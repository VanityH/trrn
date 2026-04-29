# trrn 架构设计

> 基于 Preact 11 beta 的闭包状态前端框架。无 `useState`，无 `defineComponent`。

## 组件模式

```ts
function Comp(props, ctx) {
  let count = 0; // 闭包 = 状态

  ctx.onMount(() => {
    /* DOM 就绪 */
  });
  ctx.onUnmount(() => {
    /* 清理 */
  });

  return (props) => {
    // 每次渲染调用
    const theme = ctx.consume(ThemeCtx);
    return h(
      "div",
      null,
      h("span", null, String(count)),
      h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        "+",
      ),
    );
  };
}
```

## API

### 框架入口

| 导出                              | 说明                               |
| --------------------------------- | ---------------------------------- |
| `render(Comp, container, props?)` | 挂载组件到 DOM                     |
| `h(type, props, ...children)`     | 创建 VNode（泛型重载）             |
| `action(ctx, fn)`                 | 事件处理自动 update                |
| `createContext(defaultValue)`     | 创建 Context                       |
| `ErrorBoundary`                   | 错误边界（Preact class component） |
| `StrictMode`                      | 开发辅助（double-invoke render）   |
| `TRRN_MARKER`                     | 显式组件标记 Symbol                |

### ctx 对象

| 方法                 | 说明            |
| -------------------- | --------------- |
| `ctx.update(props?)` | 触发重渲染      |
| `ctx.onMount(fn)`    | DOM 挂载后回调  |
| `ctx.onUnmount(fn)`  | 卸载清理        |
| `ctx.consume(ctx)`   | 读取 Context 值 |

### Context

```ts
const Theme = createContext("light");

// Provider（通过 vanity-h $. 语法或 h() 使用）
Theme.Provider.$.value("dark")(Child.$());

// Consumer
const theme = ctx.consume(Theme);
```

### 工具类型

| 类型                | 说明               |
| ------------------- | ------------------ |
| `Component<P>`      | 组件类型           |
| `Ctx`               | 上下文类型         |
| `RenderFn<P>`       | render 函数类型    |
| `PropsOf<T>`        | 提取 Props         |
| `RenderResultOf<T>` | 提取 render 返回值 |

## 内部架构

```
src/
  index.ts          — barrel exports
  types.ts          — Ctx, RenderFn, Component, Context, utility types
  adapter.ts        — 适配器（createTrrnAdapter, getAdapter, pattern detection）
                      + dev warnings + error wrapping + display name
  h.ts              — h() 泛型重载（trrn 组件 / HTML / Preact 组件）
  render.ts         — render() 根挂载
  action.ts         — action() helper
  context.ts        — createContext + resolveContext + createConsume
  error-boundary.ts — ErrorBoundary（Preact class component）
  warnings.ts       — dev warning（update-during-render, unmounted-update）
  strict-mode.ts    — StrictMode（double-invoke render）
```

### 适配器流程

```
h(Component, props, children)
  │
  ▼
getAdapter(Component)
  ├── 有缓存 → 返回缓存的 Adapter
  └── 无缓存
      ├── isTrrnComponent(Component)?
      │   ├── 显式 TRRN_MARKER → 按标记
      │   ├── length >= 2 → trrn（组件接收 props + ctx）
      │   └── length < 2 → Preact（组件只接收 props）
      ├── trrn → createTrrnAdapter(Component)
      │          ├── useState → tick (forceUpdate)
      │          ├── useRef → renderFn, propsRef, cleanupRef, internalRef
      │          ├── useEffect → onMount, onUnmount
      │          ├── resolveContext → 预收集 context 值
      │          └── renderingRef → 跟踪渲染阶段（warnings）
      └── Preact → PreactPassthrough(Component)
                   └── preactH(Component, props)
```

### Props 同步机制

- 父子 re-render：`propsRef.current = props`（同步外部 props）
- ctx.update()：设置 `internalRef = true`，跳过同步，使用更新后的 props
- 避免 `ctx.update()` 覆盖父组件传入的新 props

## 测试

```
tests/  (9 files, 45 tests)
  index.test.ts          — placeholder
  phase1-basic.test.ts   — render + update + onUnmount
  phase2-props.test.ts   — Props 传递与更新
  phase3-nesting.test.ts — 组件嵌套
  phase4-async.test.ts   — 异步数据加载
  phase5-h-events.test.ts— 事件处理 + action() 原型
  phase6-edgecases.test.ts— 边界情况
  phase7-lifecycle.test.ts— action + onMount + onUnmount
  phase9-api-integration.test.ts — Context + 深层嵌套 + 表单
```

## 设计决策

1. **无 `defineComponent`** — 组件是普通函数，通过 `length >= 2` 或 `TRRN_MARKER` 识别
2. **闭包即状态** — 外层函数执行一次，闭包变量天然持久化
3. **显式更新** — `ctx.update()` 触发渲染，无隐式依赖追踪
4. **基于 Preact** — 适配层 < 200 行，不修改 Preact 源码
5. **自动适配标准 Preact 组件** — 非 trrn 组件通过 `PreactPassthrough` 原生渲染
6. **WeakMap 适配器缓存** — 按函数引用缓存，避免重复创建

## 已知限制

| 限制               | 说明                                                               |
| ------------------ | ------------------------------------------------------------------ |
| Async render 函数  | 不直接支持 `async (props) => VNode`，推荐外层异步 + `ctx.update()` |
| ErrorBoundary 测试 | Preact 11 beta 在 jsdom 中 componentDidCatch 不可用                |
| useEffect 测试     | 需要 `setTimeout(r, 60)` 等待 Preact 的 RAF 调度                   |
| Props 标准化       | Preact 将 null props 转为 `{}`，解构默认值行为不变                 |
