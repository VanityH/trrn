/**
 * 展示 update(newProps) 的核心组件：
 * - 外层持有 page 状态
 * - "Go to page N" 通过 update({ page: N }) 传递
 * - render 函数的 props 参数接收更新后的值
 */
import type { Ctx } from "trrn";

export function Pager(
  _: unknown,
  { update }: Ctx,
) {
  let page = 1;

  return (props: Record<string, unknown> | undefined) => {
    const current = (props as Record<string, unknown>)?.page ?? page;
    return (
      <div class="pager" style="padding: 12px; border: 1px solid #6366f1; border-radius: 8px; display: inline-block;">
        <p>Current page: <strong>{String(current)}</strong></p>
        <p style="color: #888; font-size: 12px;">
          render(props) received: {JSON.stringify(props)}
        </p>
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => { page = n; update({ page: n }); }}
              style={{
                padding: "4px 12px",
                background: current === n ? "#6366f1" : "#eee",
                color: current === n ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  };
}
