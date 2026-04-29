# trrn API Reference

## 核心

| API                         | 说明           |
| --------------------------- | -------------- |
| [render](./render.md)       | 挂载组件到 DOM |
| [h](./h.md)                 | 创建 VNode     |
| [Component](./component.md) | 组件类型与模式 |
| [ctx](./ctx.md)             | 组件上下文对象 |

## 辅助

| API                                  | 说明                |
| ------------------------------------ | ------------------- |
| [action](./action.md)                | 事件处理自动 update |
| [createContext](./context.md)        | Context 创建与使用  |
| [ErrorBoundary](./error-boundary.md) | 错误捕获            |

## 开发工具

| API                            | 说明                   |
| ------------------------------ | ---------------------- |
| [StrictMode](./strict-mode.md) | 开发模式 double-invoke |
| TRRN_MARKER                    | 显式组件标记           |

## 类型

| 类型                | 说明               |
| ------------------- | ------------------ |
| `Component<P>`      | 组件类型           |
| `Ctx`               | 上下文类型         |
| `RenderFn<P>`       | render 函数类型    |
| `PropsOf<T>`        | 提取组件 Props     |
| `RenderResultOf<T>` | 提取 render 返回值 |
