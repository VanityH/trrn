/**
 * vanity-h 语法展示页面（唯一使用 vanity-h 的页面）
 * 保持 function 关键字 + 解构风格
 */
import type { Ctx, RenderFn } from "trrn";
import createVanity from "vanity-h";
import { h } from "trrn";

const v = createVanity(h);
const { div, span, button, h2, p, pre, section } = v;

export function VanityPage(_: undefined, { update }: Ctx): RenderFn {
  let count = 0;

  return () =>
    div.class("vanity-demo")(
      h2("vanity-h Syntax"),

      p.style("color: #666; font-size: 14px;")(
        "This page uses vanity-h chainable DSL instead of JSX. ",
        "All other pages use TSX. Compare the syntax differences.",
      ),

      section.style("margin-top: 16px;")(
        h2.style("font-size: 16px;")("Counter (vanity-h)"),

        div.class("counter")(
          span.style("font-size: 24px; margin-right: 12px;")(String(count)),

          button
            .style(
              "padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px;",
            )
            .onClick(() => { count++; update(); })("+"),

          button
            .style(
              "padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;",
            )
            .onClick(() => { count--; update(); })("-"),
        ),
      ),

      section.style("margin-top: 24px;")(
        h2.style("font-size: 16px;")("Syntax Comparison"),

        pre.style(
          "background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto;",
        )(
          `// TSX (used in other pages):
<div class="counter">
  <span>{count}</span>
  <button onClick={() => { count++; update(); }}>+</button>
</div>

// vanity-h chainable DSL (this page):
div.class("counter")(
  span(String(count)),
  button.onClick(() => { count++; update(); })("+"),
)

// Raw h() calls:
h("div", { class: "counter" },
  h("span", null, String(count)),
  h("button", { onClick: () => { count++; update(); } }, "+"),
)`,
        ),
      ),
    );
}
