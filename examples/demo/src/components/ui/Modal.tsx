import type { ComponentChildren } from "preact";
import type { RenderFn } from "trrn";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children?: ComponentChildren;
  onClose: () => void;
}): RenderFn {
  return () => {
    if (!open) return null;

    return (
      <div
        style={{
          position: "fixed",
          inset: "0",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 遮罩层 */}
        <div
          style={{ position: "absolute", inset: "0", background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />
        {/* 弹窗内容 */}
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: "12px",
            minWidth: "380px",
            maxWidth: "560px",
            maxHeight: "80vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          {title !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>{title}</h3>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}
          <div style={{ padding: "20px" }}>{children}</div>
        </div>
      </div>
    );
  };
}
