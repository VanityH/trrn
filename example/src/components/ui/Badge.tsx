import { defineComponent } from "trrn-h";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger";
  children?: any;
}

const colors: Record<string, string> = {
  default: "background:#f3f4f6;color:#374151;",
  success: "background:#dcfce7;color:#166534;",
  warning: "background:#fef3c7;color:#92400e;",
  danger: "background:#fee2e2;color:#991b1b;",
};

export const Badge = defineComponent<BadgeProps>(() => {
  return (p) => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        fontSize: "12px",
        borderRadius: "4px",
        fontWeight: 500,
        ...parseStyle(colors[p.variant ?? "default"]),
      }}
    >
      {p.children}
    </span>
  );
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
