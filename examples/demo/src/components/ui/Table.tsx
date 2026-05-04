import type { ComponentChildren } from "preact";
import type { RenderFn } from "trrn";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ComponentChildren;
  width?: string;
}

export function Table<T extends { id?: unknown }>({
  columns,
  data,
  onRowClick,
  emptyText = "No data",
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyText?: string;
}): RenderFn {
  return () => {
    if (data.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
          {emptyText}
        </div>
      );
    }
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "#6b7280",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    width: col.width,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={(row as any).id ?? i}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: "1px solid #f3f4f6",
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                }}
                onMouseOut={(e: MouseEvent) => {
                  (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "10px 14px", color: "#374151" }}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
}
