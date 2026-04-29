/**
 * Phase 2: Props 传递与更新机制验证
 *
 * 验证点：
 * 1. 初始 props 传给外层函数
 * 2. render 函数首次调用收到与外部一致的 props
 * 3. ctx.update(newProps) 传递新 props 给 render 函数
 * 4. 类型参数的泛型推断
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

// ─── Test 1: 初始 props 传入外层 ─────────────────────────────

test("初始 props 传给外层函数", () => {
  const container = makeContainer();
  let outerProps: any;

  const Comp: Component<{ name: string }> = (props, _ctx) => {
    outerProps = props;
    return (_props) => h("div", null, _props?.name as string ?? "none");
  };

  render(Comp, container, { name: "trrn" });

  expect(outerProps).toEqual({ name: "trrn" });
  expect(container.textContent).toBe("trrn");

  container.remove();
});

// ─── Test 2: 无初始 props 时外层收到空对象 ──────────────────

test("无初始 props 时 outer 和 render 均收到空对象", () => {
  const container = makeContainer();
  let outerProps: any;
  let renderProps: any;

  const Comp: Component = (props, _ctx) => {
    outerProps = props;
    return (p) => {
      renderProps = p;
      return h("div", null, "ok");
    };
  };

  render(Comp, container);

  // Preact 标准化 props 为空对象，解构带默认值的行为一致
  expect(outerProps).toEqual({});
  expect(renderProps).toEqual({});
  expect(container.textContent).toBe("ok");

  container.remove();
});

// ─── Test 3: ctx.update 传入新 props ─────────────────────────

test("ctx.update(newProps) 传递新 props 给 render 函数", async () => {
  const container = makeContainer();
  const renderPropsLog: any[] = [];

  const Comp: Component<{ name: string }> = (_props, ctx) => {
    return (p) => {
      renderPropsLog.push(p);
      return h("button", {
        onClick: () => ctx.update({ name: "updated" }),
      }, (p?.name as string) ?? "no-name");
    };
  };

  render(Comp, container, { name: "initial" });

  expect(container.textContent).toBe("initial");
  expect(renderPropsLog).toEqual([{ name: "initial" }]);

  container.querySelector("button")!.click();
  await tick();

  expect(container.textContent).toBe("updated");
  expect(renderPropsLog).toEqual([{ name: "initial" }, { name: "updated" }]);

  container.remove();
});

// ─── Test 4: ctx.update 不传参数则 props 不变 ────────────────

test("ctx.update() 无参数时 props 保持上次的值", async () => {
  const container = makeContainer();
  const renderPropsLog: any[] = [];

  const Comp: Component<{ label: string }> = (props, ctx) => {
    let counter = 0;
    return (p) => {
      renderPropsLog.push({ ...p, counter });
      return h("button", {
        onClick: () => {
          counter++;
          ctx.update(); // 不传 props
        },
      }, `${p?.label ?? "?"}:${counter}`);
    };
  };

  render(Comp, container, { label: "count" });

  expect(container.textContent).toBe("count:0");

  container.querySelector("button")!.click();
  await tick();
  expect(container.textContent).toBe("count:1");
  // props 应该保持为原来的值
  expect(renderPropsLog[1].label).toBe("count");

  container.remove();
});

// ─── Test 5: 带默认参数解构的 props ──────────────────────────

test("外层解构 props 带默认值", () => {
  const container = makeContainer();

  const Comp: Component<{ title?: string; count?: number }> = (p, _ctx) => {
    const { title = "Hello", count = 0 } = p ?? {};
    return (_p) => h("div", null, `${title}:${count}`);
  };

  render(Comp, container, { title: "Hi" });

  // count 使用默认值 0
  expect(container.textContent).toBe("Hi:0");

  container.remove();
});
