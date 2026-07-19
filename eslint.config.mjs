import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@next/next/no-img-element": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "build-report/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    "scripts/**",
    "*.js",
    "*.mjs",
  ]),
]);

export default eslintConfig;
