import type { Ctx } from "trrn";
import createVanity from "vanity-h";
import { h } from "trrn";

const { div, span, button, h2, p, pre } = createVanity(h);

export function VanityPage(_: unknown, { update }: Ctx) {
  let count = 0;

  return () =>
    div.class("vanity-demo")(
      h2("vanity-h Syntax (non-JSX page)"),
      p.style("color: #666; font-size: 14px;")(
        "This page uses vanity-h chainable DSL. All other pages use TSX.",
      ),
      div.class("counter")(
        span.style("font-size: 24px; margin-right: 12px;")(String(count)),
        button
          .style("padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; margin-right: 6px;")
          .onClick(() => { count++; update(); })("+"),
        button
          .style("padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;")
          .onClick(() => { count--; update(); })("-"),
      ),
      pre.style(
        "background: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto; margin-top: 24px;",
      )(
        "// TSX:         <div class=\"x\">{count}</div>\n" +
        "// vanity-h:    div.class(\"x\")(String(count))\n" +
        "// raw h():     h(\"div\", { class: \"x\" }, String(count))",
      ),
    );
}
