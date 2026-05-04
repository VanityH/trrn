import { defineComponent } from "trrn";
import type { Ctx } from "trrn";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children?: any;
}

export const FormField = defineComponent<FormFieldProps>(function (_, __: Ctx) {
  return (p) => (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 500,
          color: "#374151",
          marginBottom: "4px",
        }}
      >
        {p.label}
        {p.required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
      </label>
      {p.children}
      {p.error && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>{p.error}</p>
      )}
    </div>
  );
});
