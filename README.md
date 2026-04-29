# trrn

Closure-based frontend framework on [Preact](https://preactjs.com/). No `useState`, no hooks — just functions and closures.

```ts
import { render, h } from "trrn";

function Counter(_props, ctx) {
  let count = 0; // closure = state

  return (_p) =>
    h(
      "div",
      null,
      h("span", null, String(count)),
      h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        "+",
      ),
    );
}

render(Counter, document.getElementById("app"));
```

## Why trrn?

- **Closure as state** — variables just work, no `useState`, no dependency arrays
- **Explicit updates** — call `ctx.update()` when you want to re-render
- **No wrapper functions** — a component is a plain function, no `defineComponent`
- **Preact under the hood** — compatible with the Preact ecosystem

## Installation

```bash
npm install trrn preact
```

## Quick Start

```ts
import { render, h } from "trrn";

function App(_props, ctx) {
  let name = "";

  ctx.onMount(() => console.log("DOM ready"));
  ctx.onUnmount(() => console.log("cleanup"));

  return (_p) =>
    h(
      "div",
      null,
      h("input", {
        value: name,
        onInput: (e) => {
          name = e.target.value;
          ctx.update();
        },
      }),
      h("p", null, `Hello, ${name || "world"}`),
    );
}

render(App, document.getElementById("app"));
```

## API Overview

| Export                            | Description                     |
| --------------------------------- | ------------------------------- |
| `render(Comp, container, props?)` | Mount component to DOM          |
| `h(type, props, ...children)`     | Create VNode                    |
| `action(ctx, fn)`                 | Event handler that auto-updates |
| `createContext(defaultValue)`     | Create a Context                |
| `ErrorBoundary`                   | Catch render errors             |
| `StrictMode`                      | Dev-mode double-render          |

**ctx methods:** `update()` | `onMount()` | `onUnmount()` | `consume()`

## Documentation

- [Getting Started](./docs/guide/getting-started.md)
- [Pattern Guide](./docs/guide/patterns.md)
- [vanity-h Guide](./docs/guide/vanity-h.md)
- [API Reference](./docs/api/README.md)

## With vanity-h (optional)

```ts
import createVanity from "vanity-h";
const { div, span, button } = createVanity(h);

function Comp(_props, ctx) {
  let count = 0;
  return (_p) =>
    div.class("counter")(
      span(String(count)),
      button.onClick(() => {
        count++;
        ctx.update();
      })("+"),
    );
}
```

See the [full vanity-h guide](./docs/guide/vanity-h.md).

## License

MIT
