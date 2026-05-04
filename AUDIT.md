# trrn 框架源码审计

## 说明

本文档记录对 trrn 框架源码的审计发现，逐项讨论确定解决方案后实施修复。

---

## 问题列表

### P0 — 运行时探测导致副作用 (adapter.ts)

**位置**: `adapter.ts:139-141`

**描述**:
```ts
// 运行时探测：length < 2 时可能是解构参数，尝试调用检测
const probeResult = type({}, createProbeCtx());
if (typeof probeResult === "function") {
  adapter = createTrrnAdapter(type);
}
```

对 `length < 2` 的函数组件（如 `function Comp({ text })` 只有 1 个参数），adapter 会调用其外层函数来探测返回值是否为函数。如果外层函数中有副作用（API 请求、定时器、事件订阅），会在**探测期间就执行一次**，导致意外的 API 调用或资源泄漏。

**影响范围**:
- 仅影响 `length < 2` 的函数组件
- 组件参数解构（`{ text }` 这种形式）自然就是 `length === 1`
- 绕开方式：用 `TRRN_MARKER` 显式标记或用 `(props, ctx)` 双参数形式

**方案**:
（待讨论）

---

### P0 — 所有组件每次渲染解析所有 Context (adapter.ts)

**位置**: `adapter.ts:56-58`

**描述**:
```ts
for (const preactCtx of registeredContexts) {
  resolveContext(preactCtx);
}
```

每次渲染时每个组件都遍历 `registeredContexts` 调用 `useContext`。N 个 Context × M 个组件 = N×M 次 `useContext` 调用/渲染。实际上大多数组件只 consume 1-2 个 Context。

**影响范围**: 所有使用了 `createContext` 的应用。

**方案**:
（待讨论）

---

### P1 — action() 不处理异常 (action.ts)

**位置**: `action.ts:14-17`

**描述**:
```ts
return (...args: P) => {
  fn(...args);    // 抛出异常则不会执行下文的 update()
  ctx.update();
};
```

用户事件处理函数抛出异常时 `ctx.update()` 不会执行，UI 停留在过期状态。

**方案**:
（待讨论）

---

### P1 — StrictMode 每次交互都 double-invoke (strict-mode.ts)

**位置**: `strict-mode.ts:18-20`

**描述**:
```ts
if (invokeCount % 2 === 1) {
  queueMicrotask(() => ctx.update());
}
```

用奇数计数触发 double-invoke，但 `invokeCount` 在整个生命周期累加。每次用户交互（带来奇数渲染）都会触发一次额外空白更新。预期行为应该是仅在挂载时 double-invoke。

**方案**:
（待讨论）

---

### P1 — onUnmount 只支持单清理函数 (adapter.ts)

**位置**: `adapter.ts:77-79`

**描述**:
```ts
onUnmount(fn: () => void) {
  cleanupRef.current = fn;  // 第二次调用覆盖第一次
}
```

多次调用 `ctx.onUnmount()` 只有最后一次生效，和 `onMount` 不一致。

**方案**:
（待讨论）

---

### P2 — jsx-runtime withKey 创建新对象 (jsx-runtime.ts)

**位置**: `jsx-runtime.ts:14-17`

**描述**:
```ts
function withKey(props: any, key?: string): any {
  if (key !== undefined && props && !("key" in props)) {
    return { ...props, key };
  }
  return props;
}
```

每次 render 含 key 的 JSX 元素都创建一个 spread 新对象。

**方案**:
（待讨论）

---

### P2 — TRRN_MARKER 类型声明不准确 (types.ts)

**位置**: `types.ts:34`

**描述**:
```ts
export interface TrrnComponent<P = Record<string, unknown>> extends Component<P> {
  [TRRN_MARKER]?: true;  // true 但 adapter 中写入 false
}
```

adapter 写入 `(type as any)[TRRN_MARKER] = adapter.name !== "PreactPassthrough"`（boolean），而类型只声明 `true`。

**方案**:
（待讨论）

---

### P2 — 框架源码下划线前缀命名 (context.ts, strict-mode.ts)

**位置**: `context.ts:74`, `strict-mode.ts:10`

**描述**:
- `context.ts:74`: `(_props, _ctx)` — Provider 组件参数
- `strict-mode.ts:12`: `return (_p) => {` — render 函数参数（实际已使用）

部分框架源码仍使用下划线前缀命名参数，其中 `_p` 实际被使用（误导性前缀），`_props` 和 `_ctx` 确实未使用。

**方案**:
（待讨论）

---

## 修复记录

| # | 问题 | 方案 | 状态 | PR/Commit |
|---|------|------|------|-----------|
| - | - | - | - | - |
