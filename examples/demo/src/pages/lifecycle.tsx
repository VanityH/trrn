import type { Ctx, RenderFn } from "trrn";

function Timer(
  props: { id: number; onRemove: (id: number) => void } | undefined,
  { update, onMount, onUnmount }: Ctx,
): RenderFn {
  const id = props?.id;
  const onRemove = props?.onRemove;
  let seconds = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    timer = setInterval(() => { seconds++; update(); }, 1000);
  });
  onUnmount(() => {
    if (timer) clearInterval(timer);
  });

  return () => (
    <div style="display: flex; align-items: center; gap: 12px; padding: 8px; border: 1px solid #eee; border-radius: 6px; margin-top: 8px;">
      <span style="font-variant-numeric: tabular-nums; min-width: 60px;">
        Timer #{id}: {seconds}s
      </span>
      <button
        onClick={() => onRemove?.(id!)}
        style="padding: 2px 8px; cursor: pointer;"
      >
        Remove
      </button>
    </div>
  );
}

export function LifecyclePage(
  _props: Record<string, unknown> | undefined,
  { update }: Ctx,
): RenderFn {
  let timers = [1];
  let nextId = 2;

  return () => (
    <div>
      <h2>Lifecycle</h2>
      <p style="color: #666; font-size: 14px;">
        Demonstrates: <code>onMount</code> (start interval),{" "}
        <code>onUnmount</code> (clear interval on remove), conditional
        mount/unmount.
      </p>

      <button
        onClick={() => { timers = [...timers, nextId++]; update(); }}
        style="padding: 6px 16px; cursor: pointer; margin: 12px 0;"
      >
        Add Timer
      </button>

      {timers.length === 0 && <p style="color: #999;">No timers. Add one!</p>}
      {timers.map((id) => <Timer key={id} id={id} onRemove={(id) => { timers = timers.filter((t) => t !== id); update(); }} />)}
    </div>
  );
}
