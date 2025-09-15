// /web/eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default tseslint.config(
  // 1) Ignore build artifacts and config files (avoid linting eslint.config.js itself)
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.min.js",
      "**/*.d.ts",
      "eslint.config.*",
      "vite.config.*",
    ],
  },

  // 2) Base JS rules
  js.configs.recommended,

  // 3) TypeScript base (no type info)
  ...tseslint.configs.recommended,

  // 4) Type-aware TS rules (require project)
  ...tseslint.configs.recommendedTypeChecked,
  {
    // apply type info to TS files by providing the project
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 5) Project-wide rules and plugins
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Fast Refresh
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Prefer TS-flavored unused-vars
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // Pragmatic
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
);
