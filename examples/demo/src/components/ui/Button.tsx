import { defineComponent } from "trrn";
import type { Ctx } from "trrn";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  children?: any;
}

const variantStyles: Record<string, string> = {
  primary: "background:#6366f1;color:#fff;border:none;",
  secondary: "background:#e5e7eb;color:#374151;border:1px solid #d1d5db;",
  danger: "background:#ef4444;color:#fff;border:none;",
};

const sizeStyles: Record<string, string> = {
  sm: "padding:4px 10px;font-size:12px;",
  md: "padding:6px 14px;font-size:14px;",
  lg: "padding:10px 20px;font-size:16px;",
};

export const Button = defineComponent<ButtonProps>(function (_, __: Ctx) {
  return (p) => {
    const onClk = p.onClick;
    const disabled = p.disabled;
    return (
      <button
        onClick={onClk}
        disabled={disabled}
        style={{
          borderRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          ...parseStyle(variantStyles[p.variant ?? "primary"]),
          ...parseStyle(sizeStyles[p.size ?? "md"]),
        }}
      >
        {p.children}
      </button>
    );
  };
});

function parseStyle(s: string): Record<string, string> {
  const obj: Record<string, string> = {};
  s.split(";")
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v] = pair.split(":");
      if (k && v) obj[k.trim()] = v.trim();
    });
  return obj;
}
