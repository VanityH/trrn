import type { Ctx, RenderFn } from "trrn";
import { Counter } from "../components/Counter.tsx";

export function HomePage(
  _props: Record<string, unknown> | undefined,
  _ctx: Ctx,
): RenderFn {
  return () => (
    <div>
      <h2>Welcome to trrn</h2>
      <p style="color: #666;">
        trrn is a closure-based frontend framework on Preact. No useState, no
        hooks — just functions and closures.
      </p>

      <section style="margin-top: 24px;">
        <h3>Counter Demo</h3>
        <p style="color: #888; font-size: 14px;">
          State is managed by closure variables. The component destructures{" "}
          <code>{`{ update }`}</code> from ctx and uses the{" "}
          <code>function</code> keyword.
        </p>
        <Counter />
        <div style="margin-top: 16px;">
          <Counter initial={100} label="Seconds" />
        </div>
      </section>

      <section style="margin-top: 24px;">
        <h3>Key Concepts</h3>
        <ul style="line-height: 1.8;">
          <li>
            <strong>Closure as state</strong> — outer function runs once,
            closure variables persist across renders
          </li>
          <li>
            <strong>Destructure ctx</strong> —{" "}
            <code>{`{ update, onMount, onUnmount, consume }`}</code>
          </li>
          <li>
            <strong>Explicit updates</strong> — call <code>update()</code> to
            trigger re-render, or <code>update({'newProps'})</code> to pass new
            props
          </li>
          <li>
            <strong>No defineComponent</strong> — components are plain functions
          </li>
          <li>
            <strong>Preact ecosystem</strong> — all Preact components work
            natively
          </li>
        </ul>
      </section>
    </div>
  );
}
