# trrn

基于 [Preact](https://preactjs.com/) 的闭包状态组件框架。无 `useState`、无 hooks——只有函数和闭包。

```tsx
import { defineComponent } from "trrn";

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

---

## 目录

- [核心理念](#核心理念)
- [安装](#安装)
- [组件模式](#组件模式)
- [更新机制](#更新机制)
- [Props 与数据流](#props-与数据流)
- [生命周期](#生命周期)
- [与 Preact 互操作](#与-preact-互操作)
- [API 参考](#api-参考)
- [常见陷阱](#常见陷阱)

---

## 核心理念

**闭包就是状态。**

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
    // │ 返回 VNode                          │
    // └─────────────────────────────────────┘
  };
});
```

- 外层闭包变量就是组件的"状态"——无需 `useState`
- 修改闭包变量后调用 **`ctx.update()`** 触发重渲染——无需 `setState`、无隐式依赖追踪
- `defineComponent` 返回**标准 Preact 组件**——与 Preact 生态 100% 互操作

---

## 安装

```bash
npm install trrn preact
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

使用 Preact 的 JSX 运行时，trrn 组件是标准 Preact 组件，直接使用 Preact 的 JSX 转换。

### 入口

```tsx
import { render, h } from "preact";
import { App } from "./app.tsx";

render(h(App, null), document.getElementById("app")!);
```

> trrn 不提供 `render` 和 `h`——直接使用 Preact 原生 API。

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

## Props 与数据流

### 父传子

父组件 `update()` → Preact 重渲染 → 新 JSX props 传入子组件：

```
父组件调用 update()
  └─ Preact 重渲染父组件，生成新 VNode
      └─ <Child label={value} /> 传入新 props
          └─ Child 的 render 函数参数 label = 最新值
```

### render 函数的参数 = 最新 props

render 函数每次渲染执行，其 props 参数始终是**最新值**：

```tsx
defineComponent(({ title }: { title: string }) => {
  // 外层 title = 初始值（只执行一次）
  return (p) => {
    // p.title = 最新值（每次渲染）
    return <div>{p.title}</div>;
  };
});
```

### internalRef 机制

`defineComponent` 内部通过 `internalRef` 区分"父组件重渲染"和"自身 update"：

- 父组件重渲染 → `internalRef = false` → propsRef 被新 props 覆盖
- `ctx.update()` 触发 → `internalRef = true` → propsRef 保持不变
- `ctx.update(newProps)` → newProps 合并到 propsRef

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

## 与 Preact 互操作

`defineComponent` 返回**标准 Preact 组件**，与 Preact 生态完全兼容：

```tsx
import { defineComponent } from "trrn";
import { Router } from "preact-iso";
import { useRoute } from "preact-iso";

// trrn 组件
const Page = defineComponent(() => {
  return () => <div>Hello</div>;
});

// Preact hooks 组件
function Sidebar() {
  const { path } = useRoute();
  return <nav>{path}</nav>;
}

// 混用，无差别
const App = defineComponent(() => {
  return () => (
    <Router>
      <Page path="/" />
      <Sidebar path="/sidebar" />
    </Router>
  );
});
```

- 可直接使用 Preact hooks（`useState`、`useEffect` 等）——但既然用了 trrn 就不需要了
- 可直接使用 Preact Context、错误边界、Suspense
- 第三方 Preact 库无需任何适配层

---

## API 参考

### 导出

| 导出                       | 说明                                 |
| -------------------------- | ------------------------------------ |
| `defineComponent(factory)` | 定义 trrn 组件，返回标准 Preact 组件 |
| `ErrorBoundary`            | 错误边界（Preact class 组件）        |

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
| `RenderFn<P>`    | `(props: P) => ComponentChildren`          |
| `ComponentFn<P>` | `(props: P, ctx: Ctx) => RenderFn<P>`      |

### ErrorBoundary

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

### 4. 列表渲染忘记 key

Preact 依赖 key 优化列表 diff，任何时候使用 `.map()` 渲染列表都要加 key。

---

## License

MIT
