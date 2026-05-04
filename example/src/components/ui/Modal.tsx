import { defineComponent } from "trrn-h";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children?: any;
}

export const Modal = defineComponent<ModalProps>(() => {
  return (p) => {
    if (!p.open) return null;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }}
          onClick={p.onClose}
        />
        <div
          style={{
            position: "relative",
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            minWidth: "400px",
            maxWidth: "90vw",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          }}
        >
          {p.title && (
            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>{p.title}</div>
          )}
          {p.children}
        </div>
      </div>
    );
  };
});
