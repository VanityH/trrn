/**
 * 高级数据表格 — 展示 trrn 复杂闭包状态管理
 *
 * 核心模式:
 * - 多字段排序（点击表头切换 asc/desc/none）
 * - 组合筛选（文本搜索 + 多选下拉条件）
 * - 分页（页码 + 每页条数切换）
 * - 行多选 + 全选 + 批量操作
 * - update(newProps) 传递给表头排序指示器
 * - action() 包装批量操作
 * - 所有状态通过闭包变量管理，无需 useState
 * - 列自定义渲染（状态标签、操作按钮）
 */
import type { Ctx, RenderFn } from "trrn";
import { action } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Modal } from "../../components/ui/Modal.tsx";
import { fetchUsers, fetchProducts } from "../../mock/api.ts";
import type { User, Product } from "../../mock/types.ts";

// ── 可排序表头组件（更新排序指示器 via update(newProps)） ─────

type SortDir = "asc" | "desc" | null;

function SortHeader({ label, onSort }: { label: string; onSort: () => void }, _ctx: Ctx): RenderFn {
  let dir: SortDir = null;

  return (props: Record<string, unknown> | undefined) => {
    if (props !== undefined) {
      dir = ((props as any).dir as SortDir) ?? dir;
    }

    const arrow = dir === "asc" ? " ▲" : dir === "desc" ? " ▼" : "";
    return (
      <th
        onClick={onSort}
        style={{
          padding: "10px 14px",
          textAlign: "left",
          fontWeight: 600,
          color: "#6b7280",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          cursor: "pointer",
          userSelect: "none",
          whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
        onMouseOver={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.color = "#6366f1";
        }}
        onMouseOut={(e: MouseEvent) => {
          (e.currentTarget as HTMLElement).style.color = "#6b7280";
        }}
      >
        {label}
        {dir !== null ? <span style={{ color: "#6366f1" }}>{arrow}</span> : null}
      </th>
    );
  };
}

// ── 分页组件 ───────────────────────────────────────────────────

function Paginator(
  {
    current,
    total,
    pageSize,
    onChange,
  }: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  },
  _ctx: Ctx,
): RenderFn {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return () => {
    if (totalPages <= 1) return null;

    const pages: (number | "...")[] = [];
    // 生成页码列表（首尾 + 当前附近）
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 0",
          fontSize: "13px",
        }}
      >
        <span style={{ color: "#6b7280" }}>
          共 {total} 条，第 {(current - 1) * pageSize + 1}-{Math.min(current * pageSize, total)} 条
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => onChange(Math.max(1, current - 1))}
            disabled={current <= 1}
            style={{
              padding: "4px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              background: current <= 1 ? "#f3f4f6" : "#fff",
              cursor: current <= 1 ? "default" : "pointer",
              color: current <= 1 ? "#d1d5db" : "#374151",
              fontSize: "13px",
            }}
          >
            上一页
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} style={{ padding: "4px 6px", color: "#9ca3af" }}>
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                style={{
                  padding: "4px 10px",
                  border: "none",
                  borderRadius: "4px",
                  background: p === current ? "#6366f1" : "transparent",
                  color: p === current ? "#fff" : "#374151",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: p === current ? 600 : 400,
                }}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onChange(Math.min(totalPages, current + 1))}
            disabled={current >= totalPages}
            style={{
              padding: "4px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              background: current >= totalPages ? "#f3f4f6" : "#fff",
              cursor: current >= totalPages ? "default" : "pointer",
              color: current >= totalPages ? "#d1d5db" : "#374151",
              fontSize: "13px",
            }}
          >
            下一页
          </button>
        </div>
      </div>
    );
  };
}

// ── 列配置 ─────────────────────────────────────────────────────

interface ColDef {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: any) => any;
  width?: string;
}

// ── 主页面 ─────────────────────────────────────────────────────

