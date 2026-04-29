import { render, h } from "./index.ts";
import type { Component } from "./index.ts";
import createVanity from "vanity-h";

// createVanity 只能调用一次（会设置 Object.prototype.$）
const {
  div,
  span,
  button,
  h1,
  h2,
  p,
  ul,
  li,
  header,
  main,
  footer,
  section,
  code,
  pre,
  hr,
  input,
} = createVanity(h);

// ── Counter 组件 ──

const Counter: Component<{ initial?: number }> = (props, ctx) => {
  let count = props?.initial ?? 0;

  return (_p) =>
    div.class("counter")(
      h2.class("counter-value")(String(count)),
      div.class("counter-actions")(
        button.class("btn btn-inc").onClick(() => {
          count++;
          ctx.update();
        })("+"),
        button.class("btn btn-dec").onClick(() => {
          count--;
          ctx.update();
        })("-"),
        button.class("btn btn-reset").onClick(() => {
          count = 0;
          ctx.update();
        })("Reset"),
      ),
    );
};

// ── Todo 组件 ──

const TodoList: Component = (_props, ctx) => {
  let todos = [
    { id: 1, text: "了解 trrn 的闭包状态模式", done: true },
    { id: 2, text: "使用 vanity-h 的 $ 调用组件", done: false },
    { id: 3, text: "trrn + vanity-h 协同工作", done: false },
  ];
  let inputText = "";

  const addTodo = () => {
    if (inputText.trim()) {
      todos = [...todos, { id: Date.now(), text: inputText, done: false }];
      inputText = "";
      ctx.update();
    }
  };

  const toggle = (id: number) => {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    ctx.update();
  };

  return (_p) =>
    div.class("todo-section")(
      // 使用 $. 语法调用子组件
      Counter.$.initial(0)(),
      hr(),

      h2("Todo List"),
      div.class("todo-input")(
        input
          .value(inputText)
          .onInput((e: Event) => {
            inputText = (e.target as HTMLInputElement).value;
            ctx.update();
          })
          .onKeyDown((e: KeyboardEvent) => e.key === "Enter" && addTodo())
          .placeholder("Add a todo...")(),
        button.class("btn").onClick(addTodo)("Add"),
      ),
      ul.class("todo-list")(
        ...todos.map((todo) =>
          li.class("todo-item").key(todo.id)(
            span
              .onClick(() => toggle(todo.id))
              .style(
                `cursor: pointer; text-decoration: ${todo.done ? "line-through" : "none"}; color: ${todo.done ? "#aaa" : "#333"}`,
              )(todo.text),
          ),
        ),
      ),
    );
};

// ── App 根组件 ──

const App: Component = (_props, _ctx) => {
  return (_p) =>
    div
      .class("app-container")
      .style("max-width: 640px; margin: 0 auto; padding: 24px; font-family: system-ui, sans-serif")(
      header(
        h1("trrn × Vanity-H Demo"),
        p.style("color: #666")("trrn 闭包组件 + vanity-h 链式 DSL — 无需 JSX，无需 useState"),
      ),

      main(
        // v.x<Props>() 泛型方式调用 Counter，支持类型推断
        section(Counter.$.initial(10)()),

        hr(),

        // $. 方式调用 TodoList（无 props）
        section(TodoList.$()),

        hr(),

        // 演示：$. 带 props 调用 Counter
        section(h2("嵌套 Counter（通过 $. 调用）"), Counter.$.initial(5)()),
      ),

      hr(),

      footer.style("margin-top: 32px; color: #999; font-size: 14px")(
        p(code("trrn"), span(" × "), code("vanity-h"), span(" on "), code("preact")),
        pre.style(
          "background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto",
        )(
          `// trrn 组件模式：
function Counter(_props, ctx) {
  let count = 0;           // 闭包 = 状态
  return (_p) =>
    div.class("counter")(
      button.onClick(() => {
        count++;           // 直接修改
        ctx.update();      // 触发渲染
      })("+"),
      span(String(count)),
    );
}

// vanity-h $. 语法调用组件：
Counter.$.initial(5)()
// 等价于 v.x(Counter).initial(5)()`,
        ),
      ),
    );
};

// ── 挂载 ──

render(App, document.getElementById("app")!);
