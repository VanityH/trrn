# Pattern Guide

## 闭包状态

### 基础类型

```ts
function Comp(_props, ctx) {
  let count = 0;
  let text = "";

  return (_p) =>
    h(
      "div",
      null,
      h("span", null, String(count)),
      h("input", {
        value: text,
        onInput: (e) => {
          text = e.target.value;
          ctx.update();
        },
      }),
    );
}
```

### 对象 / 数组

```ts
function List(_props, ctx) {
  let items = [{ id: 1, text: "a" }];

  const add = () => {
    items = [...items, { id: Date.now(), text: "new" }];
    ctx.update();
  };

  return (_p) =>
    h(
      "div",
      null,
      h("button", { onClick: add }, "Add"),
      ...items.map((i) => h("div", { key: i.id }, i.text)),
    );
}
```

## Props

### 接收 Props

```ts
function Greeting(props: { name: string }, ctx) {
  const { name } = props ?? { name: "Guest" };
  return (_p) => h("span", null, `Hello ${name}`);
}
```

### 更新 Props

```ts
ctx.update({ page: 2, filter: "active" });
// 新 props 合并到当前 props，传给 render 函数
```

## 事件处理

### 手动 update

```ts
button.onClick(() => {
  count++;
  ctx.update();
})("+");
```

### action() 自动 update

```ts
import { action } from "trrn";

button.onClick(
  action(ctx, () => {
    count++;
  }),
)("+");
```

## 条件渲染

```ts
return (_p) =>
  h(
    "div",
    null,
    showHeader ? h("header", null, "Title") : null,
    items.length > 0
      ? h("ul", null, ...items.map((i) => h("li", { key: i.id }, i.text)))
      : h("p", null, "No items"),
  );
```

## 列表渲染

```ts
return (_p) =>
  h(
    "ul",
    null,
    ...todos.map((todo) =>
      h(
        "li",
        { key: todo.id },
        h(
          "span",
          {
            onClick: () => toggle(todo.id),
            style: `text-decoration: ${todo.done ? "line-through" : "none"}`,
          },
          todo.text,
        ),
      ),
    ),
  );
```

**务必使用 `key` 属性**，否则列表更新时 DOM 可能不会正确复用。

## 异步数据

```ts
function DataLoader(props, ctx) {
  let status = "loading";
  let data = null;

  // 外层启动异步操作
  fetch(`/api/user/${props.id}`)
    .then((r) => r.json())
    .then((d) => {
      data = d;
      status = "done";
      ctx.update();
    });

  return (_p) => {
    if (status === "loading") return h("div", null, "Loading...");
    return h("div", null, data.name);
  };
}
```

## 组件组合

### 父传子 Props

```ts
function Parent(_props, ctx) {
  let selected = null;

  return (_p) =>
    h(
      "div",
      null,
      h(Child, {
        name: "Alice",
        onSelect: (v) => {
          selected = v;
          ctx.update();
        },
      }),
      selected && h("span", null, `Selected: ${selected}`),
    );
}
```

### 深层嵌套

```ts
h(Page, null, h(Layout, null, h(Sidebar, null), h(Content, null, h(Card, null))));
// 每层独立状态，通过 props 通信
```

## Context

```ts
const Theme = createContext("light");

function App(_props, _ctx) {
  return (_p) =>
    h(
      Theme.Provider,
      { value: "dark" },
      h(
        "div",
        null,
        h(Sidebar, null), // consume → "dark"
        h(Content, null), // consume → "dark"
      ),
    );
}
```

> 使用 vanity-h 链式语法：`Theme.Provider.$.value("dark")(...)`，详见 [vanity-h 使用指南](./vanity-h.md)。

## DOM Ref

```ts
let inputEl: HTMLInputElement | null = null;

ctx.onMount(() => {
  inputEl?.focus();
});

return (_p) =>
  h("input", {
    ref: (el) => {
      inputEl = el;
    },
    placeholder: "Focus on mount",
  });
```
