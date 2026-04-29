/**
 * Phase 1: 最简可行性验证
 *
 * 验证点：
 * 1. render 挂载组件到 DOM
 * 2. 外层函数只执行一次，闭包持有状态
 * 3. ctx.update() 触发重渲染 (Preact 异步，需 flush microtask)
 * 4. ctx.onUnmount() 注册清理回调
 */

import { expect, test, vi } from "vite-plus/test";
import { render, h } from "../src/index.ts";
import type { Component } from "../src/index.ts";

// Preact 状态更新通过 queueMicrotask，测试中需要 flush
const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function makeContainer(): HTMLElement {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return el;
}

// ─── Test 1: 基础挂载 ────────────────────────────────────────

test("基础挂载：外层执行一次，render 执行首次渲染", () => {
  const container = makeContainer();
  const outerSpy = vi.fn();
  const renderSpy = vi.fn();

  const Counter: Component = (_props, _ctx) => {
    outerSpy();
    let count = 0;

    return (_props) => {
      renderSpy();
      return h("div", null, String(count));
    };
  };

  render(Counter, container);

  expect(outerSpy).toHaveBeenCalledTimes(1);
  expect(renderSpy).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe("0");

  container.remove();
});

// ─── Test 2: ctx.update 触发重渲染 ──────────────────────────

test("ctx.update() 触发重渲染，闭包状态保持", async () => {
  const container = makeContainer();
  const outerSpy = vi.fn();
  const renderCalls: number[] = [];

  const Counter: Component = (_props, ctx) => {
    outerSpy();
    let count = 0;

    return (_props) => {
      renderCalls.push(count);
      return h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        String(count),
      );
    };
  };

  render(Counter, container);

  expect(outerSpy).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe("0");

  // 点击第 1 次
  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("1");
  expect(outerSpy).toHaveBeenCalledTimes(1);

  // 点击第 2 次
  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("2");
  expect(outerSpy).toHaveBeenCalledTimes(1);

  // render 函数被调用了 3 次（首次 + 2 次更新）
  // count++ 在 ctx.update() 之前，render 看到的是已更新的值
  expect(renderCalls).toEqual([0, 1, 2]);

  container.remove();
});

// ─── Test 3: 连续多次 update ─────────────────────────────────

test("连续多次 ctx.update()，最终状态正确", async () => {
  const container = makeContainer();

  const Counter: Component = (_props, ctx) => {
    let count = 0;
    return (_props) => {
      return h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
            count++;
            ctx.update();
          },
        },
        String(count),
      );
    };
  };

  render(Counter, container);
  expect(container.textContent).toBe("0");

  container.querySelector("button")!.click();
  await tick();
  // 闭包中 count 已经是 2，DOM 展示最终值
  expect(container.textContent).toBe("2");

  container.remove();
});

// ─── Test 4: 多个独立实例 ────────────────────────────────────

test("多个组件实例的状态彼此独立", async () => {
  const c1 = makeContainer();
  const c2 = makeContainer();

  const Counter: Component = (_props, ctx) => {
    let count = 0;
    return (_props) => {
      return h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        String(count),
      );
    };
  };

  render(Counter, c1);
  render(Counter, c2);

  expect(c1.textContent).toBe("0");
  expect(c2.textContent).toBe("0");

  c1.querySelector("button")!.click();
  await tick();

  expect(c1.textContent).toBe("1");
  expect(c2.textContent).toBe("0");

  c1.remove();
  c2.remove();
});
