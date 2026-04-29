# Crank.js 组件模式分析与框架设计讨论

## 对话来源

DeepSeek Chat 分享链接: <https://chat.deepseek.com/share/bf59fz733s49mvh7es>

---

## 一、初始问题：Crank.js 介绍

Crank.js 的核心特性：

- 组件是普通函数、异步函数或生成器函数
- 支持通过 `yield` 和 `this.refresh()` 管理状态
- 原生处理异步
- 非响应式设计
- 社区活跃度较低

---

## 二、用户提出的新组件模式

```js
function Comp() {
  return () => <div>hello</div>;
}
```

**核心思想**：外层函数只执行一次（用于持有状态），内部返回一个 `render` 函数用于实际渲染。用户试图探究这种模式是否可以**等量替代** Crank.js 的生成器 + 异步组件模式。

---

## 三、模式对比与深入分析

### 3.1 纠正理解

最初误以为用户想在 Crank.js 框架**内部**使用这种写法替代生成器。用户澄清：这是作为**重新实现类似框架哲学的一种语法思路**。

### 3.2 核心对比

| 维度 | Crank.js 生成器 | 用户的高阶函数模式 |
|------|----------------|-------------------|
| 状态保持 | 生成器闭包 | 外层函数闭包 |
| 更新触发 | `this.refresh()` | 手动调用 `update()` |
| 多阶段逻辑 | 多个 `yield` | 单次 `render` 需条件分支 |
| 清理逻辑 | `finally` 块 | 需外部 `onUnmount` |
| 异步支持 | `async` 组件 | 返回 `async` render 函数 |
| Props 更新 | `for ({...} of this)` | `render(newProps)` |

### 3.3 关于 `for({} of this)` 的讨论

Crank.js 中 `for({} of this)` 用于接收新 props。用户确认 `render` 函数也可以接收参数来实现相同效果，在表达"props 驱动更新"的哲学上是自洽的。

---

## 四、实现路径探讨

### 4.1 基于 Preact 或 Crank.js 进行改造

- **Preact 改造容易**：有 `options` 钩子、扩展机制
- **Crank.js 改造困难**：其运行时深度依赖生成器迭代器

提出的四种改造 Preact 方案：

1. 概念验证
2. 类组件化
3. 选项钩子
4. 重写渲染器

### 4.2 最终方案：不修改源码，封装为上层框架

用户明确：**不动 Preact 源码**，做二次封装或插件，保持 Preact 生态和版本可升级。

实现思路：
- 利用 Preact 的 `options` 钩子拦截 VNode
- 或者使用适配器组件（包装组件）将高阶组件转换为标准 Preact 组件
- 示例基于 `hof` 工厂函数，内部使用类组件的 `forceUpdate` 或函数组件的 `useState`

### 4.3 用户最终定位

- 做一个 **Preact 的上层框架**，语法完全不同于 Preact
- **不修改 Preact 源码**，通过 API 桥接生态
- **不使用类组件**（适配层可用 hooks）
- 可以随时升级 Preact 版本

---

## 五、设计决策梳理与确认

### 已确认的设计点

1. **渲染流程**：外层组件执行一次得到 `render` 函数；首次挂载及每次 `ctx.update()` 调用 `render` 生成新 VNode
2. **VNode 格式**：直接使用 Preact 原生 VNode
3. **适配层**：允许使用 Preact Hooks（如 `useState` 用于强制更新，`useEffect` 用于清理），开源透明
4. **生命周期清理**：通过 `useEffect` 实现 `ctx.onUnmount`
5. **Props 更新**：新 props 作为参数传给 `render` 函数
6. **性能优化**：依赖 Preact 自身 diff，不做额外 memo
7. **错误边界**：希望复用 Preact 的错误边界
8. **生态桥接**：保留 `toPreact` / `fromPreact` 思路

### 待确认的细节

- 首次调用 `render` 时是否传入初始 props
- `ctx.update()` 是否需要接收新 props
- 清理 API 的具体注册形式

---

## 六、对话整体脉络

- 用户从 **Crank.js 的哲学** 出发，提出了一种 **基于闭包 + 显式更新的组件模型**
- 通过对比生成器和异步组件，论证了这种模式在表达力上的等价性（部分场景有差异）
- 明确了实现方向：不侵入 Preact 源码，而是作为独立的上层框架
- 最终聚焦于 **设计决策的自我梳理**，以"提问-确认"方式理清思路
