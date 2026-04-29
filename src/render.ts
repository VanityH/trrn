import { render as preactRender, h as preactH } from "preact";
import type { ContainerNode } from "preact";
import { getAdapter } from "./adapter.ts";
import type { Component } from "./types.ts";

/**
 * 挂载 trrn 组件到 DOM 容器。
 * 组件的外层函数执行一次，render 函数每次更新时执行。
 */
export function render<P extends Record<string, unknown>>(
  Comp: Component<P>,
  container: ContainerNode,
  initialProps?: P,
): void {
  const Adapter = getAdapter(Comp);
  preactRender(preactH(Adapter as any, initialProps ?? null), container);
}
