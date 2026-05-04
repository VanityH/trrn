import type { Ctx } from "trrn";
import { createContext } from "trrn";

const ThemeCtx = createContext("light");
const LangCtx = createContext("en");

function ThemeBlock({ label }: { label: string }, { consume }: Ctx) {
  return () => (
    <div
      style={{
        background: consume(ThemeCtx) === "dark" ? "#1e1e1e" : "#fff",
        color: consume(ThemeCtx) === "dark" ? "#eee" : "#333",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #eee",
        marginTop: "12px",
      }}
    >
      <p>{label}</p>
      <p>
        theme: <strong>{consume(ThemeCtx)}</strong>
      </p>
      <p>
        lang: <strong>{consume(LangCtx)}</strong>
      </p>
    </div>
  );
}

export function ContextPage(_: unknown, { update }: Ctx) {
  let outerTheme = "light";
  let innerTheme = "dark";

  return () => (
    <div>
      <h2>Context API</h2>
      <p style="color: #666; font-size: 14px;">
        createContext + consume + nested Providers + dynamic switching.
      </p>

      <div style="display: flex; gap: 12px; margin: 16px 0;">
        <button
          onClick={() => {
            outerTheme = outerTheme === "light" ? "dark" : "light";
            update();
          }}
          style="padding: 6px 16px; cursor: pointer;"
        >
          Outer: {outerTheme}
        </button>
        <button
          onClick={() => {
            innerTheme = innerTheme === "light" ? "dark" : "light";
            update();
          }}
          style="padding: 6px 16px; cursor: pointer;"
        >
          Inner: {innerTheme}
        </button>
      </div>

      <ThemeCtx.Provider value={outerTheme}>
        <LangCtx.Provider value="zh">
          <div style="padding: 12px; border: 2px solid #6366f1; border-radius: 8px;">
            <p style="font-size: 13px; color: #6366f1;">Outer Provider</p>
            <ThemeCtx.Provider value={innerTheme}>
              <div style="padding: 12px; border: 2px solid #f59e0b; border-radius: 8px; margin-top: 8px;">
                <p style="font-size: 13px; color: #f59e0b;">Inner Provider</p>
                <ThemeBlock label="Inside both" />
              </div>
            </ThemeCtx.Provider>
            <div style="margin-top: 8px;">
              <ThemeBlock label="Outside inner" />
            </div>
          </div>
        </LangCtx.Provider>
      </ThemeCtx.Provider>
    </div>
  );
}
