/**
 * Phase 7: action() + ctx.onMount() / ctx.onUnmount() 测试
 * 注：Preact useEffect 通过 RAF + setTimeout(35ms) 调度，测试需等待 >50ms
 */
import { expect, test, vi } from "vite-plus/test";
import { render as preactRender, h as preactH } from "preact";
import { render, h, action } from "../src/index.ts";
import type { Component } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const waitEffects = () => new Promise<void>((r) => setTimeout(r, 60));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ── action() tests ────────────────────────────────────────────

test("action(ctx, fn) 执行后自动调用 ctx.update()", async () => {
  const container = makeContainer();

  const Comp: Component = (_props, ctx) => {
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

  render(Comp, container);
  expect(container.textContent).toBe("0");

  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("1");
  container.remove();
});

test("action(ctx, fn) 转发事件参数", async () => {
  const container = makeContainer();
  let captured: any;

  const Comp: Component = (_props, ctx) => {
    return (_p) =>
      h(
        "button",
        {
          onClick: action(ctx, (e: MouseEvent) => {
            captured = e.type;
          }),
        },
        "click",
      );
  };

  render(Comp, container);
  container.querySelector("button")!.click();
  await tick();
  expect(captured).toBe("click");
  container.remove();
});

test("action(ctx, fn) 在修改多个状态后一次更新", async () => {
  const container = makeContainer();

  const Comp: Component = (_props, ctx) => {
    let a = 0;
    let b = 0;
    return (_p) =>
      h(
        "div",
        null,
        h("span", null, String(a + b)),
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
  expect(container.querySelector("span")?.textContent).toBe("0");

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector("span")?.textContent).toBe("3");
  container.remove();
});

// ── ctx.onMount() tests ───────────────────────────────────────

test("ctx.onMount() 在首帧渲染后调用", async () => {
  const container = makeContainer();
  const onMountSpy = vi.fn();

  const Comp: Component = (_props, ctx) => {
    ctx.onMount(onMountSpy);
    return () => h("div", null, "mounted");
  };

  render(Comp, container);
  expect(container.textContent).toBe("mounted");

  await waitEffects();
  expect(onMountSpy).toHaveBeenCalledTimes(1);
  container.remove();
});

test("ctx.onMount() 可以访问 DOM", async () => {
  const container = makeContainer();
  let domText = "";

  const Comp: Component = (_props, ctx) => {
    ctx.onMount(() => {
      const el = document.querySelector("[data-mounted]");
      if (el) domText = el.textContent ?? "";
    });
    return () => h("div", { "data-mounted": "" }, "hello-dom");
  };

  render(Comp, container);
  await waitEffects();
  expect(domText).toBe("hello-dom");
  container.remove();
});

test("多个 ctx.onMount() 回调依次执行", async () => {
  const calls: string[] = [];

  const Comp: Component = (_props, ctx) => {
    ctx.onMount(() => calls.push("a"));
    ctx.onMount(() => calls.push("b"));
    return () => h("div", null, "ok");
  };

  const c = makeContainer();
  render(Comp, c);
  await waitEffects();
  expect(calls).toEqual(["a", "b"]);
  c.remove();
});

// ── ctx.onUnmount() tests ─────────────────────────────────────

test("ctx.onUnmount() 在组件替换时触发", async () => {
  const container = makeContainer();
  const cleanupFn = vi.fn();

  const Comp: Component = (_props, ctx) => {
    ctx.onUnmount(cleanupFn);
    return () => h("div", null, "hello");
  };

  render(Comp, container);
  await waitEffects();
  expect(cleanupFn).not.toHaveBeenCalled();

  function Other() {
    return preactH("div", null, "other");
  }
  preactRender(preactH(Other, null), container);
  await waitEffects();

  expect(cleanupFn).toHaveBeenCalledTimes(1);
  container.remove();
});
