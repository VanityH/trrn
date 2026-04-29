import type { Component } from "trrn";

export const Spinner: Component<{ text?: string }> = (props, _ctx) => {
  const text = props?.text ?? "Loading...";
  return () => <div class="spinner">{text}</div>;
};
