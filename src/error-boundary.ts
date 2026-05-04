import { Component } from "preact";
import type { ComponentChildren } from "preact";

// ── Types ─────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => ComponentChildren;
  children?: ComponentChildren;
}

// ── ErrorBoundary ─────────────────────────────────────────────

/**
 * 错误边界组件（Preact class component）。
 * 捕获子组件渲染错误，显示 fallback UI。
 * reset() 可重新挂载出错的子树。
 *
 * 用法：
 *   h(ErrorBoundary, { fallback: (err, reset) => h('div', null, err.message) },
 *     h(RiskyComponent, null),
 *   )
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  componentDidCatch(error: Error): void {
    this.setState({ error });
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ComponentChildren {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.handleReset);
    }
    return this.props.children;
  }
}
