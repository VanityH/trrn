import { h as preactH } from "preact";
import type { VNode, ComponentChildren } from "preact";
import { getAdapter } from "./adapter.ts";

/**
 * 创建 VNode。
 * - 字符串类型 → 原生 HTML 元素
 * - 函数类型 → 自动适配（trrn 组件或标准 Preact 组件）
 */
export function h(
  type: string | Function,
  props: Record<string, unknown> | null,
  ...children: ComponentChildren[]
): VNode {
  if (typeof type === "function") {
    const Adapter = getAdapter(type);
    return preactH(Adapter as any, props as any, ...children);
  }
  return preactH(type as any, props as any, ...children);
}
