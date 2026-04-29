import type { RenderFn } from "trrn";

export function TodoItem({
  id,
  text,
  done,
  onToggle,
  onRemove,
}: {
  id: number;
  text: string;
  done: boolean;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}): RenderFn {
  return () => (
    <li class="todo-item" key={id}>
      <span
        onClick={() => onToggle(id)}
        style={{
          cursor: "pointer",
          textDecoration: done ? "line-through" : "none",
          color: done ? "#aaa" : "#333",
        }}
      >
        {text}
      </span>
      <button onClick={() => onRemove(id)} style="margin-left: 8px;">
        x
      </button>
    </li>
  );
}
