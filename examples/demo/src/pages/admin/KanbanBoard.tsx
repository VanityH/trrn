/**
 * 看板 — 展示 trrn 状态提升 + render 函数参数接收更新 props
 *
 * 核心模式:
 * - 所有状态集中在 KanbanBoardPage 管理
 * - KanbanColumn/KanbanCard 无内部闭包状态
 * - 子组件的 render 函数通过 props 参数接收最新数据
 * - 父组件调用 update() 触发重渲染，Preact 将新 JSX props 传递给子组件 adapter
 * - adapter 将 propsRef.current = props → renderFn(propsRef.current)
 * - 因此子组件的 render 函数参数始终是最新 props
 * - action() 包装事件处理器
 * - 3 层嵌套组件（看板 → 列 → 卡片）
 */
import type { Ctx, RenderFn } from "trrn";
import { action } from "trrn";
import { Card as UICard } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Modal } from "../../components/ui/Modal.tsx";

// ── 类型 ───────────────────────────────────────────────────────

type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: number;
  title: string;
  desc: string;
  priority: TaskPriority;
  assignee: string;
  column: "todo" | "progress" | "done";
  createdAt: number;
}

type ColumnKey = "todo" | "progress" | "done";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  color: string;
  icon: string;
}

const COLUMNS: ColumnDef[] = [
  { key: "todo", label: "待处理", color: "#f59e0b", icon: "📋" },
  { key: "progress", label: "进行中", color: "#6366f1", icon: "⚡" },
  { key: "done", label: "已完成", color: "#16a34a", icon: "✅" },
];

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: "danger" | "warning" | "info" | "default" }
> = {
  urgent: { label: "紧急", color: "danger" },
  high: { label: "高", color: "warning" },
  medium: { label: "中", color: "info" },
  low: { label: "低", color: "default" },
};

const NAMES = ["张三", "李四", "王五", "赵六", "陈七", "周十"];

function randomTask(column: ColumnKey, id: number): Task {
  const title = [
    "修复用户登录认证漏洞",
    "优化首页加载性能",
    "设计数据看板界面",
    "编写 API 文档",
    "重构通知模块",
    "添加单元测试覆盖",
    "升级依赖包版本",
    "修复移动端布局异常",
    "实现批量导出功能",
    "添加搜索自动补全",
    "配置 CI/CD 流水线",
    "审查代码合并请求",
  ];
  return {
    id,
    title: title[id % title.length] + ` #${id}`,
    desc: `任务描述：这是 ${title[id % title.length]} 的相关工作内容。`,
    priority: (["low", "medium", "high", "urgent"] as TaskPriority[])[id % 4],
    assignee: NAMES[id % NAMES.length],
    column,
    createdAt: Date.now() - id * 3600000,
  };
}

function createInitialTasks(): Task[] {
  const tasks: Task[] = [];
  let id = 1;
  for (const col of COLUMNS) {
    for (let i = 0; i < 3; i++) {
      tasks.push(randomTask(col.key, id++));
    }
  }
  return tasks;
}

// ── 看板卡片组件（纯展示，数据全部从 render 函数 props 参数获取） ──

function KanbanCard(_props: Record<string, unknown>, _ctx: Ctx): RenderFn {
  return (latestProps) => {
    const p = latestProps as any;
    const task: Task = p.task;
    const expanded: boolean = p.expanded;
    const onMove = p.onMove;
    const onEdit = p.onEdit;
    const onDelete = p.onDelete;
    const onToggleExpand = p.onToggleExpand;
    const priority = PRIORITY_CONFIG[task.priority];

    const canMove = COLUMNS.map((c) => c.key);
    const currentIdx = canMove.indexOf(task.column);

    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "8px",
          cursor: "pointer",
          transition: "box-shadow 0.15s",
          boxShadow: expanded ? "0 4px 12px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
        }}
        onClick={onToggleExpand}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <Badge label={priority.label} variant={priority.color} />
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>@{task.assignee}</span>
          </div>
        </div>

        <p
          style={{
            margin: "0 0 4px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#111827",
            lineHeight: 1.4,
          }}
        >
          {task.title}
        </p>

        {expanded && (
          <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>
              {task.desc}
            </p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {currentIdx > 0 && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onMove(task.id, canMove[currentIdx - 1]);
                  }}
                  style={miniBtnStyle}
                  title="左移"
                >
                  ←
                </button>
              )}
              {currentIdx < canMove.length - 1 && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onMove(task.id, canMove[currentIdx + 1]);
                  }}
                  style={miniBtnStyle}
                  title="右移"
                >
                  →
                </button>
              )}
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                style={miniBtnStyle}
                title="编辑"
              >
                ✏️
              </button>
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                style={{ ...miniBtnStyle, color: "#dc2626" }}
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
}

