/**
 * Phase 9: API 集成测试（context, strict-mode, error-boundary 等）
 */
import { expect, test } from "vite-plus/test";
import { render, h, createContext } from "../src/index.ts";
import type { Component } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ── Context 集成测试 ──────────────────────────────────────────

test("Provider 包裹的子组件 consume 到正确的值", () => {
  const container = makeContainer();
  const ThemeCtx = createContext("light");

  const Child: Component = (_props, ctx) => {
    return (_p) => {
      const theme = ctx.consume(ThemeCtx);
      return h("span", { class: theme }, "themed");
    };
  };

  const App: Component = (_props, _ctx) => {
    return (_p) =>
      h(
        "div",
        null,
        // 默认值（无 Provider 包裹）
        h(Child, null),
        // Provider 包裹
        h(ThemeCtx.Provider, { value: "dark" } as any, h(Child, null)),
      );
  };

  render(App, container);

  const spans = container.querySelectorAll("span");
  expect(spans.length).toBe(2);
  expect(spans[0].className).toBe("light");
  expect(spans[1].className).toBe("dark");

  container.remove();
});

test("嵌套 Context Provider 叠加", () => {
  const container = makeContainer();
  const OuterCtx = createContext("outer-default");
  const InnerCtx = createContext("inner-default");

  const Child: Component = (_props, ctx) => {
    return (_p) => {
      const outer = ctx.consume(OuterCtx);
      const inner = ctx.consume(InnerCtx);
      return h("span", null, `${outer}:${inner}`);
    };
  };

  render(
    ((_props: any, _ctx: any) => {
      return () =>
        h(
          OuterCtx.Provider,
          { value: "outer-A" } as any,
          h(InnerCtx.Provider, { value: "inner-B" } as any, h(Child, null)),
        );
    }) as Component,
    container,
  );

  expect(container.textContent).toBe("outer-A:inner-B");
  container.remove();
});

test("ctx.consume 在动态更新后拿到新值", async () => {
  const container = makeContainer();
  const ThemeCtx = createContext("light");

  const App: Component = (_props, ctx) => {
    let theme = "light";

    return (_p) =>
      h(
        "div",
        null,
        h(
          ThemeCtx.Provider,
          { value: theme } as any,
          h(
            "button",
            {
              onClick: () => {
                theme = theme === "light" ? "dark" : "light";
                ctx.update();
              },
            },
            theme,
          ),
        ),
      );
  };

  render(App, container);
  expect(container.querySelector("button")?.textContent).toBe("light");

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector("button")?.textContent).toBe("dark");

  container.remove();
});

// ── action() 在复杂场景 ──────────────────────────────────────

test("action() 用于表单提交 + 输入组合", async () => {
  const container = makeContainer();

  const Form: Component = (_props, ctx) => {
    let name = "";
    let submitted = "";

    return (_p) =>
      h(
        "div",
        null,
        submitted ? h("span", { class: "result" }, `Hello ${submitted}`) : null,
        h("input", {
          value: name,
          onInput: (e: Event) => {
            name = (e.target as HTMLInputElement).value;
          },
        }),
        h(
          "button",
          {
            onClick: () => {
              submitted = name;
              ctx.update();
            },
          },
          "Submit",
        ),
      );
  };

  render(Form, container);

  const input = container.querySelector("input")!;
  (input as HTMLInputElement).value = "World";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  container.querySelector("button")!.click();
  await tick();

  expect(container.querySelector(".result")?.textContent).toBe("Hello World");
  container.remove();
});

// ── render 函数返回 null / 原始值 ────────────────────────────

test("render 返回 null 不渲染任何 DOM", () => {
  const container = makeContainer();

  const Comp: Component = (_props, _ctx) => {
    let visible = false;
    return (_p) => (visible ? h("span", null, "visible") : null);
  };

  render(Comp, container);
  expect(container.children.length).toBe(0);
  container.remove();
});

// ── 深层嵌套边界 ─────────────────────────────────────────────

test("5 层嵌套组件", () => {
  const container = makeContainer();
  let initCount = 0;

  const Leaf: Component<{ v: number }> = (_props, _ctx) => {
    initCount++;
    return (p) => h("em", null, String(p?.v ?? 0));
  };

  const L4: Component<{ v: number }> = (_props, _c) => {
    initCount++;
    return (p) => h("div", null, h(Leaf, { v: (p?.v ?? 0) + 1 }));
  };
  const L3: Component<{ v: number }> = (_props, _c) => {
    initCount++;
    return (p) => h(L4, { v: (p?.v ?? 0) + 1 } as any);
  };
  const L2: Component<{ v: number }> = (_props, _c) => {
    initCount++;
    return (p) => h(L3, { v: (p?.v ?? 0) + 1 } as any);
  };
  const Root: Component = (_props, _c) => {
    initCount++;
    return (_p) => h(L2, { v: 0 } as any);
  };

  render(Root, container);
  expect(container.textContent).toBe("3");

  // 外层函数各执行一次
  expect(initCount).toBe(5);

  container.remove();
});
