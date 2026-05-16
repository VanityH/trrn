# trrn-h

用 **闭包变量** 替代 `useState`，用 **`update()`** 替代 `setState`。render 函数中仍可自由使用 React hooks。实验性项目。

```tsx
import { defineComponent } from "trrn-h";

const Counter = defineComponent(({ initial = 0 }, { update }) => {
  let count = initial; // 闭包 = 状态（只初始化一次）
  return () => (
    // render 函数 = 每次渲染执行
    <button
      onClick={() => {
        count++;
        update();
      }}
    >
      {count}
    </button>
  );
});
```

---

## 核心概念

```
defineComponent((props, ctx) => {
  // ┌─ 工厂函数 ─────────────────────────┐
  // │ 只执行一次，闭包变量 = 组件状态     │
  // │ ctx.onMount / ctx.onUnmount 注册    │
  // └─────────────────────────────────────┘
  return (props) => {
    // ┌─ render 函数 ────────────────────┐
    // │ 每次渲染执行，可使用 React hooks │
    // │ props 始终是最新值               │
    // └──────────────────────────────────┘
  };
});
```

| API                 | 作用                                           |
| ------------------- | ---------------------------------------------- |
| `ctx.update()`      | 触发重渲染（修改闭包后调用）                   |
| `ctx.onMount(fn)`   | DOM 挂载后回调（基于 `useEffect`，SSR 不执行） |
| `ctx.onUnmount(fn)` | 卸载时清理                                     |
| render 中的 hooks   | `useContext`、`useMemo`、`use()` 等全部可用    |

工厂函数**不能用 hooks**（不在组件顶层），render 函数**全都能用**——闭包和 hooks 按需选用。

### render 函数的 props 始终是最新值

工厂函数的 `props` 参数**只初始化一次**（闭包捕获），而 render 函数的 `props` 参数**每次渲染都是最新的**：

```tsx
const Comp = defineComponent(({ label }: { label: string }) => {
  // 外层 label — 仅初始值（闭包捕获后不再更新）
  return ({ label }) => <div>{label}</div>;
  //       ^^^^^^^^  同名解构参数遮蔽外层变量，每次渲染都是最新值
});
```

利用 JavaScript 的**变量遮蔽（shadowing）**，render 函数参数解构与工厂函数解构参数同名时，render 函数内部引用的是**参数**（最新值），而非外层闭包变量（初始值）。

父组件更新 props 时，React 重新调用组件函数，render 函数收到最新的 props。**任何依赖 props 的渲染逻辑都要用 render 函数的参数**，不要用外层工厂函数的参数。

---

## 安装

```bash
npm install trrn-h
```

```json
// tsconfig.json
{ "compilerOptions": { "jsx": "react-jsx" } }
```

```tsx
// 入口
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("app")!).render(<App />);
```

> Preact 项目配置 `@preact/preset-vite` 将 `react` 自动映射到 `preact/compat` 即可使用。

---

## 完整示例

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

```tsx
// hooks + 闭包联用
const DataList = defineComponent((_, { update, onMount }) => {
  let items = [];

  onMount(async () => {
    items = await fetch("/api/data").then((r) => r.json());
    update();
  });

  return () => {
    const theme = useContext(ThemeCtx);       // hook
    const filtered = useMemo(() => items.filter(...), [items]);
    return <div className={theme}>{filtered}</div>;
  };
});
```

```tsx
// ErrorBoundary
import { ErrorBoundary } from "trrn-h";

<ErrorBoundary fallback={(err, reset) => <button onClick={reset}>重试</button>}>
  <RiskyComponent />
</ErrorBoundary>;
```

---

## SSR

天然兼容。`onMount` 在 SSR 期间不执行（基于 `useEffect`），hydrate 后自动触发。`update()` 在服务端安全调用但不产生效果。

---

## 常见陷阱

| #   | 陷阱                                    | 正确                             |
| --- | --------------------------------------- | -------------------------------- |
| 1   | 修改闭包后忘了 `update()`               | `count++; update();`             |
| 2   | render 函数中调 `update()`（无限循环）  | 只在事件/异步/生命周期中调用     |
| 3   | render 函数用了外层 props（永远初始值） | 用 `(p) => p.label` 而非 `label` |

---

## License

MIT
