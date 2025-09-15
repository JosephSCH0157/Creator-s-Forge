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
      // keep these strong
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // migration softeners: turn down noisy unsafe-any family
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-explicit-any": "warn",

      // keep hooks sanity
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);
