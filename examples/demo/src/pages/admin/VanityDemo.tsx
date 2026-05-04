import { defineComponent } from "trrn";
import { h } from "preact";
import createVanity from "vanity-h";
import { useState } from "preact/hooks";

const { div, button, span } = createVanity(h);

export const VanityCounter = defineComponent(() => {
  return () => {
    const [count, setCount] = useState(0);
    return div(button.onClick(() => setCount((n) => n + 1))("+"), span(count));
  };
});
