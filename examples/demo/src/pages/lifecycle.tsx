import type { Component } from "trrn";
import { action } from "trrn";

const Timer: Component<{ id: number; onRemove: (id: number) => void }> = (
  props,
  ctx,
) => {
  let seconds = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  ctx.onMount(() => {
    timer = setInterval(() => {
      seconds++;
      ctx.update();
    }, 1000);
  });

  ctx.onUnmount(() => {
    if (timer) clearInterval(timer);
  });

  return (_p) => (
    <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid #eee; border-radius: 6px; margin-top: 8px;">
      <span style="font-variant-numeric: tabular-nums; min-width: 60px;">
        Timer #{props?.id}: {seconds}s
      </span>
      <button
        onClick={() => props?.onRemove?.(props?.id!)}
        style="padding: 2px 8px; cursor: pointer;"
      >
        Remove
      </button>
    </div>
  );
};

export const LifecyclePage: Component = (_props, ctx) => {
  let timers = [1];
  let nextId = 2;

  const add = () => {
    timers = [...timers, nextId++];
    ctx.update();
  };

  const remove = (id: number) => {
    timers = timers.filter((t) => t !== id);
    ctx.update();
  };

  return (_p) => (
    <div>
      <h2>Lifecycle</h2>
      <p style="color: #666; font-size: 14px;">
        Demonstrates: <code>ctx.onMount</code> (start timer, DOM access),{" "}
        <code>ctx.onUnmount</code> (cleanup interval on remove), conditional
        mount/unmount.
      </p>

      <button
        onClick={action(ctx, add)}
        style="padding: 6px 16px; cursor: pointer; margin: 12px 0;"
      >
        Add Timer
      </button>

      {timers.length === 0 && <p style="color: #999;">No timers. Add one!</p>}

      {timers.map((id) => (
        <Timer key={id} id={id} onRemove={remove} />
      ))}
    </div>
  );
};
