import type { Ctx, RenderFn } from "trrn";
import { Nav } from "./components/Nav.tsx";
import { HomePage } from "./pages/home.tsx";
import { TodosPage } from "./pages/todos.tsx";
import { AsyncPage } from "./pages/async.tsx";
import { ContextPage } from "./pages/context.tsx";
import { LifecyclePage } from "./pages/lifecycle.tsx";
import { VanityPage } from "./pages/vanity.ts";
import { BoundaryPage } from "./pages/boundary.tsx";

const routes: { path: string; Page: (...args: any[]) => RenderFn }[] = [
  { path: "/", Page: HomePage },
  { path: "/todos", Page: TodosPage },
  { path: "/async", Page: AsyncPage },
  { path: "/context", Page: ContextPage },
  { path: "/lifecycle", Page: LifecyclePage },
  { path: "/vanity", Page: VanityPage },
  { path: "/boundary", Page: BoundaryPage },
];

export function App(
  _props: Record<string, unknown> | undefined,
  _ctx: Ctx,
): RenderFn {
  return () => {
    const path = typeof location !== "undefined" ? location.pathname : "/";
    const match = routes.find((r) => r.path === path);
    const Page = match?.Page ?? HomePage;

    return (
      <div style="max-width: 720px; margin: 0 auto; padding: 24px; font-family: system-ui, sans-serif;">
        <h1>trrn Demo</h1>
        <Nav />
        <main>
          <Page />
        </main>
      </div>
    );
  };
}
