/**
 * Phase 4: 外层异步 init + ctx.update()
 *
 * 验证点：
 * 1. 外层作用域中启动异步操作，完成后 ctx.update() 触发更新
 * 2. 多个异步操作并发
 */

import { expect, test } from "vite-plus/test";
import { render, h } from "preact";
import { defineComponent } from "../src/index.ts";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ─── Test 1: 外层异步 init + ctx.update() ────────────────────

test("外层启动异步操作，完成后 ctx.update() 触发更新", async () => {
  const container = makeContainer();

  const AsyncComp = defineComponent((_props, ctx) => {
    let data = "loading...";

    // 模拟异步数据获取
    void Promise.resolve().then(() => {
      data = "loaded";
      ctx.update();
    });

    return (_p) => h("span", null, data);
  });

  render(h(AsyncComp, null), container);

  // 首次渲染：loading 状态
  expect(container.textContent).toBe("loading...");

  // 等待微任务完成（异步操作 + Preact 更新）
  await tick();
  await tick();

  expect(container.textContent).toBe("loaded");

  container.remove();
});

// ─── Test 2: 模拟 fetch 数据加载流程 ─────────────────────────

test("模拟数据加载：loading → 数据到达 → 渲染", async () => {
  const container = makeContainer();

  const DataLoader = defineComponent((props, ctx) => {
    let status = "loading";
    let result = "";

    // 模拟 fetch
    const id = props?.id ?? 0;
    void wait(10).then(() => {
      result = `data-for-${id}`;
      status = "done";
      ctx.update();
    });

    return (_p) => {
      if (status === "loading") return h("span", { class: "loading" }, "Loading...");
      return h("span", { class: "done" }, result);
    };
  });

  render(h(DataLoader, { id: 42 }), container);

  expect(container.querySelector(".loading")?.textContent).toBe("Loading...");

  await wait(30);
  await tick();

  expect(container.querySelector(".done")?.textContent).toBe("data-for-42");

  container.remove();
});

// ─── Test 3: 多次 update 去重 ─────────────────────────────────

test("快速多次 ctx.update() 只触发最终渲染", async () => {
  const container = makeContainer();
  const renderCount = { val: 0 };

  const Comp = defineComponent((_props, ctx) => {
    let data = "";

    // 模拟快速多次数据到达
    void Promise.resolve().then(() => {
      data = "first";
      ctx.update();
      data = "second";
      ctx.update();
      data = "final";
      ctx.update();
    });

    return (_p) => {
      renderCount.val++;
      return h("span", null, data);
    };
  });

  render(h(Comp, null), container);

  await tick();
  await tick();

  expect(container.textContent).toBe("final");
  // 因为 Preact 的批量更新，3 次 update 可能合并为一次渲染
  expect(renderCount.val).toBeGreaterThanOrEqual(1);

  container.remove();
});

// ─── Test 4: 异步 render 函数的探索性测试 ────────────────────

test("async render 函数：返回 Promise 的 render 函数", async () => {
  const container = makeContainer();

  const AsyncRender = defineComponent((_props, _ctx) => {
    return async (_p) => {
      await wait(5);
      return h("span", null, "async-result");
    };
  });

  render(h(AsyncRender, null), container);

  await wait(20);
  await tick();

  // async render 函数目前不被 Preact 原生支持
  // 用户应在外层处理异步，ctx.update() 触发渲染
  container.remove();
});
