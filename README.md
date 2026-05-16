# trrn-h

**React 闭包组件包装器** — 用闭包变量替代 hooks。实验性项目。

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
- [生态集成](#生态集成)
- [API 参考](#api-参考)
- [常见陷阱](#常见陷阱)

---

## 概念

**闭包就是状态。**

```
defineComponent((props, ctx) => {
  // ┌─ 工厂函数 ──────────────────────────┐
  // │ 只执行一次                           │
  // │ 闭包变量 = 组件状态                  │
  │ 注册生命周期回调                     │
  // └──────────────────────────────────────┘

  return (props) => {
    // ┌─ render 函数 ──────────────────────┐
    // │ 每次渲染执行                        │
    │ props 始终是最新值                  │
    // │ 可使用 React hooks                 │
    // │ 返回 VNode                          │
    // └─────────────────────────────────────┘
  };
});
```

- 外层闭包变量就是组件的"状态"——无需 `useState`
- 修改闭包变量后调用 **`ctx.update()`** 触发重渲染——无需 `setState`、无隐式依赖追踪
- `defineComponent` 返回**标准 React 组件**——与 React 生态 100% 互操作

trrn-h 本身不做渲染、不做路由、不做状态管理——这些全部交给 React。它只是把 `useState` 换成了闭包变量，把 `setState` 换成了 `update()`。

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

### 状态提升

复杂交互场景推荐将状态提升到父组件管理，子组件通过回调通知父组件：

```tsx
const KanbanColumn = defineComponent(
  ({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) => {
    return (p) => (
      <div>
        <button onClick={p.onToggle}>{p.collapsed ? "展开" : "折叠"}</button>
        {!p.collapsed && <div>内容</div>}
      </div>
    );
  },
);

const Board = defineComponent((_, { update }) => {
  let collapsed = false;
  return () => (
    <KanbanColumn
      collapsed={collapsed}
      onToggle={() => {
        collapsed = !collapsed;
        update();
      }}
    />
  );
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

### ctx.update(newProps)

合并新 props 到当前 props，常用于组件内部覆盖传入的 props：

```tsx
defineComponent(({ page = 1 }) => {
  return (p) => <button onClick={() => update({ page: 2 })}>第 {p.page} 页</button>;
});
```

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

trrn-h 组件是标准 React 组件，render 函数在渲染时执行，因此其中可以调用所有 React hooks。

```tsx
const Comp = defineComponent(() => {
  return () => {
    const theme = useContext(ThemeCtx); // Context
    const items = useMemo(() => heavy(), [deps]); // 性能优化
    return <div>{theme}</div>;
  };
});
```

> hooks 只能在 render 函数中调用，不能在 factory 中调用。这是因为 factory 不在组件顶层执行，不满足 hooks 的调用规则。

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
  /** 触发重渲染。可选传入 newProps 合并到当前 props */
  update(newProps?: Record<string, unknown>): void;
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
