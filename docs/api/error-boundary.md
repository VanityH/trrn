# ErrorBoundary

```ts
class ErrorBoundary extends Component<{
  fallback: (error: Error, reset: () => void) => ComponentChildren;
  children?: ComponentChildren;
}>
```

捕获子组件渲染错误的边界组件。基于 Preact 的 `componentDidCatch`。

## 使用

```ts
h(
  ErrorBoundary,
  {
    fallback: (err: Error, reset: () => void) =>
      h(
        "div",
        { class: "error" },
        h("p", null, err.message),
        h("button", { onClick: reset }, "Retry"),
      ),
  },
  h(RiskyComponent, null),
);
```

## fallback 回调

- `error` — 捕获到的 Error 对象
- `reset` — 回调函数，调用后重新挂载出错的子树

## 限制

- Preact 11 beta 在 jsdom 中 `componentDidCatch` 不可用（不影响浏览器环境）
- ErrorBoundary 只捕获 render 函数中的错误，外层初始化错误不会被捕获
