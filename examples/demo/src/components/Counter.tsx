import type { Ctx, RenderFn } from "trrn";

export function Counter(
  props: { initial?: number; label?: string } | undefined,
  { update }: Ctx,
): RenderFn {
  let count = props?.initial ?? 0;
  const label = props?.label ?? "Count";

  return (props) => (
    <div class="counter">
      <strong>{label}: {count}</strong>
      <div style="margin-top: 8px; display: flex; gap: 6px;">
        <button onClick={() => { count++; update(); }}>+</button>
        <button onClick={() => { count--; update(); }}>-</button>
        <button onClick={() => { count = 0; update(); }}>Reset</button>
      </div>
      {props && (
        <p style="color: #666; font-size: 13px;">
          Props from update(): {JSON.stringify(props)}
        </p>
      )}
    </div>
  );
}
