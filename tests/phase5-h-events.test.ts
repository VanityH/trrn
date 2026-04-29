/**
 * Phase 5: 封装 h 函数与事件处理探索
 *
 * 验证点：
 * 1. 事件处理正确（onClick, onInput, onSubmit 等）
 * 2. 事件对象行为正常
 * 3. 探索 action() 辅助函数减少 ctx.update() 样板代码
 * 4. ref 访问 DOM 元素
 */

import { expect, test } from "vite-plus/test";
import { render, h } from "../src/index.ts";
import type { Component, Ctx } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ─── Helper: action ───────────────────────────────────────────

/**
 * 包装事件处理器，执行后自动调用 ctx.update()。
 * 这是一个探索性的 API，减少样板代码。
 */
function action<P extends unknown[]>(ctx: Ctx, fn: (...args: P) => void): (...args: P) => void {
  return (...args: P) => {
    fn(...args);
    ctx.update();
  };
}

// ─── Test 1: onClick 事件 ─────────────────────────────────────

test("onClick 事件正常工作", async () => {
  const container = makeContainer();

  const Comp: Component = (_props, ctx) => {
    let clicked = false;
    return (_p) =>
      h(
        "button",
        {
          onClick: () => {
            clicked = true;
            ctx.update();
          },
        },
        clicked ? "clicked" : "click me",
      );
  };

  render(Comp, container);
  expect(container.textContent).toBe("click me");

  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("clicked");

  container.remove();
});

// ─── Test 2: onInput 事件 ────────────────────────────────────

test("onInput 事件：受控输入模式", async () => {
  const container = makeContainer();

  const InputComp: Component = (_props, ctx) => {
    let value = "";
    return (_p) =>
      h("input", {
        value,
        onInput: (e: Event) => {
          value = (e.target as HTMLInputElement).value;
          ctx.update();
        },
      });
  };

  render(InputComp, container);
  const input = container.querySelector("input")!;
  expect(input.value).toBe("");

  // 模拟输入
  (input as HTMLInputElement).value = "hello";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
  expect(input.value).toBe("hello");

  container.remove();
});

// ─── Test 3: 表单提交 ────────────────────────────────────────

test("onSubmit 事件：表单提交处理", async () => {
  const container = makeContainer();

  const FormComp: Component = (_props, ctx) => {
    let submitted = false;
    let value = "";

    const handleSubmit = (e: Event) => {
      e.preventDefault();
      submitted = true;
      ctx.update();
    };

    return (_p) =>
      h(
        "form",
        {
          onSubmit: handleSubmit,
        },
        submitted
          ? h("span", null, "submitted")
          : h("input", {
              value,
              onInput: (e: Event) => {
                value = (e.target as HTMLInputElement).value;
              },
            }),
      );
  };

  render(FormComp, container);

  expect(container.querySelector("form")).toBeTruthy();
  expect(container.querySelector("span")).toBeNull();

  container
    .querySelector("form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await tick();

  expect(container.querySelector("span")?.textContent).toBe("submitted");

  container.remove();
});

// ─── Test 4: action() 辅助函数 ───────────────────────────────

test("action() 包装事件处理器，执行后自动更新", async () => {
  const container = makeContainer();

  const Counter: Component = (_props, ctx) => {
    let count = 0;
    return (_p) =>
      h(
        "button",
        {
          onClick: action(ctx, () => {
            count++;
          }),
        },
        String(count),
      );
  };

  render(Counter, container);
  expect(container.textContent).toBe("0");

  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("1");

  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("2");

  container.remove();
});

// ─── Test 5: action() 处理多个状态变更 ──────────────────────

test("action() 在一次事件中修改多个变量然后统一更新", async () => {
  const container = makeContainer();

  const Comp: Component = (_props, ctx) => {
    let a = 0;
    let b = 0;
    return (_p) =>
      h(
        "div",
        null,
        h("span", { class: "sum" }, String(a + b)),
        h(
          "button",
          {
            onClick: action(ctx, () => {
              a++;
              b += 2;
            }),
          },
          "inc",
        ),
      );
  };

  render(Comp, container);

  expect(container.querySelector(".sum")?.textContent).toBe("0");

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector(".sum")?.textContent).toBe("3");

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector(".sum")?.textContent).toBe("6");

  container.remove();
});

// ─── Test 6: DOM ref 访问 ────────────────────────────────────

test("通过回调 ref 访问 DOM 元素", () => {
  const container = makeContainer();
  let elRef: HTMLElement | null = null;

  const setRef = (el: HTMLElement | null) => {
    elRef = el;
  };

  const Comp: Component = (_props, _ctx) => {
    return (_p) => h("div", { ref: setRef as any }, "ref-test");
  };

  render(Comp, container);

  expect(elRef).toBeTruthy();
  const el = elRef!;
  expect(el.textContent).toBe("ref-test");

  container.remove();
});