const miniBtnStyle: Record<string, string> = {
  padding: "3px 8px",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  fontSize: "12px",
  lineHeight: "1.2",
};

// ── 看板列组件（纯展示，数据全部从 render 函数 props 参数获取） ──

function KanbanColumn(_props: Record<string, unknown>, _ctx: Ctx): RenderFn {
  return (latestProps) => {
    const p = latestProps as any;
    const def: ColumnDef = p.def;
    const tasks: Task[] = p.tasks;
    const collapsed: boolean = p.collapsed;
    const sortBy: "created" | "priority" | "alpha" = p.sortBy;
    const expandedCards: Record<number, boolean> = p.expandedCards;
    const onAdd = p.onAdd;
    const onMove = p.onMove;
    const onEdit = p.onEdit;
    const onDelete = p.onDelete;
    const onToggleCollapse = p.onToggleCollapse;
    const onToggleSort = p.onToggleSort;
    const onToggleExpand = p.onToggleExpand;

    // 排序
    const sorted = [...tasks];
    if (sortBy === "priority") {
      const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sortBy === "alpha") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    }

    return (
      <div
        style={{
          flex: 1,
          minWidth: "280px",
          maxWidth: "360px",
          background: "#f3f4f6",
          borderRadius: "10px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${def.color}22`,
        }}
      >
        {/* 列头 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: `2px solid ${def.color}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>{def.icon}</span>
            <strong style={{ fontSize: "14px", color: "#111827" }}>{def.label}</strong>
            <span
              style={{
                background: def.color,
                color: "#fff",
                borderRadius: "999px",
                padding: "1px 8px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {tasks.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={onToggleCollapse}
              style={{ ...miniBtnStyle, fontSize: "10px", padding: "2px 6px" }}
              title={collapsed ? "展开" : "折叠"}
            >
              {collapsed ? "▶" : "▼"}
            </button>
          </div>
        </div>

        {/* 排序切换 */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px", flexWrap: "wrap" }}>
          {(["created", "priority", "alpha"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onToggleSort(s)}
              style={{
                padding: "2px 8px",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                background: sortBy === s ? def.color : "#e5e7eb",
                color: sortBy === s ? "#fff" : "#6b7280",
                fontWeight: sortBy === s ? 600 : 400,
              }}
            >
              {s === "created" ? "时间" : s === "priority" ? "优先级" : "名称"}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        {!collapsed && (
          <div style={{ flex: 1, minHeight: "100px", overflowY: "auto" }}>
            {sorted.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: "13px" }}
              >
                暂无任务
              </div>
            )}
            {sorted.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                expanded={expandedCards[task.id] ?? false}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleExpand={() => onToggleExpand(task.id)}
              />
            ))}
          </div>
        )}

        {/* 添加按钮 */}
        <button
          onClick={() => onAdd(def.key)}
          style={{
            marginTop: "8px",
            padding: "8px",
            border: `1px dashed ${def.color}55`,
            borderRadius: "6px",
            background: "transparent",
            color: def.color,
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            transition: "background 0.15s",
          }}
          onMouseOver={(e: MouseEvent) => {
            (e.currentTarget as HTMLElement).style.background = `${def.color}11`;
          }}
          onMouseOut={(e: MouseEvent) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          + 添加任务
        </button>
      </div>
    );
  };
}

