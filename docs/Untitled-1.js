function Comp(props, ctx) {
  // 这里的代码只会在第一次调用时运行
  // 因为只执行一次，所以是否可以就不使用 useState 等等

  const a = 123;

  return (props) => {
    // 这里的代码会在每次调用时运行，包括第一次，第一次会传入和外部参数一致的参数，所以不用担心参数的解构代码之类的问题
    // 这里可以进行每次更新都要执行的代码的逻辑
    console.log(props);
    console.log(a);
    return h("div");
  };
}
