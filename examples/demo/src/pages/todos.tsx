import type { Ctx, RenderFn } from "trrn";
import { TodoItem } from "../components/TodoItem.tsx";

export function TodosPage(_: undefined, { update }: Ctx): RenderFn {
  let todos = [
    { id: 1, text: "Learn trrn closure pattern", done: true },
    { id: 2, text: "Build a todo app", done: false },
    { id: 3, text: "Test update(newProps)", done: false },
  ];
  let text = "";
  let filter: "all" | "active" | "done" = "all";

  const add = () => {
    if (text.trim()) {
      todos = [...todos, { id: Date.now(), text, done: false }];
      text = "";
      update();
    }
  };

  const toggle = (id: number) => {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    update();
  };

  const remove = (id: number) => {
    todos = todos.filter((t) => t.id !== id);
    update();
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  return () => (
    <div>
      <h2>Todo List</h2>
      <p style="color: #666; font-size: 14px;">
        Demonstrates: list + keys, conditional rendering, form input, filter,
        and <code>update()</code> with closure state.
      </p>

      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input
          value={text}
          onInput={(e: any) => { text = e.target.value; }}
          onKeyDown={(e: any) => e.key === "Enter" && add()}
          placeholder="Add a todo..."
          style="padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; flex: 1;"
        />
        <button
          onClick={add}
          style="padding: 6px 16px; background: #6366f1; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
        >
          Add
        </button>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 12px;">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { filter = f; update(); }}
            style={{
              padding: "4px 12px",
              background: filter === f ? "#6366f1" : "#eee",
              color: filter === f ? "#fff" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style="color: #999;">No todos.</p>
      ) : (
        <ul style="list-style: none; padding: 0;">
          {filtered.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              text={todo.text}
              done={todo.done}
              onToggle={toggle}
              onRemove={remove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
