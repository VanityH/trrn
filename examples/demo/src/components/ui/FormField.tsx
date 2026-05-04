import type { ComponentChildren } from "preact";
import type { RenderFn } from "trrn";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children?: ComponentChildren;
}): RenderFn {
  return () => (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#374151",
        }}
      >
        {label}
      </label>
      {children}
      {error !== undefined && error !== null && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
