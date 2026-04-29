import type { Component } from "trrn";
import { Counter } from "../components/Counter.tsx";

export const HomePage: Component = (_props, _ctx) => {
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
          The counter below uses <code>action()</code> to auto-update after
          each click. State is managed by closure variables — no useState
          needed.
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
            <strong>Explicit updates</strong> — call <code>ctx.update()</code>{" "}
            to trigger re-render
          </li>
          <li>
            <strong>No defineComponent</strong> — components are plain
            functions
          </li>
          <li>
            <strong>Preact ecosystem</strong> — all Preact components work
            natively
          </li>
        </ul>
      </section>
    </div>
  );
};
