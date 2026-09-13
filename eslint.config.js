import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/", "node_modules/", "playwright-report/", "test-results/"],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Express reconoce un manejador de errores por sus cuatro parámetros, aunque no use todos.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["client/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["server/**/*.ts", "e2e/**/*.ts", "*.config.ts", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
);
