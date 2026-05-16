# trrn-h

**React 闭包组件包装器** — 用闭包变量管理状态，同时完整保留 hooks 能力。实验性项目。

```tsx
import { defineComponent } from "trrn-h";

const Counter = defineComponent(({ initial = 0 }, { update }) => {
  let count = initial; // 闭包 = 状态

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
});
```

> trrn-h 是一个实验性探索，代码和文档由 AI 辅助生成。它不对应某个生产框架，只是对"闭包驱动 UI"这个思路的尝试。不适合生产使用。

---

## 目录

- [概念](#概念)
- [安装](#安装)
- [组件模式](#组件模式)
- [更新机制](#更新机制)
- [生命周期](#生命周期)
- [Render 函数中的 React hooks](#render-函数中的-react-hooks)
- [SSR 兼容性](#ssr-兼容性)
- [生态集成](#生态集成)
- [API 参考](#api-参考)
- [常见陷阱](#常见陷阱)

---

## 概念

**闭包就是状态。hooks 仍是 hooks。二者共存。**

```
defineComponent((props, ctx) => {
  // ┌─ 工厂函数 ──────────────────────────┐
  // │ 只执行一次                           │
  // │ 闭包变量 = 组件状态                  │
  // │ 注册生命周期回调                     │
  // └──────────────────────────────────────┘

  return (props) => {
    // ┌─ render 函数 ──────────────────────┐
    // │ 每次渲染执行                        │
    // │ props 始终是最新值                  │
    // │ 可使用 React hooks                  │
    // │ 返回 VNode                          │
    // └─────────────────────────────────────┘
  };
});
```

- **工厂函数**只执行一次，闭包变量充当组件状态——无需 `useState`
- **Render 函数**每次渲染执行，可以调用 `useContext`、`useMemo` 等 React hooks
- 修改闭包变量后调用 **`ctx.update()`** 触发重渲染——无需 `setState`
- `defineComponent` 返回**标准 React 组件**——与 React 生态 100% 互操作

```tsx
// 闭包管理状态 + hooks 处理上下文和性能优化，自由组合
const Comp = defineComponent((_, { update, onMount }) => {
  let data = null;

  onMount(async () => {
    data = await fetchData();
    update();
  });

  return () => {
    const theme = useContext(ThemeCtx); // hook 在此处使用
    return <div className={theme}>{data}</div>;
  };
});
```

---

## 安装

```bash
npm install trrn-h
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

trrn-h 组件是标准 React 组件，使用 React 的 JSX 运行时。

### 入口

```tsx
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";

createRoot(document.getElementById("app")!).render(<App />);
```

> trrn-h 不提供 `render`——直接使用 `react-dom` 原生 API。

### 在 Preact 项目中使用

如需在 Preact 项目中使用 trrn-h，请配置 Preact 的兼容层（如 `@preact/preset-vite`），它会将 `react` 和 `react-dom` 的引用自动映射到 `preact/compat`，无需修改任何代码。

---

## 组件模式

### 基础

```tsx
const Greeting = defineComponent(({ name }: { name: string }) => {
  return () => <div>Hello, {name}!</div>;
});
```

不需要 ctx 时，省略第二个参数。不需要初始 props 时，使用 `_` 占位：

```tsx
const Timer = defineComponent((_, { onMount, onUnmount, update }) => {
  let seconds = 0;
  let timerId: ReturnType<typeof setInterval>;

  onMount(() => {
    timerId = setInterval(() => {
      seconds++;
      update();
    }, 1000);
  });
  onUnmount(() => clearInterval(timerId));

  return () => <div>{seconds}s</div>;
});
```

### 闭包状态

外层函数的变量就是组件的全部状态。读取直接使用变量名，修改后调用 `update()`：

```tsx
const TodoList = defineComponent((_, { update }) => {
  let items = [{ id: 1, text: "a" }];
  let input = "";

  const addItem = () => {
    items = [...items, { id: Date.now(), text: input }];
    input = "";
    update();
  };

  return () => (
    <div>
      <input
        value={input}
        onInput={(e) => {
          input = (e.target as HTMLInputElement).value;
          update();
        }}
      />
      <button onClick={addItem}>添加</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
});
```

### 嵌套组件

子组件通过 render 函数的 props 参数接收最新数据。父组件触发 `update()` 后，新 JSX props 自动传入子组件：

```tsx
const Child = defineComponent(({ label }: { label: string }) => {
  return (p) => <span>{p.label}</span>;
});

const Parent = defineComponent((_, { update }) => {
  let value = "";
  return () => (
    <div>
      <input
        onInput={(e) => {
          value = (e.target as HTMLInputElement).value;
          update();
        }}
      />
      <Child label={value} />
    </div>
  );
});
```

### hooks 与闭包联用

在 render 函数中使用 hooks 处理副作用，工厂函数中用闭包保存可变数据：

```tsx
const DataList = defineComponent((_, { update }) => {
  let items = [];

  return () => {
    // render 函数中可使用任意 React hooks
    const search = useSearchParams();
    const filtered = useMemo(
      () => items.filter((i) => i.name.includes(search.get("q") || "")),
      [search, items],
    );

    return (
      <ul>
        {filtered.map((i) => (
          <li key={i.id}>{i.name}</li>
        ))}
      </ul>
    );
  };
});
```

---

## 更新机制

### ctx.update()

调用 `update()` 触发组件重渲染，render 函数重新执行并返回新 VNode：

```tsx
let count = 0;

// 正确：修改闭包后 update()
<button onClick={() => { count++; update(); }} />

// 错误：只改闭包不 update()，视图不会更新
<button onClick={() => { count++; }} />
```

**任何需要反映在 UI 上的闭包变量变更，后面必须跟 `ctx.update()`。**

---

## 生命周期

### onMount

DOM 挂载后执行一次，适合做数据请求、DOM 操作、注册定时器：

```tsx
onMount(() => {
  fetchData().then((result) => {
    data = result;
    update();
  });
});
```

### onUnmount

组件卸载时执行清理：

```tsx
onUnmount(() => {
  clearInterval(timerId);
  removeEventListener("scroll", handler);
});
```

可以多次调用，所有回调都会在卸载时执行：

```tsx
const Comp = defineComponent((_, { onMount, onUnmount }) => {
  onMount(() => {
    /* 初始化 A */
  });
  onUnmount(() => {
    /* 清理 A */
  });
  onUnmount(() => {
    /* 清理 B */
  });
});
```

---

## Render 函数中的 React hooks

trrn-h 组件是标准 React 组件。render 函数在渲染时执行，其中**可以调用所有 React hooks**：

```tsx
const Comp = defineComponent(() => {
  // 工厂函数中不可使用 hooks（不在组件顶层）
  let state = null;

  return () => {
    // render 函数中可使用 hooks
    const theme = useContext(ThemeCtx);
    const items = useMemo(() => expensive(state), [state]);
    const ref = useRef(null);
    return <div ref={ref}>{items}</div>;
  };
});
```

> hooks **只能在 render 函数**中调用，不能在 factory 中调用。这是因为 factory 不在组件顶层执行，不满足 hooks 的调用规则。闭包变量和 hooks 是互补关系——按需选用，各取所长。

---

## SSR 兼容性

trrn-h 基于 React 标准 API（`useState` / `useRef` / `useEffect`），天然支持服务端渲染。

需要注意的点：

- **`onMount` 回调在 SSR 期间不会执行**——它基于 `useEffect`，在服务端被静默跳过。如果在 `onMount` 中执行了 DOM 操作或浏览器 API，SSR 产物不会包含这些逻辑。hydrate 后 `onMount` 会自动执行。
- **`onUnmount` 类似地只在客户端组件卸载时触发**。
- **`update()` 在 SSR 期间可以安全调用**——但因为服务端没有重渲染通道，调用不会产生效果，组件仍会渲染初始状态。

```tsx
const SafeComponent = defineComponent((_, { onMount, onUnmount, update }) => {
  let isClient = false;

  onMount(() => {
    isClient = true; // 仅在客户端 true
  });

  return () => <div>{isClient ? "客户端渲染" : "服务端渲染"}</div>;
});
```

这符合 React SSR 的行为预期——`onMount` 在 hydrate 后执行，不会导致 SSR 产物与服务端不匹配。

---

## 生态集成

trrn-h 组件是标准 React 组件，render 函数开放所有 React hooks，因此可以与多数生态库配合使用。

### Zustand — 全局状态管理

Zustand 不依赖 Provider，store 可直接在 factory 中订阅：

```tsx
import { createStore } from "zustand/vanilla";

const store = createStore((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

const Counter = defineComponent((_, { update, onUnmount }) => {
  const unsub = store.subscribe(() => update());
  onUnmount(() => unsub());

  return () => (
    <div>
      <span>{store.getState().count}</span>
      <button onClick={() => store.getState().inc()}>+</button>
    </div>
  );
});
```

store 在组件外定义，不受组件生命周期影响。`subscribe` + `update()` 实现响应式同步。

### vanity-h — 流畅的 hyperscript DSL

替代 `h(tag, props, children)` 嵌套写法：

```tsx
import { h } from "react-dom";
import createVanity from "vanity-h";

const { div, button, span } = createVanity(h);

const Counter = defineComponent(() => {
  return () => {
    const [count, setCount] = useState(0);
    return div(button.onClick(() => setCount((n) => n + 1))("+"), span(count));
  };
});
```

vanity-h 仅 186 字节，支持 React、Preact、Vue 等任何 hyperscript 兼容框架。

---

## API 参考

### 导出

| 导出                       | 说明                                  |
| -------------------------- | ------------------------------------- |
| `defineComponent(factory)` | 定义 trrn-h 组件，返回标准 React 组件 |
| `ErrorBoundary`            | 错误边界（React class 组件）          |

### Ctx 接口

```ts
interface Ctx {
  /** 触发重渲染 */
  update(): void;
  /** DOM 挂载后回调 */
  onMount(fn: () => void): void;
  /** 卸载时清理回调（支持多次调用） */
  onUnmount(fn: () => void): void;
}
```

### 类型

| 类型             | 说明                                       |
| ---------------- | ------------------------------------------ |
| `Ctx`            | 组件上下文（update / onMount / onUnmount） |
| `RenderFn<P>`    | `(props: P) => ReactNode`                  |
| `ComponentFn<P>` | `(props: P, ctx: Ctx) => RenderFn<P>`      |

### ErrorBoundary

```tsx
import { ErrorBoundary } from "trrn-h";

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

---

## 常见陷阱

### 1. 修改了闭包但没有 update()

```tsx
let count = 0;
<button onClick={() => { count++; }} />       // ✗ 视图不变
<button onClick={() => { count++; update(); }} /> // ✓
```

### 2. 在 render 函数中调用 update()

```tsx
return () => {
  update(); // ✗ 无限循环！
  return <div />;
};
```

`update()` 只能在事件处理器、异步回调、生命周期中调用。

### 3. 使用外层 props 而非最新 props

```tsx
defineComponent(({ label }: { label: string }) => {
  return () => <div>{label}</div>; // ✗ label 永远是初始值
});

defineComponent(({ label }: { label: string }) => {
  return (p) => <div>{p.label}</div>; // ✓ p.label 是最新值
});
```

---

## License

MIT
