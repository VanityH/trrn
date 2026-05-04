import { defineComponent } from "trrn";
import type { Ctx } from "trrn";
import type { Task } from "../../mock/types.ts";
import { fetchTasks } from "../../mock/api.ts";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Pager } from "../../components/Pager.tsx";

type SortField = "title" | "priority" | "assignee" | "createdAt";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export const DataExplorerPage = defineComponent<object>((_, { update, onMount }: Ctx) => {
  let allTasks: Task[] = [];
  let search = "";
  let statusFilter = "";
  let priorityFilter = "";
  let sortField: SortField = "createdAt";
  let sortDir: SortDir = "desc";
  let page = 1;
  const pageSize = 5;

  onMount(() => {
    void fetchTasks().then((result) => {
      allTasks = result;
      update();
    });
  });

  function applyFilters(): Task[] {
    let result = allTasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "priority") {
        cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
      } else if (sortField === "createdAt") {
        cmp = a.createdAt.localeCompare(b.createdAt);
      } else {
        cmp = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }

  function setSort(field: SortField) {
    if (sortField === field) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDir = "asc";
    }
    page = 1;
    update();
  }

  function handleSearch(v: string) {
    search = v;
    page = 1;
    update();
  }

  function handleStatusFilter(v: string) {
    statusFilter = v;
    page = 1;
    update();
  }

  function handlePriorityFilter(v: string) {
    priorityFilter = v;
    page = 1;
    update();
  }

  const priorityBadge: Record<string, string> = {
    urgent: "danger",
    high: "warning",
    medium: "default",
    low: "default",
  };

  return () => {
    const filtered = applyFilters();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const p = Math.min(page, totalPages);
    const paged = filtered.slice((p - 1) * pageSize, p * pageSize);

    const sortArrow = (field: SortField) =>
      sortField === field ? (sortDir === "asc" ? " ▲" : " ▼") : "";

    return (
      <div>
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              placeholder="搜索标题..."
              value={search}
              onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
                flex: 1,
                minWidth: "160px",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter((e.target as HTMLSelectElement).value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
              }}
            >
              <option value="">全部状态</option>
              <option value="todo">待办</option>
              <option value="in-progress">进行中</option>
              <option value="done">已完成</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityFilter((e.target as HTMLSelectElement).value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                fontSize: "13px",
              }}
            >
              <option value="">全部优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <span style={{ fontSize: "13px", color: "#6b7280", alignSelf: "center" }}>
              共 {filtered.length} 条
            </span>
          </div>
        </Card>

        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                {(["title", "priority", "assignee", "createdAt"] as SortField[]).map((field) => (
                  <th
                    key={field}
                    onClick={() => setSort(field)}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      userSelect: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    {field === "title"
                      ? "标题"
                      : field === "priority"
                        ? "优先级"
                        : field === "assignee"
                          ? "负责人"
                          : "创建时间"}
                    {sortArrow(field)}
                  </th>
                ))}
                <th
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  状态
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}
                  >
                    暂无数据
                  </td>
                </tr>
              ) : (
                paged.map((task) => (
                  <tr key={task.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{task.title}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <Badge variant={priorityBadge[task.priority] as any}>{task.priority}</Badge>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{task.assignee}</td>
                    <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "13px" }}>
                      {task.createdAt}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <Badge
                        variant={
                          task.status === "done"
                            ? "success"
                            : task.status === "in-progress"
                              ? "warning"
                              : "default"
                        }
                      >
                        {task.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <Pager
              page={p}
              total={filtered.length}
              pageSize={pageSize}
              onChange={(n) => {
                page = n;
                update();
              }}
            />
          )}
        </Card>
      </div>
    );
  };
});
