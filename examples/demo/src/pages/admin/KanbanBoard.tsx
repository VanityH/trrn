import { defineComponent } from "trrn";
import type { Task } from "../../mock/types.ts";
import { fetchTasks } from "../../mock/api.ts";

// ── Types ─────────────────────────────

type SortKey = "created" | "priority";
type ColumnId = "todo" | "in-progress" | "done";

interface ColumnState {
  collapsed: boolean;
  sortBy: SortKey;
}

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "todo", title: "待办", color: "#6366f1" },
  { id: "in-progress", title: "进行中", color: "#f59e0b" },
  { id: "done", title: "已完成", color: "#10b981" },
];

// ── KanbanCard (子组件) ────────────────

interface KanbanCardProps {
  task: Task;
  expanded: boolean;
  onToggleExpand: (id: number) => void;
}

const KanbanCard = defineComponent<KanbanCardProps>(() => {
  const priorityColors: Record<string, string> = {
    urgent: "#ef4444",
    high: "#f97316",
    medium: "#eab308",
    low: "#6b7280",
  };

  return (p) => (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "8px",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 500, fontSize: "13px", lineHeight: 1.4 }}>{p.task.title}</div>
        <button
          onClick={() => p.onToggleExpand(p.task.id)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            color: "#9ca3af",
            padding: "2px 4px",
            marginLeft: "4px",
            flexShrink: 0,
          }}
        >
          {p.expanded ? "▲" : "▼"}
        </button>
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }}>
        <span
          style={{
            display: "inline-block",
            padding: "1px 6px",
            borderRadius: "4px",
            fontSize: "11px",
            background: priorityColors[p.task.priority],
            color: "#fff",
            fontWeight: 500,
          }}
        >
          {p.task.priority}
        </span>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>{p.task.assignee}</span>
      </div>
      {p.expanded && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#374151",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "6px",
          }}
        >
          <div>创建时间: {p.task.createdAt}</div>
          <div>ID: {p.task.id}</div>
        </div>
      )}
    </div>
  );
});

// ── KanbanColumn (子组件) ──────────────

interface KanbanColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  collapsed: boolean;
  sortBy: SortKey;
  expandedCards: Set<number>;
  onToggleCollapse: () => void;
  onToggleSort: (sort: SortKey) => void;
  onToggleExpand: (id: number) => void;
}

const KanbanColumn = defineComponent<KanbanColumnProps>(() => {
  return (p) => {
    const sorted = [...p.tasks].sort((a, b) => {
      if (p.sortBy === "priority") {
        const prio: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return prio[a.priority] - prio[b.priority];
      }
      return a.createdAt.localeCompare(b.createdAt);
    });

    return (
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: "#f3f4f6",
          borderRadius: "8px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          onClick={p.onToggleCollapse}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{ width: "10px", height: "10px", borderRadius: "50%", background: p.color }}
            />
            <span style={{ fontWeight: 600, fontSize: "14px" }}>{p.title}</span>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>({p.tasks.length})</span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <span
              onClick={(e) => {
                e.stopPropagation();
                p.onToggleSort("created");
              }}
              style={{
                fontSize: "11px",
                color: p.sortBy === "created" ? p.color : "#9ca3af",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: "3px",
                background: p.sortBy === "created" ? "#e5e7eb" : "transparent",
              }}
            >
              时间
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                p.onToggleSort("priority");
              }}
              style={{
                fontSize: "11px",
                color: p.sortBy === "priority" ? p.color : "#9ca3af",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: "3px",
                background: p.sortBy === "priority" ? "#e5e7eb" : "transparent",
              }}
            >
              优先级
            </span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>{p.collapsed ? "▶" : "▼"}</span>
          </div>
        </div>
        {!p.collapsed && (
          <div style={{ flex: 1, overflow: "auto", minHeight: "60px" }}>
            {sorted.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "20px", fontSize: "13px", color: "#9ca3af" }}
              >
                暂无任务
              </div>
            ) : (
              sorted.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  expanded={p.expandedCards.has(task.id)}
                  onToggleExpand={p.onToggleExpand}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  };
});

// ── KanbanBoardPage (父组件，持有全部状态) ──

export const KanbanBoardPage = defineComponent<object>((_, { update, onMount }) => {
  let tasks: Task[] = [];
  let columns: Record<ColumnId, ColumnState> = {
    todo: { collapsed: false, sortBy: "created" },
    "in-progress": { collapsed: false, sortBy: "created" },
    done: { collapsed: false, sortBy: "created" },
  };
  let expandedCards = new Set<number>();

  const handleToggleCollapse = (id: ColumnId) => {
    columns[id] = { ...columns[id], collapsed: !columns[id].collapsed };
    update();
  };

  const handleToggleSort = (id: ColumnId, sort: SortKey) => {
    columns[id] = { ...columns[id], sortBy: sort };
    update();
  };

  const handleToggleExpand = (taskId: number) => {
    if (expandedCards.has(taskId)) {
      expandedCards.delete(taskId);
    } else {
      expandedCards.add(taskId);
    }
    update();
  };

  onMount(() => {
    void fetchTasks().then((result) => {
      tasks = result;
      update();
    });
  });

  return () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          title={col.title}
          color={col.color}
          tasks={tasks.filter((t) => t.status === col.id)}
          collapsed={columns[col.id].collapsed}
          sortBy={columns[col.id].sortBy}
          expandedCards={expandedCards}
          onToggleCollapse={() => handleToggleCollapse(col.id)}
          onToggleSort={(s) => handleToggleSort(col.id, s)}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
});
