import { h as preactH } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import type { Ctx, RenderFn } from "./types.ts";
import { TRRN_MARKER } from "./types.ts";
import { createConsume, registeredContexts, resolveContext } from "./context.ts";

// ── Adapter cache ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

const adapterCache = new WeakMap<object, AnyFunction>();

// ── Pattern detection ─────────────────────────────────────────

/**
 * 判断一个函数是否为 trrn 组件。
 * 优先级：(1) Symbol 标记 (2) 参数数量启发式 (props+ctx=2)
 */
function isTrrnComponent(type: AnyFunction): boolean {
  const marker = (type as unknown as Record<string | symbol, unknown>)[TRRN_MARKER];
  if (marker !== undefined) return !!marker;
  return type.length >= 2;
}

// ── Adapter factory ───────────────────────────────────────────

/**
 * 为 trrn 组件创建 Preact 适配器。
 * 外层函数执行一次（持有状态），render 函数每次渲染时调用。
 */
function createTrrnAdapter(type: AnyFunction): AnyFunction {
  function Adapter(props: any) {
    const [, tick] = useState(0);
    const propsRef = useRef<any>(undefined);
    const internalRef = useRef(false);

    // 仅当父子 re-render 传入新 props 时同步；ctx.update() 触发的跳过
    if (!internalRef.current) {
      propsRef.current = props;
    }
    internalRef.current = false;

    const renderFnRef = useRef<RenderFn | null>(null);
    const mountQueueRef = useRef<Array<() => void>>([]);
    const cleanupRef = useRef<(() => void) | null>(null);
    const aliveRef = useRef(true);

    // 在 adapter 顶层预先解析所有已注册的 context
    for (const preactCtx of registeredContexts) {
      resolveContext(preactCtx);
    }

    const ctxRef = useRef<Ctx>({
      update(newProps?: Record<string, unknown>) {
        if (!aliveRef.current) return;
        internalRef.current = true;
        if (newProps !== undefined) {
          propsRef.current = { ...propsRef.current, ...newProps };
        }
        tick((n) => n + 1);
      },
      onMount(fn: () => void) {
        mountQueueRef.current.push(fn);
      },
      onUnmount(fn: () => void) {
        cleanupRef.current = fn;
      },
      consume: createConsume(),
    });

    // 外层函数只执行一次
    if (!renderFnRef.current) {
      renderFnRef.current = type(props, ctxRef.current) as RenderFn;
    }

    // DOM 挂载后回调
    useEffect(() => {
      for (const fn of mountQueueRef.current) fn();
      mountQueueRef.current = [];
    }, []);

    // 卸载清理
    useEffect(() => {
      return () => {
        aliveRef.current = false;
        cleanupRef.current?.();
      };
    }, []);

    return renderFnRef.current(propsRef.current);
  }

  return Adapter;
}

// ── Public: getAdapter ─────────────────────────────────────────

/**
 * 获取函数类型组件的适配器（带缓存）。
 * 自动识别 trrn 组件和标准 Preact 组件。
 */
export function getAdapter(type: AnyFunction): AnyFunction {
  let adapter = adapterCache.get(type);
  if (!adapter) {
    if (isTrrnComponent(type)) {
      // trrn 组件：创建外层-once 适配器
      adapter = createTrrnAdapter(type);
    } else {
      // 标准 Preact 组件：不做适配，直接用 Preact 原生渲染
      // 但为了统一 h() 的调用方式，返回一个简单的包装
      adapter = function PreactPassthrough(props: any) {
        return preactH(type as any, props);
      };
    }
    // 自动标记（不覆盖显式设置）
    if ((type as any)[TRRN_MARKER] === undefined) {
      (type as any)[TRRN_MARKER] = adapter.name !== "PreactPassthrough";
    }
    adapterCache.set(type, adapter);
  }
  return adapter;
}
