import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = __dirname;

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    globals: true,
    include: ["test/**/*.e2e-spec.ts"],
    name: "e2e",
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "src": resolve(rootDir, "src"),
      "@app": resolve(rootDir, "src"),
      "@infra": resolve(rootDir, "src/@infra"),
      "@helper": resolve(rootDir, "src/@helper"),
      "@shared": resolve(rootDir, "src/@shared"),
    },
  },
});
