# trrn 架构设计

## 核心理念

- **无 `defineComponent`**：组件就是普通函数，不需要工厂函数包装
- **闭包即状态**：外层函数执行一次，闭包持有全部状态
- **返回 render 函数**：每次渲染调用 render 函数生成 VNode
- **基于 Preact**：适配层桥接到 Preact 运行时，不修改 Preact 源码

## 用户组件形态

```ts
function Comp(props, ctx) {
  // === 初始化区 ===
  // 这里的代码只执行一次
  // 闭包变量天然就是"状态"，不需要 useState
  let count = 0;

  ctx.onUnmount(() => {
    console.log('cleanup');
  });

  // === 返回 render 函数 ===
  return (props) => {
    // 每次渲染都执行（包括首次）
    // props 首次与外部参数一致
    return h('div', null,
      h('span', null, String(count)),
      h('button', {
        onClick: () => {
          count++;
          ctx.update(); // 触发重渲染
        }
      }, '+')
    );
  };
}
```

## 框架 API

### `render(Comp, container, initialProps?)`

入口函数，将组件挂载到 DOM。

```
render(Counter, document.getElementById('app'));
```

### `h(type, props, ...children)`

封装 Preact 的 `h`，创建 VNode。第一阶段直接透传。

### `ctx` 对象

| 方法 | 说明 |
|------|------|
| `ctx.update(newProps?)` | 触发重渲染，可选传递新 props |
| `ctx.onUnmount(fn)` | 注册卸载时的清理回调 |

## 内部适配原理

```
render(Comp, container)
  │
  ▼
创建内部 Preact FunctionComponent (Adapter)
  │
  ├── useRef 持有: renderFn, propsRef, cleanupRef
  ├── useState 提供 forceUpdate（ctx.update 触发）
  ├── useEffect 注册清理（ctx.onUnmount 收集的回调）
  │
  ├── 首次渲染: renderFn = Comp(initialProps, ctx)
  ├── 每次渲染: renderFn(currentProps) → VNode
  │
  ▼
preact.render(h(Adapter, null), container)
```

## Phase 探索路线

| Phase | 目标 | 关键验证点 |
|-------|------|-----------|
| 1 | 最简可行性 | render + update + onUnmount |
| 2 | Props 传递 | 首次 props、update 传新 props |
| 3 | 组件嵌套 | 一个组件引用另一个组件 |
| 4 | 异步 render | async render 函数 |
| 5 | 封装 h | 事件处理增强、自动类型推断 |
| 6 | 边界情况 | 错误、重复 update、卸载后 update |
| 7 | 总结 | 可行性结论 + 后续设计建议 |

## 计划修正策略

- 每个 Phase 完成后评估：API 是否自然？是否有未预见的限制？
- 遇到 Preact 限制时：优先探索 `options` 钩子，其次考虑内部架构调整
- 保持每个 Phase 可独立运行和测试
- 发现更好的模式时回写更新本文档
