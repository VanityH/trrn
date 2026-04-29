# trrn 架构设计

## 核心理念

- **无 `defineComponent`**：组件就是普通函数，不需要工厂函数包装
- **闭包即状态**：外层函数执行一次，闭包持有全部状态
- **返回 render 函数**：每次渲染调用 render 函数生成 VNode
- **基于 Preact**：适配层桥接到 Preact 运行时，不修改 Preact 源码

## 用户组件形态

```ts
function Comp(props, ctx) {
  // === 初始化区 ===
  // 这里的代码只执行一次
  // 闭包变量天然就是"状态"，不需要 useState
  let count = 0;

  ctx.onUnmount(() => {
    console.log("cleanup");
  });

  // === 返回 render 函数 ===
  return (props) => {
    // 每次渲染都执行（包括首次）
    // props 首次与外部参数一致
    return h(
      "div",
      null,
      h("span", null, String(count)),
      h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update(); // 触发重渲染
          },
        },
        "+",
      ),
    );
  };
}
```

## 框架 API

### `render(Comp, container, initialProps?)`

入口函数，将组件挂载到 DOM。

```
render(Counter, document.getElementById('app'));
```

### `h(type, props, ...children)`

封装 Preact 的 `h`，创建 VNode。对函数类型自动检测并适配（支持 trrn 组件和标准 Preact 组件）。

### `ctx` 对象

| 方法                    | 说明                         |
| ----------------------- | ---------------------------- |
| `ctx.update(newProps?)` | 触发重渲染，可选传递新 props |
| `ctx.onUnmount(fn)`     | 注册卸载时的清理回调         |

## 内部适配原理

```
render(Comp, container)
  │
  ▼
getAdapter(Comp) — WeakMap 缓存适配器
  │
  ▼
createAutoAdapter(Comp)
  │
  ├── 首次渲染: 调用 Comp(props, ctx)
  │   ├── 返回 function → trrn 模式（存储 renderFn）
  │   └── 返回 VNode → 标准 Preact 组件（委托原生渲染）
  │
  ├── trrn 模式:
  │   ├── useState 提供 forceUpdate（ctx.update 触发）
  │   ├── useRef 持有: renderFn, propsRef, cleanupRef
  │   ├── useEffect 注册清理（ctx.onUnmount 收集的回调）
  │   └── 每次渲染: renderFn(currentProps) → VNode
  │
  └── 标准模式:
      └── preactH(type, currentProps) → VNode（原生 Preact 渲染）
```

### 子组件嵌套

当 `h(Child, props)` 遇到函数类型时：

1. 检查 `adapterCache`（WeakMap）
2. 若未缓存 → `createAutoAdapter(Child)` 创建适配器 → 缓存
3. 将适配器作为 Preact 组件渲染
4. 适配器首次渲染时自动检测 Child 的模式

这实现了**无需 `defineComponent` 的自动适配**。

## 可行性验证结论

### ✅ 已验证可行的特性

| 特性       | 状态 | 关键发现                                             |
| ---------- | ---- | ---------------------------------------------------- |
| 基础渲染   | ✅   | 外层执行一次，render 执行首次渲染                    |
| 状态更新   | ✅   | `ctx.update()` 触发重渲染，闭包状态正确保持          |
| Props 传递 | ✅   | 初始 props 传入外层，`update(newProps)` 更新         |
| 组件嵌套   | ✅   | trrn 组件可嵌套，子组件状态独立                      |
| 异步数据   | ✅   | 外层 async init + `ctx.update()` 模式完全可用        |
| 事件处理   | ✅   | onClick/onInput/onSubmit 均正常，`action()` 减少样板 |
| 列表渲染   | ✅   | 数组子元素 + key 正常                                |
| 条件渲染   | ✅   | null/VNode 切换正常                                  |
| 多实例     | ✅   | 各实例状态独立                                       |
| 卸载安全   | ✅   | 卸载后 `ctx.update()` 是 no-op                       |

### ⚠️ 需要注意的限制

| 限制                   | 说明                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| Async render 函数      | 直接返回 `Promise<VNode>` 不可行（Preact 不支持），推荐外层异步 + `ctx.update()` |
| Props 标准化           | Preact 将 `null`/`undefined` props 标准化为 `{}`，解构默认值行为不变             |
| useEffect cleanup 时序 | 依赖 Preact 的异步调度（RAF + setTimeout），在测试中需 `vi.useFakeTimers()`      |

### 🔮 未来探索方向

1. **`action()` helper** — 已在 Phase 5 原型验证，可集成到框架 API
2. **错误边界** — 复用 Preact 的 `componentDidCatch` / `useErrorBoundary`
3. **生态桥接** — `toPreact()` / `fromPreact()` 适配器
4. **Async render 增强** — 适配器层面拦截 Promise 返回，自动 await + update
5. **DevTools** — 利用 Preact DevTools 的前提是适配器透明化

## 项目文件结构

```
src/
  index.ts        — 框架核心（render, h, Ctx, Component 类型）

tests/
  index.test.ts              — 占位
  phase1-basic.test.ts       — 基础渲染 + update + onUnmount
  phase2-props.test.ts       — Props 传递与更新
  phase3-nesting.test.ts     — 组件嵌套与组合
  phase4-async.test.ts       — 异步数据加载
  phase5-h-events.test.ts    — 事件处理 + action() 原型
  phase6-edgecases.test.ts   — 边界情况与错误处理

docs/
  architecture.md                 — 本文档
  crankjs-pattern-analysis.md     — 对话总结与设计背景
```

## 计划修正策略

- 每个 Phase 完成后评估：API 是否自然？是否有未预见的限制？
- 遇到 Preact 限制时：优先探索 `options` 钩子，其次考虑内部架构调整
- 保持每个 Phase 可独立运行和测试
- 发现更好的模式时回写更新本文档
