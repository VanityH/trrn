import type { ComponentChildren } from "preact";
import type { RenderFn } from "trrn";

export function Card({
  title,
  children,
  style,
  footer,
}: {
  title?: string;
  children?: ComponentChildren;
  style?: Record<string, string>;
  footer?: ComponentChildren;
}): RenderFn {
  return () => (
    <div
      style={{
        background: "#fff",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        ...style,
      }}
    >
      {title !== undefined && (
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            fontSize: "15px",
          }}
        >
          {title}
        </div>
      )}
      {children !== undefined && <div style={{ padding: "18px" }}>{children}</div>}
      {footer !== undefined && (
        <div
          style={{ padding: "12px 18px", borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
