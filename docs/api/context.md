# createContext()

```ts
function createContext<T>(defaultValue: T): Context<T>;

interface Context<T> {
  Provider: Component<{ value: T }>;
  defaultValue: T;
}
```

创建 Context，用于跨组件层级传递数据（主题、语言、用户信息等）。

## 基本用法

### 创建

```ts
const ThemeCtx = createContext("light");
```

### 提供值

```ts
// 通过 h()
h(ThemeCtx.Provider, { value: "dark" }, h(Child, null));

// 或通过 vanity-h（详见 vanity-h 使用指南）
```

### 消费值

```ts
function Themed(_props, ctx) {
  return (_p) => {
    const theme = ctx.consume(ThemeCtx);
    return h("div", { class: theme }, "themed content");
  };
}
```

## 嵌套 Provider

```ts
const Outer = createContext("outer-default");
const Inner = createContext("inner-default");

h(
  Outer.Provider,
  { value: "outer-A" },
  h(
    Inner.Provider,
    { value: "inner-B" },
    h(Child, null), // consume Outer → "outer-A", Inner → "inner-B"
  ),
);
```

## 注意

- 无 Provider 包裹时，`consume` 返回 `defaultValue`
- Provider 必须用 `{ value: T }` 格式传值
- `consume` 可在外层和 render 函数中调用
