import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "features/**/*.{ts,tsx}",
        "services/**/*.ts",
        "middleware/**/*.ts",
        "utils/**/*.ts",
        "config/**/*.ts",
      ],
      exclude: [
        "node_modules",
        ".next",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.d.ts",
      ],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 40,
        lines: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
