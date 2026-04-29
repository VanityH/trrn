# Component & ctx

## Component 类型

```ts
type Component<P = Record<string, unknown>> = (props: P | undefined, ctx: Ctx) => RenderFn<P>;

type RenderFn<P> = (props: P | undefined) => ComponentChildren;
```

## 模式

```ts
function Counter(props, ctx) {
  // ═══ 外层：只执行一次 ═══
  let count = props?.initial ?? 0;

  ctx.onUnmount(() => console.log("cleanup"));

  // ═══ render 函数：每次更新执行 ═══
  return (props) => {
    return h(
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
  };
}
```

## 核心规则

1. **外层函数只执行一次** — 闭包变量就是"状态"
2. **render 函数每次渲染执行** — 首次 + 每次 `ctx.update()` 后
3. **直接修改闭包变量** — 无需 `useState`、`setState`
4. **`ctx.update()` 触发渲染** — 显式更新，无隐式追踪

## 与 Preact/React 的差异

|          | trrn                | React/Preact          |
| -------- | ------------------- | --------------------- |
| 状态     | 闭包变量            | useState / useReducer |
| 更新     | `ctx.update()`      | setState / dispatch   |
| 清理     | `ctx.onUnmount(fn)` | useEffect return      |
| DOM 就绪 | `ctx.onMount(fn)`   | useEffect(fn, [])     |
| 组件类型 | 普通函数            | 函数组件 + hooks      |
