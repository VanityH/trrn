import type { RenderFn } from "trrn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

const colors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "#f3f4f6", text: "#6b7280" },
  success: { bg: "#dcfce7", text: "#16a34a" },
  warning: { bg: "#fef3c7", text: "#d97706" },
  danger: { bg: "#fef2f2", text: "#dc2626" },
  info: { bg: "#dbeafe", text: "#2563eb" },
};

export function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: BadgeVariant;
}): RenderFn {
  const c = colors[variant];
  return () => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
