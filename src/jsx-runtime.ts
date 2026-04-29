/**
 * JSX Runtime for trrn.
 *
 * 在 tsconfig.json 中配置：
 *   "jsx": "react-jsx"
 *   "jsxImportSource": "trrn"
 *
 * TypeScript 会自动将 JSX 编译为：
 *   import { jsx as _jsx } from "trrn/jsx-runtime";
 *   _jsx("div", { class: "foo" }, "hello")
 */
import { h } from "./h.ts";

export { h as jsx, h as jsxs, h as jsxDEV };
export const Fragment = null as any;
