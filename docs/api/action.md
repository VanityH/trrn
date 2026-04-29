# action()

```ts
function action<P extends unknown[]>(ctx: Ctx, fn: (...args: P) => void): (...args: P) => void;
```

包装事件处理器，执行后自动调用 `ctx.update()`。减少手动写 `ctx.update()` 的样板代码。

## 示例

```ts
// 不用 action：每次都要手动 update
button.onClick(() => {
  count++;
  ctx.update();
})("+");

// 用 action：自动 update
button.onClick(
  action(ctx, () => {
    count++;
  }),
)("+");
```

## 转发事件参数

```ts
input.onInput(
  action(ctx, (e: Event) => {
    value = (e.target as HTMLInputElement).value;
  }),
);
```

## 多状态变更

```ts
button.onClick(
  action(ctx, () => {
    a++;
    b += 2;
  }),
)("inc");
// 所有变更完成后一次更新，而非每次变更都触发
```
