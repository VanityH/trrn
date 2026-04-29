# ctx

```ts
interface Ctx {
  update(newProps?: Record<string, unknown>): void;
  onMount(fn: () => void): void;
  onUnmount(fn: () => void): void;
  consume<T>(context: Context<T>): T;
}
```

## ctx.update(newProps?)

触发重渲染。可选传入新的 props，会与当前 props 合并。

```ts
ctx.update(); // 仅触发重渲染
ctx.update({ page: 2 }); // 更新 props + 触发重渲染
```

**注意**：不能在 render 函数执行期间调用 `ctx.update()`（会造成无限循环）。只在事件处理或异步回调中调用。

## ctx.onMount(fn)

注册 DOM 挂载后的回调。此时可以安全访问 DOM 元素。

```ts
ctx.onMount(() => {
  document.querySelector("input")?.focus();
});
```

## ctx.onUnmount(fn)

注册卸载清理回调。类似于 React 的 `useEffect(() => () => cleanup, [])`。

```ts
ctx.onUnmount(() => {
  clearInterval(timer);
});
```

## ctx.consume(context)

读取 Context 值。见 [createContext](./context.md)。
