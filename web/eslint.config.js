// eslint.config.js (flat config)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts & lockfiles
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.min.js",
      "**/*.d.ts",
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript (no type-aware rules = fastest)
  ...tseslint.configs.recommended, // includes parser + TS rules

  // Files to apply to
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // browser globals for a Vite app
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Refresh (only warn in dev)
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Nice-to-haves
      "no-unused-vars": "off", // handled by TS
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];
