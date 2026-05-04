import { defineComponent } from "trrn-h";

interface PagerProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export const Pager = defineComponent<PagerProps>(() => {
  return (p) => {
    const totalPages = Math.max(1, Math.ceil(p.total / p.pageSize));

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          justifyContent: "center",
          marginTop: "16px",
        }}
      >
        <button
          disabled={p.page <= 1}
          onClick={() => p.onChange(p.page - 1)}
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: p.page <= 1 ? "not-allowed" : "pointer",
            opacity: p.page <= 1 ? 0.4 : 1,
          }}
        >
          上一页
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => p.onChange(n)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: n === p.page ? "#6366f1" : "#fff",
              color: n === p.page ? "#fff" : "#374151",
              cursor: "pointer",
              fontWeight: n === p.page ? 600 : 400,
            }}
          >
            {n}
          </button>
        ))}
        <button
          disabled={p.page >= totalPages}
          onClick={() => p.onChange(p.page + 1)}
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: p.page >= totalPages ? "not-allowed" : "pointer",
            opacity: p.page >= totalPages ? 0.4 : 1,
          }}
        >
          下一页
        </button>
      </div>
    );
  };
});
