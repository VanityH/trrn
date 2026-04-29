import { createContext as preactCreateContext, h as preactH } from "preact";
import { useContext } from "preact/hooks";
import type { Context as PreactContext } from "preact";
import type { Component, Ctx } from "./types.ts";
import { TRRN_MARKER } from "./types.ts";

// ── Types ─────────────────────────────────────────────────────

export interface Context<T> {
  /** Preact context 实例（内部使用） */
  _preactCtx: PreactContext<T>;
  /** 默认值 */
  defaultValue: T;
  /** Provider 组件 */
  Provider: Component<{ value: T }>;
}

// ── Context value store（adapter 使用） ───────────────────────

/**
 * 预收集的 context 值。
 * adapter 在 render 时调用 useContext 填充此 Map，
 * ctx.consume() 从中读取。
 */
const contextStore = new WeakMap<PreactContext<any>, any>();

/**
 * 注册并读取 context（由 adapter 在 render 顶层调用）。
 */
export function resolveContext<T>(preactCtx: PreactContext<T>): T {
  const value = useContext(preactCtx);
  contextStore.set(preactCtx, value);
  return value;
}

/**
 * 从 store 中读取已解析的 context 值（由 ctx.consume 调用）。
 */
export function readContext<T>(preactCtx: PreactContext<T>, fallback: T): T {
  return (contextStore.get(preactCtx) ?? fallback) as T;
}

// ── Context registry ──────────────────────────────────────────

/** 全局 context 注册表，供 adapter 预先调用 useContext */
export const registeredContexts: Array<PreactContext<any>> = [];

// ── createContext ─────────────────────────────────────────────

/**
 * 创建一个 Context，包含 Provider 组件和默认值。
 * 在 trrn 组件中通过 ctx.consume(context) 读取值。
 *
 * @example
 * const ThemeCtx = createContext<string>('light');
 *
 * function Child(_props, ctx) {
 *   return (props) => {
 *     const theme = ctx.consume(ThemeCtx);
 *     return div.class(theme)('themed');
 *   };
 * }
 *
 * function App(_props, _ctx) {
 *   return () => ThemeCtx.Provider.$.value('dark')(Child.$());
 * }
 */
export function createContext<T>(defaultValue: T): Context<T> {
  const preactCtx = preactCreateContext(defaultValue);
  registeredContexts.push(preactCtx);

  // Provider 是一个 trrn 组件
  const Provider: Component<{ value: T }> = (_props, _ctx) => {
    return (p) => {
      const value = (p as any)?.value ?? defaultValue;
      const children = (p as any)?.children;
      return preactH(preactCtx.Provider as any, { value } as any, children as any);
    };
  };
  (Provider as any)[TRRN_MARKER] = true;

  return {
    _preactCtx: preactCtx,
    defaultValue,
    Provider,
  };
}

// ── ctx.consume 工厂 ──────────────────────────────────────────

/**
 * 创建 ctx.consume 方法（供 adapter 使用）。
 * 从预收集的 context store 中读取值。
 */
export function createConsume(): Ctx["consume"] {
  return function consume<T>(ctx: Context<T>): T {
    return readContext(ctx._preactCtx, ctx.defaultValue);
  };
}
