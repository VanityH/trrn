# h()

```ts
function h<P>(type: Component<P>, props: P | null, ...children): VNode;
function h(type: string, props: Record<string, unknown> | null, ...children): VNode;
```

创建 VNode。与 Preact 的 `h()` 兼容，但对 trrn 组件自动适配。

## 使用

### HTML 元素

```ts
h(
  "div",
  { class: "container" },
  h("span", null, "Hello"),
  h("button", { onClick: () => alert("hi") }, "Click"),
);
```

### trrn 组件

```ts
const child = h(Counter, { initial: 5 }); // trrn 组件
const parent = h("div", null, child); // 嵌套
```

### Preact 生态组件

任何标准 Preact 组件（包括 hooks 组件、第三方库）都可直接在 trrn 中使用：

```ts
import { Router, Route } from "preact-iso";

h(
  Router,
  null,
  h(TrrnPage, { path: "/" }), // trrn 组件
  h(PreactPage, { path: "/about" }), // Preact 组件
);
```

trrn 的 `h()` 自动识别：`length >= 2` 的走 trrn 适配器，`length < 2` 的走 Preact 原生渲染。

### 与 vanity-h 配合

trrn 的 `h` 可直接作为 vanity-h 的渲染器。详见 [vanity-h 使用指南](../guide/vanity-h.md)。
