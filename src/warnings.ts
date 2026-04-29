/**
 * 开发模式警告系统。
 * 生产构建中通过 dead-code elimination 移除。
 */

// 构建工具（如 Vite/esbuild）会在 define 中替换此值
declare const __DEV__: boolean;

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : true;

function warn(message: string): void {
  if (isDev) {
    console.warn(`[trrn] ${message}`);
  }
}

// ── Warning helpers ───────────────────────────────────────────

/** ctx.update() 在 render 函数执行期间被调用 */
export function warnUpdateDuringRender(componentName: string): void {
  warn(
    `ctx.update() called during render in <${componentName}>. ` +
      "This may cause an infinite loop. Move the update() call to an event handler or async callback.",
  );
}

/** 组件已卸载后 ctx.update() 被调用 */
export function warnUpdateAfterUnmount(componentName: string): void {
  warn(
    `ctx.update() called after unmount in <${componentName}>. ` +
      "The update was ignored. Consider cleaning up async operations in ctx.onUnmount().",
  );
}

/** 启用警告（用于测试） */
export function enableWarnings(): void {
  // no-op — __DEV__ 由构建工具控制
}

/** 禁用警告（用于测试） */
export function disableWarnings(): void {
  // no-op — 生产构建自动移除
}