export function DataExplorerPage(_: unknown, { update, onMount }: Ctx): RenderFn {
  // ── 数据源 ───────────────────────────────
  let source: "users" | "products" = "users";
  let users: User[] = [];
  let products: Product[] = [];
  let loading = true;

  // ── 排序 ─────────────────────────────────
  let sortKey: string | null = null;
  let sortDir: "asc" | "desc" = "asc";

  // ── 筛选 ─────────────────────────────────
  let searchText = "";
  let filterKey = "";
  let filterValue = "";

  // ── 分页 ─────────────────────────────────
  let page = 1;
  let pageSize = 10;

  // ── 选择 ─────────────────────────────────
  let selectedKeys = new Set<string | number>();

  // ── 批量删除确认 ──────────────────────────
  let showBatchConfirm = false;

  const load = async () => {
    loading = true;
    update();
    const [usersResult, productsResult] = await Promise.all([fetchUsers(), fetchProducts()]);
    if (usersResult.ok) users = usersResult.data;
    if (productsResult.ok) products = productsResult.data;
    loading = false;
    update();
  };

  onMount(load);

  // ── 数据处理管道 ──────────────────────────

  const currentData = () => (source === "users" ? users : products);

  const currentCols = (): ColDef[] => {
    if (source === "users") {
      return [
        {
          key: "id",
          label: "ID",
          sortable: true,
          render: (u: User) => <span style={{ color: "#9ca3af" }}>#{u.id}</span>,
          width: "60px",
        },
        {
          key: "name",
          label: "姓名",
          sortable: true,
          render: (u: User) => <span style={{ fontWeight: 500 }}>{u.name}</span>,
        },
        { key: "email", label: "邮箱", sortable: true, render: (u: User) => u.email },
        {
          key: "role",
          label: "角色",
          sortable: true,
          render: (u: User) => <Badge label={u.role} />,
        },
        {
          key: "status",
          label: "状态",
          sortable: true,
          render: (u: User) => (
            <Badge
              label={u.status === "active" ? "启用" : "禁用"}
              variant={u.status === "active" ? "success" : "default"}
            />
          ),
        },
        {
          key: "created",
          label: "创建时间",
          sortable: true,
          render: (u: User) => <span style={{ color: "#6b7280" }}>{u.created}</span>,
        },
      ];
    }
    return [
      {
        key: "id",
        label: "ID",
        sortable: true,
        render: (p: Product) => <span style={{ color: "#9ca3af" }}>#{p.id}</span>,
        width: "60px",
      },
      {
        key: "name",
        label: "产品名称",
        sortable: true,
        render: (p: Product) => <span style={{ fontWeight: 500 }}>{p.name}</span>,
      },
      { key: "category", label: "分类", sortable: true, render: (p: Product) => p.category },
      {
        key: "price",
        label: "价格",
        sortable: true,
        render: (p: Product) => <span style={{ fontWeight: 500 }}>¥{p.price}</span>,
      },
      {
        key: "stock",
        label: "库存",
        sortable: true,
        render: (p: Product) => (
          <span style={{ color: p.stock === 0 ? "#ef4444" : "#374151" }}>
            {p.stock === 0 ? "无货" : p.stock}
          </span>
        ),
      },
      {
        key: "status",
        label: "状态",
        sortable: true,
        render: (p: Product) => <Badge label={p.status} />,
      },
    ];
  };

  const applyFilters = (data: any[]) => {
    let filtered = [...data];

    // 文本搜索
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    // 列筛选
    if (filterKey && filterValue) {
      filtered = filtered.filter(
        (row) => String((row as any)[filterKey]).toLowerCase() === filterValue.toLowerCase(),
      );
    }

    // 排序
    if (sortKey) {
      filtered.sort((a, b) => {
        const va = (a as any)[sortKey!];
        const vb = (b as any)[sortKey!];
        let cmp = 0;
        if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
        else cmp = String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  };

  // ── 操作函数 ─────────────────────────────

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") sortDir = "desc";
      else {
        sortKey = null;
        sortDir = "asc";
      }
    } else {
      sortKey = key;
      sortDir = "asc";
      page = 1;
    }
    selectedKeys.clear();
    update();
  };

  const handleSearch = (text: string) => {
    searchText = text;
    page = 1;
    selectedKeys.clear();
    update();
  };

  const handleFilterChange = (key: string, value: string) => {
    filterKey = key;
    filterValue = value;
    page = 1;
    selectedKeys.clear();
    update();
  };

  const toggleSelect = (id: string | number) => {
    const next = new Set(selectedKeys);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedKeys = next;
    update();
  };

  const toggleSelectAll = () => {
    const filtered = applyFilters(currentData());
    if (selectedKeys.size === filtered.length) {
      selectedKeys = new Set();
    } else {
      selectedKeys = new Set(filtered.map((r) => (r as any).id));
    }
    update();
  };

  const handleBatchDelete = () => {
    showBatchConfirm = true;
    update();
  };

  // 使用 action() 包装批量确认
  const confirmBatchDelete = action(update as any, () => {
    if (selectedKeys.size === 0) return;
    if (source === "users") {
      users = users.filter((u) => !selectedKeys.has(u.id));
    } else {
      products = products.filter((p) => !selectedKeys.has(p.id));
    }
    selectedKeys = new Set();
    showBatchConfirm = false;
    page = 1;
  });

  return () => {
    const data = currentData();
    const cols = currentCols();
    const filtered = applyFilters(data);

    // 分页
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    if (safePage !== page) page = safePage;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    // 列的筛选选项
    const filterOptions = cols
      .filter((c) => c.sortable)
      .map((c) => {
        const vals = [...new Set(data.map((r) => String((r as any)[c.key])))].sort();
        return { key: c.key, label: c.label, values: vals.slice(0, 20) };
      });

    const allSelected = filtered.length > 0 && selectedKeys.size === filtered.length;

    return (
      <div>
        {/* 工具栏 */}
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* 数据源切换 */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "#f3f4f6",
                borderRadius: "6px",
                padding: "3px",
              }}
            >
              {(["users", "products"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    source = s;
                    sortKey = null;
                    page = 1;
                    searchText = "";
                    filterKey = "";
                    filterValue = "";
                    selectedKeys = new Set();
                    update();
                  }}
                  style={{
                    padding: "5px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: source === s ? "#fff" : "transparent",
                    color: source === s ? "#111827" : "#6b7280",
                    boxShadow: source === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {s === "users" ? "👥 用户" : "📦 产品"}
                </button>
              ))}
            </div>

            <span style={{ color: "#d1d5db" }}>|</span>

            {/* 搜索 */}
            <input
              value={searchText}
              onInput={(e: any) => handleSearch(e.target.value)}
              placeholder="全局搜索..."
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
                width: "180px",
              }}
            />

            {/* 列筛选 */}
            <select
              value={filterKey}
              onChange={(e: any) => handleFilterChange(e.target.value, "")}
              style={{
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              <option value="">筛选列</option>
              {filterOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            {filterKey && (
              <select
                value={filterValue}
                onChange={(e: any) => handleFilterChange(filterKey, e.target.value)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "#fff",
                }}
              >
                <option value="">全部</option>
                {filterOptions
                  .find((o) => o.key === filterKey)
                  ?.values.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
              </select>
            )}

            <span style={{ color: "#d1d5db" }}>|</span>

            {/* 每页条数 */}
            <select
              value={pageSize}
              onChange={(e: any) => {
                pageSize = Number(e.target.value);
                page = 1;
                update();
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "13px",
                background: "#fff",
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  每页 {n} 条
                </option>
              ))}
            </select>

            {/* 批量操作 */}
            {selectedKeys.size > 0 && (
              <>
                <span style={{ color: "#6366f1", fontSize: "13px" }}>
                  已选 {selectedKeys.size} 项
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    selectedKeys = new Set();
                    update();
                  }}
                >
                  取消选择
                </Button>
                {/* 使用 action() 包装的批量删除 */}
                <Button size="sm" variant="danger" onClick={handleBatchDelete}>
                  批量删除
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* 数据表格 */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>加载中...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>无匹配数据</p>
        ) : (
          <Card>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                    <th style={{ padding: "10px 14px", width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#6366f1",
                        }}
                      />
                    </th>
                    {cols.map((col) =>
                      col.sortable ? (
                        <SortHeader
                          key={col.key}
                          label={col.label}
                          onSort={() => handleSort(col.key)}
                        />
                      ) : (
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
                          {col.label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => {
                    const id = (row as any).id;
                    const selected = selectedKeys.has(id);
                    return (
                      <tr
                        key={id}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          background: selected ? "#eef2ff" : "transparent",
                          transition: "background 0.1s",
                        }}
                        onMouseOver={(e: MouseEvent) => {
                          if (!selected)
                            (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                        }}
                        onMouseOut={(e: MouseEvent) => {
                          if (!selected)
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "10px 14px" }}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(id)}
                            style={{
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                              accentColor: "#6366f1",
                            }}
                          />
                        </td>
                        {cols.map((col) => (
                          <td key={col.key} style={{ padding: "10px 14px" }}>
                            {col.render(row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <Paginator
              current={page}
              total={filtered.length}
              pageSize={pageSize}
              onChange={(p) => {
                page = p;
                update();
              }}
            />
          </Card>
        )}

        {/* 批量删除确认 Modal */}
        <Modal
          open={showBatchConfirm}
          title="确认批量删除"
          onClose={() => {
            showBatchConfirm = false;
            update();
          }}
        >
          <p style={{ margin: "0 0 16px", color: "#374151", fontSize: "14px" }}>
            确定要删除选中的 <strong>{selectedKeys.size}</strong> 条记录吗？此操作不可撤销。
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() => {
                showBatchConfirm = false;
                update();
              }}
            >
              取消
            </Button>
            {/* 使用 action() 包装的确认按钮 */}
            <Button variant="danger" onClick={confirmBatchDelete}>
              确认删除
            </Button>
          </div>
        </Modal>
      </div>
    );
  };
}
