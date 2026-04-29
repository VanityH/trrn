# render()

```ts
function render<P>(Comp: Component<P>, container: ContainerNode, initialProps?: P): void;
```

挂载 trrn 组件到 DOM 容器。组件的外层函数执行一次，render 函数每次更新时执行。

## 参数

- `Comp` — trrn 组件函数
- `container` — DOM 容器元素（或 Preact `ContainerNode`）
- `initialProps` — 可选，初始 props

## 示例

```ts
import { render, h } from "trrn";

function App(_props, ctx) {
  let count = 0;
  return (_p) =>
    h(
      "button",
      {
        onClick: () => {
          count++;
          ctx.update();
        },
      },
      String(count),
    );
}

render(App, document.getElementById("app"));
```
