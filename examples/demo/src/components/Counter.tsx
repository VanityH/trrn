import type { Component } from "trrn";
import { action } from "trrn";

export const Counter: Component<{ initial?: number; label?: string }> = (
  props,
  ctx,
) => {
  let count = props?.initial ?? 0;
  const label = props?.label ?? "Count";

  return (_p) => (
    <div class="counter">
      <strong>{label}: {count}</strong>
      <div style="margin-top: 8px; display: flex; gap: 6px;">
        <button onClick={action(ctx, () => count++)}>+</button>
        <button onClick={action(ctx, () => count--)}>-</button>
        <button onClick={action(ctx, () => { count = 0; })}>
          Reset
        </button>
      </div>
    </div>
  );
};
