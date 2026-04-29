import { Counter } from "../components/Counter.tsx";
import { Pager } from "../components/Pager.tsx";

export function HomePage() {
  return () => (
    <div>
      <h2>Welcome to trrn</h2>
      <p style="color: #666;">
        Closure-based frontend framework on Preact. No useState, no hooks — just
        functions and closures.
      </p>

      <section style="margin-top: 24px;">
        <h3>Counter + update(newProps)</h3>
        <p style="color: #888; font-size: 14px;">
          Click "Set resetTo=100" — calls <code>update({'resetTo: 100'})</code>.
          The render function's <code>props</code> parameter receives the new
          value, shown below the buttons.
        </p>
        <Counter />
      </section>

      <section style="margin-top: 24px;">
        <h3>Pager: update(newProps) in action</h3>
        <p style="color: #888; font-size: 14px;">
          Each page button calls <code>update({'page: n'})</code>. The render
          function's <code>props</code> parameter immediately reflects the new
          page number. This is the core pattern for parent→child data flow
          without prop drilling.
        </p>
        <Pager />
      </section>
    </div>
  );
}
