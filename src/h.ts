import { h as preactH } from "preact";
import type { VNode, ComponentChildren, ComponentType } from "preact";
import { getAdapter } from "./adapter.ts";
import type { Component } from "./types.ts";

/**
 * 创建 VNode（trrn 组件 — 支持 props 类型推断）。
 */
export function h<P extends Record<string, unknown>>(
  type: Component<P>,
  props: P | null,
  ...children: ComponentChildren[]
): VNode;

/**
 * 创建 VNode（HTML 元素 / 标准 Preact 组件）。
 */
export function h(
  type: string | ComponentType<any>,
  props: Record<string, unknown> | null,
  ...children: ComponentChildren[]
): VNode;

// 实现
export function h(
  type: string | Function,
  props: Record<string, unknown> | null,
  ...children: ComponentChildren[]
): VNode {
  if (typeof type === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Adapter = getAdapter(type as (...args: any[]) => any);
    return preactH(Adapter as any, props as any, ...children);
  }
  return preactH(type as any, props as any, ...children);
}
