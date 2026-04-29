import type { ComponentChildren } from "preact";

// ── Ctx: 组件上下文 ──────────────────────────────────────────

export interface Ctx {
  /** 触发重渲染，可选传入新的 props */
  update(newProps?: Record<string, unknown>): void;
  /** 注册 DOM 挂载后回调（可访问 DOM） */
  onMount(fn: () => void): void;
  /** 注册卸载时的清理回调 */
  onUnmount(fn: () => void): void;
}

// ── Component: 用户组件类型 ──────────────────────────────────

/** render 函数：每次渲染时调用，返回 VNode */
export type RenderFn<P = Record<string, unknown>> = (props: P | undefined) => ComponentChildren;

/** 用户组件：外层执行一次，返回 render 函数 */
export type Component<P = Record<string, unknown>> = (
  props: P | undefined,
  ctx: Ctx,
) => RenderFn<P>;

// ── Internal markers ─────────────────────────────────────────

/** 显式标记函数为 trrn 组件（跳过自动检测） */
export const TRRN_MARKER = Symbol.for("trrn.component");

export interface TrrnComponent<P = Record<string, unknown>> extends Component<P> {
  [TRRN_MARKER]?: true;
}
