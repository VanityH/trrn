import { defineComponent } from "trrn-h";

interface CardProps {
  title?: string;
  children?: any;
  style?: Record<string, string>;
  footer?: any;
}

export const Card = defineComponent<CardProps>(() => {
  return (p) => (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        ...p.style,
      }}
    >
      {p.title && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {p.title}
        </div>
      )}
      <div style={{ padding: "16px" }}>{p.children}</div>
      {p.footer && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          {p.footer}
        </div>
      )}
    </div>
  );
});
