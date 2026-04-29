import type { RenderFn } from "trrn";

export function Spinner(
  props: { text?: string } | undefined,
): RenderFn {
  const text = props?.text ?? "Loading...";
  return () => <div class="spinner">{text}</div>;
}
