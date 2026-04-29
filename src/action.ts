import type { Ctx } from "./types.ts";

/**
 * 包装事件处理器，执行后自动调用 ctx.update()。
 * 减少每次事件处理中手动调用 ctx.update() 的样板代码。
 *
 * @example
 * button.onClick(action(ctx, () => count++))("+")
 */
export function action<P extends unknown[]>(
  ctx: Ctx,
  fn: (...args: P) => void,
): (...args: P) => void {
  return (...args: P) => {
    fn(...args);
    ctx.update();
  };
}
