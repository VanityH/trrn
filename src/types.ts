import type { ComponentChildren } from "preact";

// ── Ctx: 组件上下文 ──────────────────────────────────────────

export interface Ctx {
  /** 触发重渲染，可选传入新的 props 合并到当前 props */
  update(newProps?: Record<string, unknown>): void;
  /** 注册 DOM 挂载后回调（可访问 DOM） */
  onMount(fn: () => void): void;
  /** 注册卸载时的清理回调 */
  onUnmount(fn: () => void): void;
}

// ── RenderFn ─────────────────────────────────────────────────

/** render 函数：每次渲染时调用，返回 VNode */
export type RenderFn<P = Record<string, unknown>> = (
  props: P | undefined,
) => ComponentChildren;

// ── ComponentFn: defineComponent 的参数类型 ──────────────────

/** 组件工厂函数：外层执行一次（持有状态），返回 render 函数 */
export type ComponentFn<P = Record<string, unknown>> = (
  props: P | undefined,
  ctx: Ctx,
) => RenderFn<P>;