// ── 主页面（所有状态集中管理） ─────────────────────────────────

export function KanbanBoardPage(_: unknown, { update }: Ctx): RenderFn {
  // ── 状态集中管理 ────────────────────────────
  let tasks = createInitialTasks();
  let nextId = tasks.length + 1;

  // 每列的折叠/排序状态
  let columnStates: Record<
    ColumnKey,
    { collapsed: boolean; sortBy: "created" | "priority" | "alpha" }
  > = {
    todo: { collapsed: false, sortBy: "created" },
    progress: { collapsed: false, sortBy: "created" },
    done: { collapsed: false, sortBy: "created" },
  };

  // 每张卡片的展开状态
  let expandedCards: Record<number, boolean> = {};

  // 编辑/新建 Modal
  let modalOpen = false;
  let editingTask: Task | null = null;
  let editForm = {
    title: "",
    desc: "",
    priority: "medium" as TaskPriority,
    assignee: "",
    column: "todo" as ColumnKey,
  };

  // ── 状态变更处理器（修改闭包变量 + update()） ──

  const toggleCollapse = (col: ColumnKey) => {
    columnStates[col].collapsed = !columnStates[col].collapsed;
    update();
  };

  const toggleSort = (col: ColumnKey, s: "created" | "priority" | "alpha") => {
    columnStates[col].sortBy = s;
    update();
  };

  const toggleExpand = (taskId: number) => {
    expandedCards[taskId] = !expandedCards[taskId];
    update();
  };

  const moveTask = (taskId: number, toCol: ColumnKey) => {
    tasks = tasks.map((t) => (t.id === taskId ? { ...t, column: toCol } : t));
    update();
  };

  const deleteTask = (taskId: number) => {
    tasks = tasks.filter((t) => t.id !== taskId);
    update();
  };

  const saveTask = action(update as any, () => {
    if (!editForm.title.trim()) return;

    if (editingTask) {
      tasks = tasks.map((t) =>
        t.id === editingTask!.id
          ? {
              ...t,
              title: editForm.title,
              desc: editForm.desc,
              priority: editForm.priority,
              assignee: editForm.assignee,
            }
          : t,
      );
    } else {
      tasks = [
        ...tasks,
        {
          id: nextId++,
          title: editForm.title,
          desc: editForm.desc,
          priority: editForm.priority,
          assignee: editForm.assignee || "未分配",
          column: editForm.column,
          createdAt: Date.now(),
        },
      ];
    }
    modalOpen = false;
    editingTask = null;
  });

  const openAdd = (col: ColumnKey) => {
    editingTask = null;
    editForm = { title: "", desc: "", priority: "medium", assignee: "", column: col };
    modalOpen = true;
    update();
  };

  const openEdit = (task: Task) => {
    editingTask = task;
    editForm = {
      title: task.title,
      desc: task.desc,
      priority: task.priority,
      assignee: task.assignee,
      column: task.column,
    };
    modalOpen = true;
    update();
  };

  // ── 统计 ────────────────────────────────────
  const getStats = () => {
    const byCol = COLUMNS.map((c) => ({
      ...c,
      count: tasks.filter((t) => t.column === c.key).length,
    }));
    const byPriority = {
      urgent: tasks.filter((t) => t.priority === "urgent").length,
      high: tasks.filter((t) => t.priority === "high").length,
      medium: tasks.filter((t) => t.priority === "medium").length,
      low: tasks.filter((t) => t.priority === "low").length,
    };
    return { byCol, byPriority, total: tasks.length };
  };

  return () => {
    const stats = getStats();

    return (
      <div>
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>
                看板
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                共 {stats.total} 个任务 · 编辑/查看详情请点击卡片
              </p>
            </div>
            <Button variant="primary" onClick={() => openAdd("todo")}>
              + 新建任务
            </Button>
          </div>

          {/* 统计条 */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
              fontSize: "12px",
              flexWrap: "wrap",
            }}
          >
            {stats.byCol.map((c) => (
              <span
                key={c.key}
                style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}
              >
                <span
                  style={{ width: "8px", height: "8px", borderRadius: "50%", background: c.color }}
                />
                {c.label}: <strong>{c.count}</strong>
              </span>
            ))}
            <span style={{ color: "#d1d5db" }}>|</span>
            <span style={{ color: "#dc2626" }}>紧急: {stats.byPriority.urgent}</span>
            <span style={{ color: "#d97706" }}>高: {stats.byPriority.high}</span>
            <span style={{ color: "#6b7280" }}>中: {stats.byPriority.medium}</span>
            <span style={{ color: "#9ca3af" }}>低: {stats.byPriority.low}</span>
          </div>
        </div>

        {/* 看板列 — 通过 JSX props 下推状态 */}
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px" }}>
          {COLUMNS.map((def) => {
            const colTasks = tasks.filter((t) => t.column === def.key);
            const colState = columnStates[def.key];
            return (
              <KanbanColumn
                key={def.key}
                def={def}
                tasks={colTasks}
                collapsed={colState.collapsed}
                sortBy={colState.sortBy}
                expandedCards={expandedCards}
                onAdd={openAdd}
                onMove={moveTask}
                onEdit={openEdit}
                onDelete={deleteTask}
                onToggleCollapse={() => toggleCollapse(def.key)}
                onToggleSort={(s: string) => toggleSort(def.key, s as any)}
                onToggleExpand={(id: number) => toggleExpand(id)}
              />
            );
          })}
        </div>

        {/* 新建/编辑 Modal */}
        <Modal
          open={modalOpen}
          title={editingTask ? "编辑任务" : "新建任务"}
          onClose={() => {
            modalOpen = false;
            update();
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              标题 *
            </label>
            <input
              value={editForm.title}
              onInput={(e: any) => {
                editForm = { ...editForm, title: e.target.value };
              }}
              placeholder="任务标题"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
              }}
            >
              描述
            </label>
            <textarea
              value={editForm.desc}
              onInput={(e: any) => {
                editForm = { ...editForm, desc: e.target.value };
              }}
              placeholder="任务描述..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                优先级
              </label>
              <select
                value={editForm.priority}
                onChange={(e: any) => {
                  editForm = { ...editForm, priority: e.target.value };
                }}
                style={selectStyle}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                负责人
              </label>
              <select
                value={editForm.assignee}
                onChange={(e: any) => {
                  editForm = { ...editForm, assignee: e.target.value };
                }}
                style={selectStyle}
              >
                <option value="">未分配</option>
                {NAMES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!editingTask && (
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                目标列
              </label>
              <select
                value={editForm.column}
                onChange={(e: any) => {
                  editForm = { ...editForm, column: e.target.value };
                }}
                style={selectStyle}
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                modalOpen = false;
                update();
              }}
            >
              取消
            </Button>
            <Button variant="primary" onClick={saveTask}>
              {editingTask ? "保存" : "创建"}
            </Button>
          </div>
        </Modal>

        {/* 技术说明 */}
        <UICard
          title="trrn 模式说明"
          style={{ marginTop: "16px", fontSize: "13px", color: "#6b7280" }}
        >
          <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 2 }}>
            <li>
              所有状态集中在 <strong>KanbanBoardPage</strong> 管理，子组件无内部闭包状态
            </li>
            <li>
              子组件通过 <strong>render 函数的 props 参数</strong>接收最新数据 — 父组件 update()
              触发重渲染后，Preact 将新 JSX props 传给子组件 adapter，adapter 调用
              renderFn(propsRef.current) 时 props 参数即为最新值
            </li>
            <li>
              排序/折叠/展开操作：父组件修改闭包变量后调用 <code>ctx.update()</code>，通过 JSX props
              将新状态下推
            </li>
            <li>
              按钮操作使用 <code>action()</code> 包装，自动触发 <code>ctx.update()</code>
            </li>
          </ul>
        </UICard>
      </div>
    );
  };
}

const inputStyle: Record<string, string> = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const selectStyle: Record<string, string> = { ...inputStyle, background: "#fff" };
