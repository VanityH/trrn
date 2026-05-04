import { render, h } from "preact";
import { App } from "./app.tsx";

render(h(App, null), document.getElementById("app")!);
