# 使用 vanity-h

[vanity-h](https://github.com/VanityH/vanityh) 是一个链式 DSL 构建器，可将 `h()` 调用转为 SwiftUI/Flutter 风格的链式语法。trrn 原生兼容 vanity-h。

## 安装

```bash
npm install vanity-h
```

## 创建实例

用 trrn 的 `h` 函数创建 vanity 实例：

```ts
import { h } from "trrn";
import createVanity from "vanity-h";

const { div, span, button, h1, input } = createVanity(h);
```

## HTML 元素

```ts
// 原生 h()
h("div", { class: "card" }, h("span", null, "Hello"), h("button", { onClick: fn }, "Click"));

// vanity-h 链式
div.class("card")(span("Hello"), button.onClick(fn)("Click"));
```

**void 元素** 需要空调用 `()`：

```ts
input.value(text).onInput(handle).placeholder("...")();
hr();
br();
```

## 调用 trrn 组件

### `$` 语法

无 props 的组件直接调用 `$()`：

```ts
Counter.$();
TodoList.$();
```

带 props 通过链式传入：

```ts
Counter.$.initial(5)();
```

### `v.x()` 语法

支持泛型类型推断：

```ts
v.x<{ initial?: number }>(Counter).initial(10)();
```

## 嵌套

```ts
div.class("container")(header(h1("Title")), main(Counter.$.initial(0)(), TodoList.$()));
```

## 与 Context Provider 配合

```ts
const Theme = createContext("light");

// $.value() 设置 Provider 的值
Theme.Provider.$.value("dark")(Sidebar.$(), Content.$());
```

## 限制

- `createVanity(h)` 只能调用一次（会设置 `Object.prototype.$`）
- trrn 组件的 `$` 不带类型推断（需要 `defineComponent` 配合，但 trrn 组件模式不同）
- 使用 `v.x<Props>(Comp)` 代替以获得更好的类型支持
