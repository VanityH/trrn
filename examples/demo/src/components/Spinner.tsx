import type { RenderFn } from "trrn";

export function Spinner({ text = "Loading..." }: { text?: string }): RenderFn {
  return () => <div class="spinner">{text}</div>;
}
