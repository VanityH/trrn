import type { Ctx } from "trrn";

export function Counter(
  { initial = 0, label = "Count" }: { initial?: number; label?: string },
  { update }: Ctx,
) {
  let count = initial;

  // render 函数的 props 参数：update(newProps) 时接收新数据
  return (props: Record<string, unknown> | undefined) => (
    <div class="counter">
      <strong>{label}: {count}</strong>
      <div style="margin-top: 8px; display: flex; gap: 6px;">
        <button onClick={() => { count++; update(); }}>+</button>
        <button onClick={() => { count--; update(); }}>-</button>
        <button onClick={() => { count = Number(props?.resetTo) || 0; update(); }}>Reset</button>
        <button onClick={() => update({ resetTo: 100 })}>Set resetTo=100</button>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 4px;">
        update(newProps) demo — resetTo: {JSON.stringify(props)}
      </p>
    </div>
  );
}
