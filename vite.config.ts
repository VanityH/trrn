import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: true,
    platform: "neutral",
    exports: true,
    deps: { skipNodeModulesBundle: true },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
  test: {
    environment: "jsdom",
  },
});
