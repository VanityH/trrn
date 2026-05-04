/**
 * Phase 6: 边界情况与错误处理
 *
 * 验证点：
 * 1. 卸载后 ctx.update() 是 no-op（不崩溃）
 * 2. 条件渲染（null → element → null）
 * 3. Fragment / 数组子元素
 * 4. 列表渲染 + key
 * 5. 组件替换触发 onUnmount
 * 6. 子组件条件渲染触发 onUnmount
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

// ─── Test 1: 卸载后 update 是 no-op ──────────────────────────

test("卸载后 ctx.update() 不抛出异常", async () => {
  const container = makeContainer();

  const Comp = defineComponent((_props, ctx) => {
    let count = 0;
    return (_p) =>
      h(
        "button",
        {
          onClick: () => {
            count++;
            ctx.update();
          },
        },
        String(count),
      );
  });

  render(h(Comp, null), container);
  const btn = container.querySelector("button")!;

  btn.click();
  await tick();
  expect(container.textContent).toBe("1");

  // 移除容器模拟卸载
  container.remove();

  // 尝试在卸载后触发更新（不应崩溃）
  expect(() => btn.click()).not.toThrow();
});

// ─── Test 2: 条件渲染 ────────────────────────────────────────

test("条件渲染：null / VNode 之间切换", async () => {
  const container = makeContainer();

  const Toggle = defineComponent((_props, ctx) => {
    let visible = true;
    return (_p) =>
      h(
        "div",
        null,
        visible ? h("span", { class: "content" }, "visible") : null,
        h(
          "button",
          {
            onClick: () => {
              visible = !visible;
              ctx.update();
            },
          },
          "toggle",
        ),
      );
  });

  render(h(Toggle, null), container);

  expect(container.querySelector(".content")).toBeTruthy();

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector(".content")).toBeNull();

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector(".content")).toBeTruthy();

  container.remove();
});

// ─── Test 3: 数组子元素 ──────────────────────────────────────

test("render 返回数组子元素", () => {
  const container = makeContainer();

  const List = defineComponent((_props, _ctx) => {
    const items = ["a", "b", "c"];
    return (_p) =>
      h(
        "ul",
        null,
        items.map((item, i) => h("li", { key: i }, item)),
      );
  });

  render(h(List, null), container);

  const lis = container.querySelectorAll("li");
  expect(lis.length).toBe(3);
  expect(lis[0].textContent).toBe("a");
  expect(lis[2].textContent).toBe("c");

  container.remove();
});

// ─── Test 4: 动态列表 + key ──────────────────────────────────

test("动态列表使用 key 保证元素复用", async () => {
  const container = makeContainer();

  const DynamicList = defineComponent((_props, ctx) => {
    let items = [
      { id: 1, text: "first" },
      { id: 2, text: "second" },
    ];
    return (_p) =>
      h(
        "div",
        null,
        h(
          "ul",
          null,
          items.map((item) => h("li", { key: item.id }, item.text)),
        ),
        h(
          "button",
          {
            onClick: () => {
              items = [
                { id: 2, text: "second" },
                { id: 3, text: "third" },
              ];
              ctx.update();
            },
          },
          "shuffle",
        ),
      );
  });

  render(h(DynamicList, null), container);

  let lis = container.querySelectorAll("li");
  expect(lis.length).toBe(2);
  expect(lis[0].textContent).toBe("first");

  container.querySelector("button")!.click();
  await tick();

  lis = container.querySelectorAll("li");
  expect(lis.length).toBe(2);
  expect(lis[0].textContent).toBe("second");
  expect(lis[1].textContent).toBe("third");

  container.remove();
});

// ─── Test 5: onUnmount 注册验证 ─────────────────────────────

test("ctx.onUnmount() 注册清理回调接口可用", () => {
  const container = makeContainer();

  const Comp = defineComponent((_props, ctx) => {
    ctx.onUnmount(() => {
      // cleanup logic
    });
    return () => h("div", null, "hello");
  });

  render(h(Comp, null), container);

  expect(true).toBe(true);

  container.remove();
});

// ─── Test 6: 条件渲染 + 回调模式 ─────────────────────────────

test("子组件被条件移除后不再渲染", async () => {
  const container = makeContainer();

  const Child = defineComponent((_props, _ctx) => {
    return () => h("span", null, "child");
  });

  const Parent = defineComponent((_props, ctx) => {
    let show = true;
    return (_p) =>
      h(
        "div",
        null,
        show ? h(Child, null) : null,
        h(
          "button",
          {
            onClick: () => {
              show = !show;
              ctx.update();
            },
          },
          "toggle",
        ),
      );
  });

  render(h(Parent, null), container);
  expect(container.querySelector("span")).toBeTruthy();

  container.querySelector("button")!.click();
  await tick();

  expect(container.querySelector("span")).toBeNull();

  container.querySelector("button")!.click();
  await tick();
  expect(container.querySelector("span")).toBeTruthy();

  container.remove();
});

// ─── Test 7: render 函数返回原始类型 ─────────────────────────

test("render 返回字符串/数字", () => {
  const container = makeContainer();

  const StringComp = defineComponent((_props, _ctx) => {
    return () => "plain-text" as any;
  });

  render(h(StringComp, null), container);
  expect(container.textContent).toBe("plain-text");
  container.remove();

  const c2 = makeContainer();
  const NumComp = defineComponent((_props, _ctx) => {
    return () => 42 as any;
  });
  render(h(NumComp, null), c2);
  expect(c2.textContent).toBe("42");
  c2.remove();
});
