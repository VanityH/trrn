# Demo 网站规划

> `examples/demo/` — trrn 框架能力展示网站

## 技术栈

- **框架**: trrn（workspace 链接）
- **路由**: `preact-iso` (Router, Route)
- **语法**: TSX 为主，vanity-h 专用页展示
- **构建**: vite-plus (vp dev / vp build)

## 页面结构

```
src/
├── main.ts           — 入口：Router + 全局 Provider
├── app.ts            — 布局：Nav + 内容区
├── pages/
│   ├── home.tsx      — 首页：介绍 + Counter 示例
│   ├── todos.tsx     — Todo 页面：列表 CRUD + 条件渲染
│   ├── async.tsx     — 异步页：fetch 模拟 + loading/error/data
│   ├── context.tsx   — Context 页面：主题切换 + 嵌套 Provider
│   ├── lifecycle.tsx — 生命周期页：onMount/onUnmount + 倒计时
│   ├── vanity.ts     — vanity-h 语法页：原生 h() 对照
│   └── boundary.tsx  — 错误边界页：触发/恢复错误
└── components/
    ├── Counter.tsx   — 通用计数器（带 initial prop）
    ├── TodoItem.tsx  — 单条 todo
    ├── Spinner.tsx   — 加载指示器
    └── Nav.tsx       — 导航栏
```

## 各页面覆盖能力

| 页面 | 验证点 |
|------|--------|
| home | 基础组件 + Counter 复用 + action |
| todos | 列表 + key + 条件渲染 + 表单 + 过滤 |
| async | fetch 模拟 + loading/error/data + onUnmount 取消 |
| context | Provider 嵌套 + 运行时切换 + 多 Context |
| lifecycle | onMount DOM 操作 + onUnmount 清理 + 条件挂载 |
| vanity | 原生 h() vs vanity-h 对照（唯一用 vanity-h 的页面） |
| boundary | 抛出错误 + ErrorBoundary 捕获 + reset 恢复 |

## 验证标准

- [ ] `vp dev` 启动，7 个页面可访问
- [ ] 页面无渲染错误
- [ ] Counter 点击正常
- [ ] Todo 增删改正常
- [ ] 异步页 loading → data 流程
- [ ] 主题切换生效
- [ ] 生命周期倒计时正常
- [ ] vanity-h 语法正常
- [ ] 错误边界捕获 + 恢复
