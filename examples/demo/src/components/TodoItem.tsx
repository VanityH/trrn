import type { Component } from "trrn";

export const TodoItem: Component<{
  id: number;
  text: string;
  done: boolean;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}> = (props, _ctx) => {
  const { id, text, done, onToggle, onRemove } = props ?? {};

  return (_p) => (
    <li class="todo-item" key={id}>
      <span
        onClick={() => onToggle?.(id!)}
        style={{
          cursor: "pointer",
          textDecoration: done ? "line-through" : "none",
          color: done ? "#aaa" : "#333",
        }}
      >
        {text}
      </span>
      <button onClick={() => onRemove?.(id!)} style="margin-left: 8px;">
        x
      </button>
    </li>
  );
};
