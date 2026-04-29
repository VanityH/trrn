import type { Component } from "trrn";

const links = [
  { href: "/", label: "Home" },
  { href: "/todos", label: "Todos" },
  { href: "/async", label: "Async" },
  { href: "/context", label: "Context" },
  { href: "/lifecycle", label: "Lifecycle" },
  { href: "/vanity", label: "Vanity-H" },
  { href: "/boundary", label: "Boundary" },
];

export const Nav: Component = (_props, _ctx) => {
  return () => (
    <nav style="display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #eee; margin-bottom: 24px; flex-wrap: wrap;">
      {links.map((l) => (
        <a href={l.href} style="color: #6366f1; text-decoration: none;">
          {l.label}
        </a>
      ))}
    </nav>
  );
};
