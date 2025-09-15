// /web/eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts & lockfiles
  {
    ignores: ["dist/**", "node_modules/**", "**/*.min.js", "**/*.d.ts"],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript (fast set)
  ...tseslint.configs.recommended,

  // Type-aware rules (needs project)
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],       // adjust if your tsconfig lives elsewhere
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project rules (JS + TS)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,  // <-- important
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Fast Refresh
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TS-flavored unused vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Pragmatic for now
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
