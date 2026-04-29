/**
 * JSX Runtime for trrn.
 *
 * 配置 tsconfig.json：
 *   "jsx": "react-jsx"
 *   "jsxImportSource": "trrn"
 *
 * 自动 JSX 转换会将 JSX 编译为对 jsx/jsxs/jsxDEV 的调用：
 *   <div key="k" class="x">hello</div>
 *   → jsx("div", { class: "x", children: "hello" }, "k")
 */
import { h } from "./h.ts";
import type { VNode } from "preact";

// 将独立的 key 参数合并到 props 中
function withKey(props: any, key?: string): any {
  if (key !== undefined && props && !("key" in props)) {
    return { ...props, key };
  }
  return props;
}

export function jsx(
  type: any,
  props: any,
  key?: string,
): VNode {
  return h(type, withKey(props, key));
}

export function jsxs(
  type: any,
  props: any,
  key?: string,
): VNode {
  return h(type, withKey(props, key));
}

export function jsxDEV(
  type: any,
  props: any,
  key?: string,
): VNode {
  return h(type, withKey(props, key));
}

// 从 Preact 导出 Fragment（与 JSX <> 片段语法对应）
export { Fragment } from "preact";
