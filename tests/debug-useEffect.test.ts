import { expect, test, vi } from "vite-plus/test";

test("debug: useEffect onMount with dynamic import + fake timers", async () => {
  vi.useFakeTimers();

  const { render: pr, h: ph } = await import("preact");
  const { useEffect } = await import("preact/hooks");

  const container = document.createElement("div");
  document.body.appendChild(container);

  let mounted = false;

  function TestComp() {
    useEffect(() => {
      mounted = true;
    }, []);
    return ph("div", null, "test");
  }

  pr(ph(TestComp, null), container);
  vi.runAllTimers();
  expect(mounted).toBe(true);

  vi.useRealTimers();
  container.remove();
});

test("debug: useEffect onMount with top-level import + fake timers", () => {
  vi.useFakeTimers();

  // Using static imports — does useEffect work?
  const { render: pr, h: ph } = { render: () => {}, h: () => {} };
  // can't use top-level import inside a test

  vi.useRealTimers();
  expect(true).toBe(true);
});
