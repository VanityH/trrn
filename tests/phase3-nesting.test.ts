/**
 * Phase 3: 组件组合/嵌套可行性验证
 *
 * 验证点：
 * 1. trrn 父组件内嵌普通 HTML 元素（无问题）
 * 2. trrn 父组件内嵌另一个 trrn 组件（核心挑战）
 * 3. 嵌套组件的状态彼此独立
 * 4. 嵌套组件可以触发父组件更新
 */

import { expect, test } from "vite-plus/test";
import { render, h } from "../src/index.ts";
import type { Component } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ─── Test 1: 父组件内嵌普通 HTML ──────────────────────────────

test("父组件 render 返回包含 HTML 元素的 VNode", () => {
  const container = makeContainer();

  const Parent: Component = (_props, _ctx) => {
    return (_p) =>
      h("div", null,
        h("span", { class: "title" }, "Hello"),
        h("span", { class: "body" }, "World"),
      );
  };

  render(Parent, container);

  expect(container.querySelector(".title")?.textContent).toBe("Hello");
  expect(container.querySelector(".body")?.textContent).toBe("World");

  container.remove();
});

// ─── Test 2: 父组件内嵌 trrn 子组件 ───────────────────────────

test("父组件内嵌 trrn 子组件，子组件独立渲染", () => {
  const container = makeContainer();

  const Child: Component<{ name: string }> = (_props, _ctx) => {
    return (p) => h("span", null, p?.name ?? "?");
  };

  const Parent: Component = (_props, _ctx) => {
    return (_p) =>
      h("div", null,
        h(Child, { name: "Alice" }),
        h(Child, { name: "Bob" }),
      );
  };

  render(Parent, container);

  const spans = container.querySelectorAll("span");
  expect(spans.length).toBe(2);
  expect(spans[0].textContent).toBe("Alice");
  expect(spans[1].textContent).toBe("Bob");

  container.remove();
});

// ─── Test 3: 子组件拥有独立状态 ──────────────────────────────

test("嵌套 trrn 子组件持有独立闭包状态", async () => {
  const container = makeContainer();

  const Counter: Component<{ label: string }> = (props, ctx) => {
    const { label } = props ?? { label: "?" };
    let count = 0;
    return (_p) =>
      h("button", {
        "data-label": label,
        onClick: () => {
          count++;
          ctx.update();
        },
      }, `${label}:${count}`);
  };

  const Parent: Component = (_props, _ctx) => {
    return (_p) =>
      h("div", null,
        h(Counter, { label: "A" }),
        h(Counter, { label: "B" }),
      );
  };

  render(Parent, container);

  const [btnA, btnB] = container.querySelectorAll("button");
  expect(btnA.textContent).toBe("A:0");
  expect(btnB.textContent).toBe("B:0");

  // 点击 A 两次
  (btnA as HTMLButtonElement).click();
  await tick();
  expect(btnA.textContent).toBe("A:1");
  expect(btnB.textContent).toBe("B:0");

  (btnA as HTMLButtonElement).click();
  await tick();
  expect(btnA.textContent).toBe("A:2");
  expect(btnB.textContent).toBe("B:0");

  // 点击 B 一次
  (btnB as HTMLButtonElement).click();
  await tick();
  expect(btnA.textContent).toBe("A:2");
  expect(btnB.textContent).toBe("B:1");

  container.remove();
});

// ─── Test 4: 子组件触发父组件更新 ────────────────────────────

test("子组件通过回调触发父组件状态更新", async () => {
  const container = makeContainer();

  const ChildBtn: Component<{
    label: string;
    onSelect: () => void;
  }> = (p, _ctx) => {
    const { label } = p ?? { label: "?" };
    return (p) =>
      h("button", {
        onClick: () => {
          // 调用父组件传来的回调
          (p as any)?.onSelect?.();
        },
      }, label);
  };

  const Parent: Component = (_props, ctx) => {
    let selected = "none";
    return (_p) => {
      return h("div", null,
        h("span", { class: "result" }, selected),
        h(ChildBtn, {
          label: "Pick A",
          onSelect: () => {
            selected = "A";
            ctx.update();
          },
        }),
      );
    };
  };

  render(Parent, container);

  expect(container.querySelector(".result")?.textContent).toBe("none");

  container.querySelector("button")!.click();
  await tick();

  expect(container.querySelector(".result")?.textContent).toBe("A");

  container.remove();
});

// ─── Test 5: 深层嵌套 ─────────────────────────────────────────

test("三层嵌套组件", () => {
  const container = makeContainer();

  const Leaf: Component<{ v: string }> = (_props, _ctx) => {
    return (p) => h("em", null, p?.v ?? "?");
  };

  const Middle: Component<{ title: string }> = (_props, _ctx) => {
    return (p) =>
      h("div", { class: "middle" },
        h("strong", null, p?.title ?? "?"),
        h(Leaf, { v: "leaf-" + (p?.title ?? "?") }),
      );
  };

  const Root: Component = (_props, _ctx) => {
    return (_p) =>
      h("section", null,
        h(Middle, { title: "hello" }),
      );
  };

  render(Root, container);

  expect(container.querySelector(".middle")?.textContent).toBe("helloleaf-hello");

  container.remove();
});
