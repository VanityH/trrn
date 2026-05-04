/**
 * Phase 9: API 集成测试（action, 边界情况等）
 */
import { expect, test } from "vite-plus/test";
import { render, h } from "preact";
import { defineComponent } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ── action() 在复杂场景 ──────────────────────────────────────

test("action() 用于表单提交 + 输入组合", async () => {
  const container = makeContainer();

  const Form = defineComponent((_props, ctx) => {
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
        h("button", { onClick: () => { submitted = name; ctx.update(); } }, "Submit"),
      );
  });

  render(h(Form, null), container);

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

  const Comp = defineComponent((_props, _ctx) => {
    let visible = false;
    return (_p) => (visible ? h("span", null, "visible") : null);
  });

  render(h(Comp, null), container);
  expect(container.children.length).toBe(0);
  container.remove();
});

// ── 深层嵌套边界 ─────────────────────────────────────────────

test("5 层嵌套组件", () => {
  const container = makeContainer();
  let initCount = 0;

  const Leaf = defineComponent((_props, _ctx) => {
    initCount++;
    return (p) => h("em", null, String(p?.v ?? 0));
  });

  const L4 = defineComponent((_props, _c) => {
    initCount++;
    return (p) => h("div", null, h(Leaf, { v: ((p?.v as number) ?? 0) + 1 }));
  });
  const L3 = defineComponent((_props, _c) => {
    initCount++;
    return (p) => h(L4, { v: ((p?.v as number) ?? 0) + 1 } as any);
  });
  const L2 = defineComponent((_props, _c) => {
    initCount++;
    return (p) => h(L3, { v: ((p?.v as number) ?? 0) + 1 } as any);
  });
  const Root = defineComponent((_props, _c) => {
    initCount++;
    return (_p) => h(L2, { v: 0 } as any);
  });

  render(h(Root, null), container);
  expect(container.textContent).toBe("3");

  // 外层函数各执行一次
  expect(initCount).toBe(5);

  container.remove();
});
