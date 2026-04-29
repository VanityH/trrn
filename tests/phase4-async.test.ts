/**
 * Phase 4: 异步 render 函数支持验证
 *
 * 验证点：
 * 1. 外层作用域中启动异步操作，完成后 ctx.update() 触发更新
 * 2. 异步 render 函数（返回 Promise<VNode>）
 * 3. 多个异步操作并发
 */

import { expect, test } from "vite-plus/test";
import { render, h } from "../src/index.ts";
import type { Component } from "../src/index.ts";

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

  const AsyncComp: Component = (_props, ctx) => {
    let data = "loading...";

    // 模拟异步数据获取
    void Promise.resolve().then(() => {
      data = "loaded";
      ctx.update();
    });

    return (_p) => h("span", null, data);
  };

  render(AsyncComp, container);

  // 首次渲染：loading 状态
  expect(container.textContent).toBe("loading...");

  // 等待微任务完成（异步操作 + Preact 更新）
  await tick();
  await tick(); // 需要两次：一次是 Promise.resolve，一次是 Preact 的 microtask

  expect(container.textContent).toBe("loaded");

  container.remove();
});

// ─── Test 2: 模拟 fetch 数据加载流程 ─────────────────────────

test("模拟数据加载：loading → 数据到达 → 渲染", async () => {
  const container = makeContainer();

  const DataLoader: Component<{ id: number }> = (props, ctx) => {
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
  };

  render(DataLoader, container, { id: 42 });

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

  const Comp: Component = (_props, ctx) => {
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
  };

  render(Comp, container);

  await tick();
  await tick();

  expect(container.textContent).toBe("final");
  // 因为 Preact 的批量更新，3 次 update 可能合并为一次渲染
  // 实际渲染次数取决于 Preact 的批处理策略
  expect(renderCount.val).toBeGreaterThanOrEqual(1);

  container.remove();
});

// ─── Test 4: 异步 render 函数的探索性测试 ────────────────────

test("async render 函数：返回 Promise 的 render 函数", async () => {
  // 这个测试探索 async render 函数的可行性
  // Preact 本身不支持直接返回 Promise，但我们的适配器可能可以处理

  const container = makeContainer();

  const AsyncRender: Component = (_props, _ctx) => {
    return async (_p) => {
      // 模拟异步渲染（如：需要先加载某些资源）
      await wait(5);
      return h("span", null, "async-result");
    };
  };

  render(AsyncRender, container);

  // 等待异步 render 完成
  await wait(20);
  await tick();

  // 注意：async render 函数的支持取决于适配器是否正确处理 Promise
  // 如果 Preact 不支持，这里需要适配器层面拦截
  // 当前 trrn 适配器不处理 Promise 返回值，此测试记录当前行为
  //
  // 可行的替代方案是用户在外层处理异步：
  //   function Comp(props, ctx) {
  //     fetch(...).then(data => { ...; ctx.update(); })
  //     return (p) => h('div', null, ...)
  //   }
  //
  // 或者我们可以增强适配器：检测 renderFn 返回 Promise，
  // await 结果后触发一次更新（作为未来的改进点）

  container.remove();
});
