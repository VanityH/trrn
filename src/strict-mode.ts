import { h } from "./h.ts";
import type { ComponentChildren, VNode } from "preact";
import type { Component } from "./types.ts";
import { TRRN_MARKER } from "./types.ts";

/**
 * StrictMode — 开发辅助组件。
 *
 * Double-invoke render 函数以检测副作用（类似 React.StrictMode）。
 * 开发时包裹在 App 外层，生产构建时移除此包装即可。
 *
 * @example
 *   render(() => () => h(StrictMode, null, h(App, null)), container);
 */
export const StrictMode: Component = (_props, ctx) => {
  let invokeCount = 0;

  return (_p) => {
    invokeCount++;

    // 每次 render 额外触发一次 update 实现 double-invoke
    if (invokeCount % 2 === 1) {
      queueMicrotask(() => ctx.update());
    }

    const children = _p as unknown as ComponentChildren;
    return h(
      "div",
      {
        style: "display: contents",
      } as Record<string, unknown>,
      ...(Array.isArray(children) ? children : [children]),
    ) as VNode;
  };
};

(StrictMode as any)[TRRN_MARKER] = true;
