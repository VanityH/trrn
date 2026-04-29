import type { Component } from "trrn";
import { ErrorBoundary } from "trrn";
import { action } from "trrn";

const Exploding: Component = (_props, _ctx) => {
  return () => {
    throw new Error("This component exploded!");
  };
};

const Safe: Component = (_props, _ctx) => {
  return () => <p>This is a safe component that renders normally.</p>;
};

export const BoundaryPage: Component = (_props, ctx) => {
  let showError = true;

  return (_p) => (
    <div>
      <h2>Error Boundary</h2>
      <p style="color: #666; font-size: 14px;">
        Demonstrates: <code>ErrorBoundary</code> catching render errors, showing
        fallback UI, and <code>reset()</code> to re-mount.
      </p>

      <div style="display: flex; gap: 8px; margin: 16px 0;">
        <button
          onClick={action(ctx, () => {
            showError = !showError;
          })}
          style="padding: 6px 16px; cursor: pointer;"
        >
          {showError ? "Hide" : "Show"} Exploding Component
        </button>
      </div>

      <div style="padding: 16px; border: 1px solid #eee; border-radius: 8px;">
        <ErrorBoundary
          fallback={(err: Error, reset: () => void) => (
            <div style="padding: 16px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;">
              <p style="color: #dc2626; font-weight: bold;">Error Caught</p>
              <p style="color: #666; font-size: 14px;">{err.message}</p>
              <button
                onClick={reset}
                style="padding: 6px 16px; background: #dc2626; color: #fff; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px;"
              >
                Reset
              </button>
            </div>
          )}
        >
          {showError ? <Exploding /> : <Safe />}
        </ErrorBoundary>
      </div>
    </div>
  );
};
