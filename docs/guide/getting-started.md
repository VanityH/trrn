# Getting Started

## 安装

```bash
npm install trrn preact
```

## 第一个组件

```ts
import { render, h } from "trrn";

function Counter(_props, ctx) {
  let count = 0;

  return (_p) =>
    h(
      "div",
      null,
      h("span", null, String(count)),
      h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        "+",
      ),
    );
}

render(Counter, document.getElementById("app"));
```

## 理解模式

trrn 组件有两层：

```
外层 (props, ctx) → render 函数
  │                    │
  │ 执行一次            │ 每次渲染调用
  │ 持有状态            │ 返回 VNode
  │ 注册生命周期        │ 读取最新状态
```

### 状态 = 闭包变量

```ts
function Comp(_props, ctx) {
  let name = ""; // ← 这就是状态
  let items = []; // ← 这也是状态

  return (_p) =>
    h(
      "div",
      null,
      h("input", {
        value: name,
        onInput: (e) => {
          name = e.target.value;
          ctx.update();
        },
      }),
      ...items.map((i) => h("div", null, i)),
    );
}
```

### 更新触发渲染

每次修改了状态需要反映到 UI 时，调用 `ctx.update()`。

### 生命周期

```ts
function Comp(_props, ctx) {
  ctx.onMount(() => {
    /* DOM 就绪 */
  });
  ctx.onUnmount(() => {
    /* 清理定时器/订阅 */
  });

  return (_p) => h("div", null, "hello");
}
```

## 使用 vanity-h（可选）

trrn 兼容 [vanity-h](https://github.com/VanityH/vanityh) 链式 DSL。详见 [vanity-h 使用指南](./vanity-h.md)。

## 下一步

- [Pattern Guide](./patterns.md) — 常见模式
- [vanity-h 指南](./vanity-h.md) — 链式 DSL 语法
- [API Reference](../api/README.md) — 完整 API
- [Comparison](./comparison.md) — 与其他框架对比
