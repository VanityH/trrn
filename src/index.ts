import { render as preactRender, h as preactH } from "preact";
import type { ContainerNode, VNode, ComponentChildren } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";

// ── Public Types ──────────────────────────────────────────────

export interface Ctx {
  update(newProps?: Record<string, unknown>): void;
  onUnmount(fn: () => void): void;
}

export type RenderFn<P = Record<string, unknown>> = (props: P | undefined) => ComponentChildren;

export type Component<P = Record<string, unknown>> = (
  props: P | undefined,
  ctx: Ctx,
) => RenderFn<P>;

// ── Internal: component registry & adapter cache ──────────────

const adapterCache = new WeakMap<object, Function>();

// ── Internal: create adapter for child components ─────────────

/**
 * 为任意函数类型创建适配器。
 * 首次渲染时自动检测组件模式（trrn vs 标准 Preact），并缓存结果。
 */
function createAutoAdapter(type: Function): Function {
  function Adapter(props: any) {
    const [, tick] = useState(0);
    // 用 ref 存储跨渲染的状态
    const state = useRef<{
      inited: boolean;
      isTrrn: boolean;
      renderFn: RenderFn | null;
    }>({
      inited: false,
      isTrrn: false,
      renderFn: null,
    });
    const propsRef = useRef(props);
    const cleanupRef = useRef<(() => void) | null>(null);
    const aliveRef = useRef(true);

    const ctxRef = useRef<Ctx>({
      update(newProps?: Record<string, unknown>) {
        if (!aliveRef.current) return;
        if (newProps !== undefined) propsRef.current = newProps;
        tick((n) => n + 1);
      },
      onUnmount(fn: () => void) {
        cleanupRef.current = fn;
      },
    });

    useEffect(() => {
      return () => {
        aliveRef.current = false;
        cleanupRef.current?.();
      };
    }, []);

    // 首次渲染：检测组件模式
    if (!state.current.inited) {
      const result = type(props, ctxRef.current);
      if (typeof result === "function") {
        state.current.isTrrn = true;
        state.current.renderFn = result as RenderFn;
      }
      state.current.inited = true;
    }

    if (state.current.isTrrn) {
      // trrn 模式：调用存储的 render 函数
      return state.current.renderFn!(propsRef.current);
    }

    // 标准 Preact 组件：委托 Preact 原生渲染
    return preactH(type as any, propsRef.current);
  }

  return Adapter;
}

/**
 * 获取或创建函数类型组件的适配器（带缓存）。
 */
function getAdapter(type: Function): Function {
  let adapter = adapterCache.get(type);
  if (!adapter) {
    adapter = createAutoAdapter(type);
    adapterCache.set(type, adapter);
  }
  return adapter;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * 挂载组件到 DOM 容器。
 */
export function render<P extends Record<string, unknown>>(
  Comp: Component<P>,
  container: ContainerNode,
  initialProps?: P,
): void {
  const Adapter = getAdapter(Comp);
  preactRender(preactH(Adapter as any, initialProps ?? null), container);
}

/**
 * 创建 VNode。
 * 对函数类型自动适配：支持 trrn 组件（外层一次 + render 函数）
 * 和标准 Preact 函数组件。
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
