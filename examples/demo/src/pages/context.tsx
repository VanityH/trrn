import type { Component } from "trrn";
import { createContext, action } from "trrn";

const ThemeCtx = createContext("light");
const LangCtx = createContext("en");

const ThemeSwitcher: Component = (_props, ctx) => {
  let theme = "light";

  return (_p) => (
    <div
      style={{
        background: ctx.consume(ThemeCtx) === "dark" ? "#1e1e1e" : "#fff",
        color: ctx.consume(ThemeCtx) === "dark" ? "#eee" : "#333",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #eee",
        marginTop: "12px",
      }}
    >
      <p>
        Current theme: <strong>{ctx.consume(ThemeCtx)}</strong>
      </p>
      <p>
        Current language: <strong>{ctx.consume(LangCtx)}</strong>
      </p>
      <button
        onClick={action(ctx, () => {
          theme = theme === "light" ? "dark" : "light";
        })}
        style="padding: 6px 16px; cursor: pointer;"
      >
        Toggle Theme
      </button>
    </div>
  );
};

export const ContextPage: Component = (_props, ctx) => {
  let outerTheme = "light";
  let innerTheme = "dark";

  return (_p) => (
    <div>
      <h2>Context API</h2>
      <p style="color: #666; font-size: 14px;">
        Demonstrates: <code>createContext</code>, <code>ctx.consume</code>,
        nested Providers, dynamic value switching.
      </p>

      <div style="display: flex; gap: 12px; margin: 16px 0;">
        <button
          onClick={action(ctx, () => {
            outerTheme = outerTheme === "light" ? "dark" : "light";
          })}
          style="padding: 6px 16px; cursor: pointer;"
        >
          Toggle Outer: {outerTheme}
        </button>
        <button
          onClick={action(ctx, () => {
            innerTheme = innerTheme === "light" ? "dark" : "light";
          })}
          style="padding: 6px 16px; cursor: pointer;"
        >
          Toggle Inner: {innerTheme}
        </button>
      </div>

      <ThemeCtx.Provider value={outerTheme}>
        <LangCtx.Provider value="zh">
          <div style="padding: 12px; border: 2px solid #6366f1; border-radius: 8px;">
            <p style="font-size: 13px; color: #6366f1;">Outer Provider (theme={outerTheme}, lang=zh)</p>
            <ThemeCtx.Provider value={innerTheme}>
              <div style="padding: 12px; border: 2px solid #f59e0b; border-radius: 8px; margin-top: 8px;">
                <p style="font-size: 13px; color: #f59e0b;">Inner Provider (theme={innerTheme})</p>
                <ThemeSwitcher />
              </div>
            </ThemeCtx.Provider>
            <div style="margin-top: 8px;">
              <ThemeSwitcher />
            </div>
          </div>
        </LangCtx.Provider>
      </ThemeCtx.Provider>
    </div>
  );
};
