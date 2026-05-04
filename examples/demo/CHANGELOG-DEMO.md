# Demo 升级记录

## 目标

将现有 trrn 技术特性演示页面改造成一个更复杂的、模拟真实应用的 Demo，包含公共网站和管理后台。

## 最终文件结构

```
examples/demo/src/
├── main.tsx                   — 入口
├── app.tsx                    — 路由外壳（站点/后台自动切换 + 404）
├── style.css                  — 全局样式
├── mock/
│   ├── types.ts               — 领域类型（User, Product, Order, DashboardStats）
│   ├── data.ts                — 初始数据（8 用户, 10 产品, 8 订单）
│   └── api.ts                 — Mock API（CRUD + 模拟延迟 200-600ms）
├── contexts/
│   └── AuthContext.tsx         — 认证 Context
├── components/
│   ├── ui/
│   │   ├── Button.tsx         — 通用按钮（primary/secondary/danger/ghost + sm/md/lg）
│   │   ├── Card.tsx           — 卡片（title + content + footer 三段式）
│   │   ├── Table.tsx          — 数据表格（泛型 Column + 空状态）
│   │   ├── Modal.tsx          — 模态弹窗（遮罩层 + title + content）
│   │   ├── Badge.tsx          — 状态标签（5 种颜色变体）
│   │   └── FormField.tsx      — 表单字段（label + error + children）
│   └── layout/
│       ├── SiteLayout.tsx     — 公共网站布局（导航栏 + 内容区 + 页脚）
│       └── AdminLayout.tsx    — 管理后台布局（深色侧边栏 + 顶栏 + 内容区）
├── pages/
│   ├── site/
│   │   ├── Home.tsx           — 营销首页（Hero + 特性预览 + 交互计数器）
│   │   ├── Features.tsx       — 功能列表（5 组 16 个特性卡片）
│   │   ├── Pricing.tsx        — 定价方案（3 个方案 + 年付/月付切换）
│   │   ├── About.tsx          — 关于（设计理念 + 技术栈 + 代码示例）
│   │   └── Contact.tsx        — 联系表单（验证 + 提交 + 成功状态）
│   └── admin/
│       ├── Dashboard.tsx      — 仪表盘（6 个统计卡片 + 最近订单表）
│       ├── Users.tsx          — 用户管理（表格 CRUD + Modal 表单）
│       ├── Products.tsx       — 产品管理（表格 CRUD + 状态筛选）
│       ├── Orders.tsx         — 订单管理（卡片列表 + 状态筛选 + 详情 Modal）
│       └── Settings.tsx       — 设置（个人信息 + 通知偏好 + 主题切换）
```

## 新建/修改文件统计

- 新建 20 个文件
- 保留并修改 4 个文件（app.tsx, main.tsx, index.html, style.css）
- 保留原有 demo 组件（Counter, Pager, Nav, Spinner, TodoItem）

---

## 问题记录

### 1. TypeScript 类型约束 — Record<string, unknown> 泛型不匹配

- **问题**: Table 组件使用 `T extends Record<string, unknown>` 泛型约束，但 User/Product 等具体类型没有索引签名，TS 报类型不兼容。
- **解决**: 将约束改为 `T extends { id?: unknown }`，仅要求最小的通用结构，兼容所有具体类型。

### 2. verbatimModuleSyntax 要求 type-only import

- **问题**: `import { Column, Table }` 中 Column 是类型，`verbatimModuleSyntax: true` 要求使用 `import type`。
- **解决**: 拆分为 `import type { Column }` 和 `import { Table }`。

### 3. typescript-eslint(unbound-method) 假阳性警告

- **问题**: 所有在函数签名中解构 Ctx 方法（`{ update }: Ctx`）的地方都触发 `unbound-method` 警告。这些方法通过闭包实现，不依赖 `this`。
- **状态**: 标记为已知假阳性，共计 27 条 warning，0 error。在构建产物和运行时无影响。
- **尝试解决**: 创建 `.oxlintrc.json` 尝试抑制，但 oxlint 通过 vite-plus 调用时配置可能未生效。

### 4. vp check --fix 自动格式化 29 个文件

- 格式化问题已自动修复（oxfmt），包括新老文件。

### 5. HomePage 计数器缺少 ctx.update()

- **问题**: 营销首页的交互式计数器按钮只修改了闭包变量 `counter`，没有调用 `ctx.update()` 触发重渲染。
- **解决**: 将 `_ctx` 改为 `{ update }` 并在三个按钮的 onClick 中加入 `update()` 调用。

### 6. 未使用变量（nextOrderId）

- **问题**: mock/api.ts 中定义了 `nextOrderId` 但未使用。
- **解决**: 删除未使用的变量。

---

## 验证结果

- ✅ `vp dev` — 启动成功，所有源文件 200
- ✅ `vp check` — 0 errors（27 warnings 均为假阳性）
- ✅ 核心框架测试 — 45 tests passed（9 files）
