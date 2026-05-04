# trrn

基于[Preact](https://preactjs.com/)的闭包状态前端框架。无 `useState`、无 hooks、无 `defineComponent`——只有函数和闭包。

```tsx
import { render } from "trrn";

function Counter(_props, { update }) {
  let count = 0; // 闭包 = 状态

  return () => (
    <div>
      <span>{count}</span>
      <button
        onClick={() => {
          count++;
          update();
        }}
      >
        +
      </button>
    </div>
  );
}

render(Counter, document.getElementById("app")!);
```

---

## 目录

- [核心理念](#核心理念)
- [快速开始](#快速开始)
- [组件模式](#组件模式)
- [更新机制](#更新机制)
- [Props 传递与同步](#props-传递与同步)
- [生命周期](#生命周期)
- [API 参考](#api-参考)
- [内部架构](#内部架构)
- [常见陷阱](#常见陷阱)
- [与 Preact 生态互操作](#与-preact-生态互操作)
- [框架对比](#框架对比)

---

## 核心理念

trrn 的核心思想：**闭包就是状态，函数就是组件**。

```
外层 (props, ctx) → render 函数
 │                     │
 │ 执行一次             │ 每次渲染执行
 │ 持有状态             │ 返回 VNode
 │ 注册生命周期         │ 读取最新状态
```

- 外层函数中的**闭包变量**就是组件的"状态"——无需 `useState`
- 修改闭包变量后调用 **`ctx.update()`** 触发重渲染——无需 `setState`、无隐式依赖追踪
- 组件是**普通函数**——无需 `defineComponent` 包装

---

## 快速开始

### 安装

```bash
npm install trrn preact
```

### tsconfig.json 配置（JSX 支持）

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "trrn"
  }
}
```

### Hello World

```tsx
import { render } from "trrn";

function Hello(_props, { onMount }) {
  let name = "";

  onMount(() => console.log("DOM 就绪"));

  return () => (
    <div>
      <input
        value={name}
        onInput={(e) => {
          name = (e.target as HTMLInputElement).value;
          ctx.update();
        }}
      />
      <p>Hello, {name || "world"}</p>
    </div>
  );
}

render(Hello, document.getElementById("app")!);
```

也可使用 `h()` 函数（兼容无 JSX 环境）：

```ts
import { render, h } from "trrn";

function Counter(_props, { update }) {
  let count = 0;
  return () =>
    h(
      "div",
      null,
      h("span", null, String(count)),
      h(
        "button",
        {
          onClick: () => {
            count++;
            update();
          },
        },
        "+",
      ),
    );
}
```

### 与 vanity-h 配合（可选）

trrn 原生兼容 [vanity-h](https://github.com/VanityH/vanityh) 链式 DSL：

```ts
import { h } from "trrn";
import createVanity from "vanity-h";

const { div, span, button, input } = createVanity(h);

function Comp(_props, { update }) {
  let count = 0;
  return () =>
    div.class("counter")(
      span(String(count)),
      button.onClick(() => {
        count++;
        update();
      })("+"),
    );
}
```

详见 [vanity-h 文档](https://github.com/VanityH/vanityh)。

---

## 组件模式

### 基本结构

```tsx
function MyComponent(props: MyProps, ctx: Ctx): RenderFn {
  // ═══ 外层：只执行一次 ═══
  // - 闭包变量 = 状态
  // - 异步请求、定时器
  // - 注册生命周期

  let items = props?.initial ?? [];

  ctx.onMount(() => {
    /* DOM 就绪 */
  });
  ctx.onUnmount(() => {
    /* 清理 */
  });

  // ═══ render 函数：每次渲染执行 ═══
  return (latestProps) => {
    // latestProps 始终是当前最新的 props
    // 可直接从这里解构获取更新后的值
    return <div>{/* ... */}</div>;
  };
}
```

### 外层 vs 内层的 props

这是一个容易混淆的关键点：

|          | 外层 `props`           | render 函数 `latestProps`                    |
| -------- | ---------------------- | -------------------------------------------- |
| 执行次数 | **1 次**（组件挂载时） | **每次渲染**                                 |
| 更新方式 | 永远不变               | 父组件重渲染或 `ctx.update(newProps)` 后更新 |
| 推荐用法 | 初始解构、默认值       | 读取渲染时最新数据                           |

```tsx
function Card(props, ctx) {
  // 外层 props：只拿初始值，适合设置默认值
  const defaultTitle = props?.title ?? "Untitled";

  return (latest) => {
    // render 函数的 props：每次渲染最新值
    // ✗ const title = props.title;  // 永远是最初的值！
    // ✓ const { title } = latest as any;  // 最新值
    return <div>{/* ... */}</div>;
  };
}
```

### 闭包变量

外层函数的变量就是组件的状态：

```tsx
function List(_props, { update }) {
  let items = [{ id: 1, text: "a" }];
  let selectedId = -1;

  const addItem = () => {
    items = [...items, { id: Date.now(), text: "new" }];
    update();
  };

  return () => (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => {
            selectedId = item.id;
            update();
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}
```

---

## 更新机制

### 核心流程

```tsx
function Adapter(props) {
  const [, tick] = useState(0);
  const propsRef = useRef(undefined);
  const internalRef = useRef(false);

  // 父组件重渲染 → internalRef=false → 用父级新 props 覆盖
  if (!internalRef.current) {
    propsRef.current = props;
  }
  internalRef.current = false;

  // ctx.update() 流程：
  const ctx = {
    update(newProps) {
      internalRef.current = true; // 标记为内部更新
      if (newProps) {
        propsRef.current = { ...propsRef.current, ...newProps }; // 合并新 props
      }
      tick((n) => n + 1); // 触发 Preact 重渲染
    },
  };

  // 外层函数只执行一次
  if (!renderFnRef.current) {
    renderFnRef.current = type(props, ctx);
  }

  // 每次渲染调用 render 函数
  return renderFnRef.current(propsRef.current);
}
```

### 三种渲染触发方式

| 方式                       | internalRef | propsRef 行为                                     |
| -------------------------- | ----------- | ------------------------------------------------- |
| **父组件重渲染**           | false       | `propsRef.current = props`（用新 JSX props 覆盖） |
| **`ctx.update()`**         | true        | 跳过覆盖，保持当前 propsRef                       |
| **`ctx.update(newProps)`** | true        | `newProps` 合并到 propsRef                        |

### 事件处理器中的更新

```tsx
function Comp(_props, { update }: Ctx) {
  let count = 0;

  // ✗ 错误：修改了闭包变量但没有触发重渲染
  const badHandler = () => {
    count++;
  };

  // ✓ 正确：修改后调用 update()
  const goodHandler = () => {
    count++;
    update();
  };

  // ✓ 也可用 action() 包装器（自动调用 update()）
  const actionHandler = action(update as any, () => {
    count++;
  });

  return () => <button onClick={goodHandler}>{count}</button>;
}
```

**关键规则：只有 `ctx.update()` 能触发渲染。修改闭包变量本身不会更新 UI。**

### action() 包装器

`action(ctx, fn)` 返回一个自动调用 `ctx.update()` 的事件处理器：

```ts
import { action } from "trrn";

// 不用 action：手动 update
<button onClick={() => { count++; update(); }} />

// 用 action：自动 update
<button onClick={action(ctx, () => { count++; })} />

// 多层状态变更：一次 update 即可
<button onClick={action(ctx, () => { a++; b += 2; })} />
```

---

## Props 传递与同步

### 父传子

```tsx
function Parent(_props, { update }) {
  let value = "";

  return () => (
    <div>
      <input
        onInput={(e) => {
          value = e.target.value;
          update();
        }}
      />
      <Child label={value} /> {/* 每次父组件 re-render，Child 的 adapter 收到新 props */}
    </div>
  );
}

// 子组件通过 render 函数的参数接收最新 props
function Child(_props, _ctx) {
  return (latestProps) => {
    // latestProps = propsRef.current
    // 父组件重渲染 → adapter 更新 propsRef → renderFn(propsRef.current)
    const { label } = latestProps as any;
    return <span>{label}</span>;
  };
}
```

### ctx.update(newProps)

用于组件内部更新自己的 props（也供父组件通过 `update(newProps)` 推送数据给子组件）：

```tsx
function Comp(props, { update }) {
  return (latestProps) => (
    <div>
      <span>{(latestProps as any).page ?? 1}</span>
      <button onClick={() => update({ page: 2 })}>Go to page 2</button>
    </div>
  );
}
```

### 完整数据流

```
父组件调用 update()
  └─ tick(n+1) → Preact 重渲染父组件 adapter
      └─ renderFn 返回新 VNode，其中包含 <Child newProp={x} />
          └─ Preact 复用 Child adapter，传入新 props
              └─ Child adapter: internalRef=false → propsRef = newProps
                  └─ renderFn(propsRef) → Child render 函数参数 = 最新 props
```

这就是**render 函数的 props 参数始终是最新值**的原理。

---

## 生命周期

### ctx.onMount(fn)

DOM 挂载后执行一次：

```tsx
ctx.onMount(() => {
  document.querySelector("input")?.focus();
  startAnimation();
});
```

### ctx.onUnmount(fn)

组件卸载时执行清理：

```tsx
ctx.onUnmount(() => {
  clearInterval(timerId);
  removeEventListener("scroll", handler);
});
```

### 结合使用

```tsx
function Timer(_props, { onMount, onUnmount, update }) {
  let seconds = 0;
  let timerId;

  onMount(() => {
    timerId = setInterval(() => {
      seconds++;
      update();
    }, 1000);
  });

  onUnmount(() => {
    clearInterval(timerId);
  });

  return () => <div>{seconds}s</div>;
}
```

---

## API 参考

### 框架导出

| 导出                              | 说明                                    |
| --------------------------------- | --------------------------------------- |
| `render(Comp, container, props?)` | 挂载组件到 DOM                          |
| `h(type, props, ...children)`     | 创建 VNode（自动适配 trrn/Preact 组件） |
| `action(ctx, fn)`                 | 事件处理器包装器，执行后自动 `update()` |
| `createContext(defaultValue)`     | 创建 Context                            |
| `ErrorBoundary`                   | 错误边界（Preact class 组件）           |
| `StrictMode`                      | 开发辅助（double-invoke render）        |
| `TRRN_MARKER`                     | 显式组件标记 Symbol                     |

### ctx 对象

```ts
interface Ctx {
  /** 触发重渲染。可选传入 newProps 合并到当前 props */
  update(newProps?: Record<string, unknown>): void;
  /** DOM 挂载后回调 */
  onMount(fn: () => void): void;
  /** 卸载清理回调 */
  onUnmount(fn: () => void): void;
  /** 读取 Context 值 */
  consume<T>(context: Context<T>): T;
}
```

### 类型

| 类型                | 说明                                                 |
| ------------------- | ---------------------------------------------------- |
| `Component<P>`      | `(props: P \| undefined, ctx: Ctx) => RenderFn<P>`   |
| `RenderFn<P>`       | `(props: P \| undefined) => ComponentChildren`       |
| `Ctx`               | 组件上下文（update / onMount / onUnmount / consume） |
| `PropsOf<T>`        | 提取组件 Props 类型                                  |
| `RenderResultOf<T>` | 提取 render 函数返回类型                             |

### createContext

```ts
const Theme = createContext("light");

// Provider（JSX）
<ThemeCtx.Provider value="dark">
  <Child />
</ThemeCtx.Provider>

// Consumer
function Themed(_props, ctx) {
  return () => {
    const theme = ctx.consume(ThemeCtx);
    return <div class={theme}>themed content</div>;
  };
}
```

无 Provider 包裹时，`consume` 返回 `defaultValue`。

### ErrorBoundary

捕获子组件渲染错误：

```tsx
import { ErrorBoundary } from "trrn";

<ErrorBoundary
  fallback={(err, reset) => (
    <div>
      <p>{err.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )}
>
  <RiskyComponent />
</ErrorBoundary>;
```

`fallback` 接收两个参数：

- `error` — 捕获到的 Error 对象
- `reset` — 重设错误状态，重新挂载子树

### StrictMode

开发模式 double-invoke render 函数以检测副作用：

```tsx
<StrictMode>
  <App />
</StrictMode>
```

生产构建中移除。

### TRRN_MARKER

显式标记函数为 trrn 组件（跳过自动检测）：

```tsx
import { TRRN_MARKER } from "trrn";

function MyComponent(props, ctx) {
  return () => <div />;
}
(MyComponent as any)[TRRN_MARKER] = true;
```

---

## 内部架构

```
src/
  index.ts           — 导出所有公共 API
  types.ts           — Ctx, RenderFn, Component, Context 等类型定义
  adapter.ts         — createTrrnAdapter(), getAdapter(), isTrrnComponent()
  h.ts               — h() 函数（trrn 组件 / HTML / Preact 三路自动适配）
  render.ts          — render() 根挂载
  action.ts          — action() 事件包装器
  context.ts         — createContext(), resolveContext(), createConsume()
  error-boundary.ts  — ErrorBoundary（Preact class 组件）
  strict-mode.ts     — StrictMode 开发辅助
  warnings.ts        — 开发警告（update-during-render, unmounted-update）
  jsx-runtime.ts     — JSX 运行时（react-jsx 模式）
```

### 适配器流程

```
h(Component, props, children)
  │
  ▼
getAdapter(Component)
  ├── 有缓存（WeakMap）→ 返回缓存的 Adapter
  └── 无缓存
      ├── isTrrnComponent(Component)?
      │   ├── TRRN_MARKER 显式标记 → 按标记
      │   ├── function.length >= 2 → trrn 组件（props + ctx）
      │   └── length < 2 → 运行时探测
      ├── trrn → createTrrnAdapter(Component)
      │          ├── useState → tick (forceUpdate)
      │          ├── useRef → renderFn, propsRef, internalRef
      │          ├── useEffect → onMount, onUnmount
      │          ├── resolveContext → 预收集 context 值
      │          └── renderingRef → 跟踪渲染阶段
      ├── class 组件（prototype.render）→ PreactPassthrough
      └── Preact → PreactPassthrough
                   └── preactH(Component, props)
```

### Props 同步机制

```
父组件重渲染：
  Adapter(props)  → internalRef=false → propsRef = props → renderFn(propsRef)

ctx.update()：
  update()        → internalRef=true → tick(n+1) → Adapter(props)
                   → internalRef=true → 跳过 propsRef = props → 使用当前 propsRef

ctx.update(newProps)：
  update({x:1})   → internalRef=true → propsRef = {...propsRef, ...newProps}
                   → tick(n+1) → 跳过父组件 props 覆盖
```

### 组件检测优先级

1. **TRRN_MARKER Symbol**（最高优先级）
   - `true` → trrn 组件
   - `false` → 非 trrn 组件（如 ErrorBoundary 显式标记为 false）
2. **Class 组件检测** — `type.prototype?.render` → PreactPassthrough
3. **参数数量启发式** — `type.length >= 2` → trrn 组件
4. **运行时探测** — 调用 `type({}, probeCtx)` 判断返回是否为函数

---

## 常见陷阱

### 1. 修改了闭包变量但没有调用 ctx.update()

```tsx
// ✗ 错误：count 变了但视图不变
let count = 0;
<button onClick={() => { count++; }} />

// ✓ 正确
<button onClick={() => { count++; update(); }} />
```

**任何需要反映在 UI 上的闭包变量变更，后面必须跟 `ctx.update()`。**

### 2. 外层解构 props 导致值不更新

```tsx
function Comp(props, _ctx) {
  const { name } = props ?? {}; // ✗ 只取初始值，后续更新失效
  return () => <div>{name}</div>; // name 始终是初始值
}
```

外层解构只取到初始 props。需要最新值应:

```tsx
function Comp(_props, _ctx) {
  return (latestProps) => {
    const { name } = latestProps as any; // ✓ 每次渲染取最新值
    return <div>{name}</div>;
  };
}
```

### 3. 在 render 函数中调用 ctx.update()

```tsx
return () => {
  update(); // ✗ 会造成无限循环！
  return <div />;
};
```

`ctx.update()` 只能在事件处理器、异步回调中调用。如果在渲染过程中调用，trrn 会在开发模式下给出警告。

### 4. 列表渲染忘记 key

```tsx
{
  items.map((item) => <li>{item.text}</li>);
} // ✗ 缺少 key
{
  items.map((item) => <li key={item.id}>{item.text}</li>);
} // ✓
```

---

## 与 Preact 生态互操作

trrn 的 `h()` 自动适配标准 Preact 组件，任何 Preact hooks 组件、第三方库均可直接使用：

```tsx
import { Router } from "preact-iso";

<Router>
  <TrrnPage path="/" /> {/* trrn 组件 */}
  <PreactPage path="/about" /> {/* Preact hooks 组件 */}
</Router>;
```

适配规则：

- trrn 组件：通过 `getAdapter` 包装后渲染
- Preact 组件：通过 `PreactPassthrough` 原生渲染
- 所有 Preact hooks、`preact/compat`（React 兼容层）均可直接使用

---

## 框架对比

| 特性       | trrn                               | React/Preact                   |
| ---------- | ---------------------------------- | ------------------------------ |
| 状态管理   | 闭包变量                           | `useState` / `useReducer`      |
| 触发更新   | `ctx.update()`                     | `setState` / `dispatch`        |
| 组件定义   | `(props, ctx) => (props) => VNode` | `(props) => VNode`（函数组件） |
| Hooks 规则 | 无限制（外层即初始化）             | 必须顺序调用                   |
| 依赖数组   | 无（闭包自动捕获）                 | 手动声明                       |
| 生命周期   | `onMount` / `onUnmount`            | `useEffect`                    |
| Context    | `ctx.consume()`                    | `useContext()`                 |
| 错误边界   | `ErrorBoundary`                    | `componentDidCatch`            |
| 状态初始化 | 外层必然执行一次                   | `useState` 惰性初始化可选      |

### 何时使用 trrn

- 想要闭包自然的变量作用域，不想管理依赖数组
- 希望状态更新是显式的（`ctx.update()`），而非响应式追踪
- 想用普通函数写组件，无需 `defineComponent` 包装
- 已经在用 Preact 生态，想用更轻量的组件模式

### 注意

- 不直接支持 `async (props) => VNode` 模式，推荐外层异步 + `ctx.update()`
- Preact 11 beta 在 jsdom 中 `componentDidCatch` 不可用（不影响浏览器环境）
- SSR 支持目前未完整验证

---

## License

MIT
