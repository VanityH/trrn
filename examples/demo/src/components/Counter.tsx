import { defineComponent } from "trrn";
import type { Ctx } from "trrn";

interface CounterProps {
  initial?: number;
  label?: string;
  onChange?: (count: number) => void;
}

export const Counter = defineComponent<CounterProps>(function (
  { initial, label, onChange },
  { update }: Ctx,
) {
  let count = initial ?? 0;

  return (p) => {
    const displayLabel = p.label ?? label;
    const onChangeLatest = p.onChange ?? onChange;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {displayLabel && <span style={{ fontSize: "14px", color: "#6b7280" }}>{displayLabel}</span>}
        <button
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => {
            count--;
            update();
            onChangeLatest?.(count);
          }}
        >
          -
        </button>
        <span style={{ minWidth: "24px", textAlign: "center", fontWeight: 600 }}>{count}</span>
        <button
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
          }}
          onClick={() => {
            count++;
            update();
            onChangeLatest?.(count);
          }}
        >
          +
        </button>
      </div>
    );
  };
});
