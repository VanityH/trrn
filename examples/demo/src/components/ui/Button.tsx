import type { ComponentChildren } from "preact";
import type { RenderFn } from "trrn";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  children?: ComponentChildren;
  style?: Record<string, string>;
}

const variantStyles: Record<string, Record<string, string>> = {
  primary: { background: "#6366f1", color: "#fff", border: "none" },
  secondary: { background: "#e5e7eb", color: "#374151", border: "1px solid #d1d5db" },
  danger: { background: "#ef4444", color: "#fff", border: "none" },
  ghost: { background: "transparent", color: "#6366f1", border: "none" },
};

export function Button(props: ButtonProps): RenderFn {
  const { variant = "primary", size = "md", onClick, disabled, children, style } = props;
  const base: Record<string, string> = {
    padding: size === "sm" ? "4px 10px" : size === "lg" ? "10px 24px" : "6px 16px",
    borderRadius: "6px",
    cursor: disabled ? "default" : "pointer",
    fontSize: size === "sm" ? "13px" : "14px",
    opacity: disabled ? "0.5" : "1",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    ...variantStyles[variant],
    ...style,
  };

  return () => (
    <button style={base} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
}
