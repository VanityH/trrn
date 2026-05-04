import { useState, useRef, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { Ctx, ComponentFn } from "./types.ts";

/**
 * 定义一个 trrn 组件。
 *
 * factory 函数接收 (props, ctx)，返回 render 函数。
 * factory 只执行一次（持有闭包状态），render 函数每次渲染执行。
 *
 * @example
 * ```tsx
 * const Counter = defineComponent((props, { update }) => {
 *   let count = 0;
 *   return (props) => (
 *     <button onClick={() => { count++; update(); }}>
 *       {count}
 *     </button>
 *   );
 * });
 * ```
 */
export function defineComponent<P extends Record<string, unknown> = Record<string, unknown>>(
  factory: ComponentFn<P>,
): (props: P) => ComponentChildren {
  return function TrrnComponent(props: P) {
    const [, tick] = useState(0);
    const propsRef = useRef<P>(props);
    const internalRef = useRef(false);
    const renderFnRef = useRef<((props: P) => ComponentChildren) | null>(null);
    const mountQueue = useRef<Array<() => void>>([]);
    const cleanupQueue = useRef<Array<() => void>>([]);
    const aliveRef = useRef(true);

    // 父组件重渲染 → internalRef=false → 用父级新 props 覆盖
    // ctx.update() 触发的 → internalRef=true → 跳过覆盖
    if (!internalRef.current) {
      propsRef.current = props;
    }
    internalRef.current = false;

    const ctxRef = useRef<Ctx>({
      update(newProps?: Record<string, unknown>) {
        if (!aliveRef.current) return;
        internalRef.current = true;
        if (newProps !== undefined) {
          propsRef.current = { ...propsRef.current, ...newProps } as P;
        }
        tick((n) => n + 1);
      },
      onMount(fn: () => void) {
        mountQueue.current.push(fn);
      },
      onUnmount(fn: () => void) {
        cleanupQueue.current.push(fn);
      },
    });

    // 外层函数只执行一次
    if (!renderFnRef.current) {
      renderFnRef.current = factory(props, ctxRef.current);
    }

    // DOM 挂载后执行 onMount 回调
    useEffect(() => {
      for (const fn of mountQueue.current) fn();
      mountQueue.current = [];
    }, []);

    // 卸载时执行 onUnmount 回调
    useEffect(() => {
      return () => {
        aliveRef.current = false;
        for (const fn of cleanupQueue.current) fn();
      };
    }, []);

    return renderFnRef.current(propsRef.current);
  };
}
