import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = __dirname;

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    exclude: ["node_modules", "dist", "test/**/*.e2e-spec.ts"],
    globals: true,
    include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov"],
    },
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
