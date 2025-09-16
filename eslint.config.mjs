// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // Ignore build artifacts & generated files
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
  },

  // Base JS rules
  js.configs.recommended,

  // ✅ TypeScript base (flat presets are arrays — spread them)
  ...tseslint.configs.recommendedTypeChecked,
  // (Optional) also include stylistic TypeScript rules:
  // ...tseslint.configs.stylisticTypeChecked,

  // --- React app (browser) ---
  {
    files: ['web/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      // We keep the TS parser + type-aware project here
      parser: tseslint.parser,
      parserOptions: {
        project: 'web/tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url), // Windows-friendly
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // TS hardening to match your codebase
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],

      // React / Hooks
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      ...reactHooks.configs.recommended.rules,

      // Unused imports/vars (use the plugin’s autofixers)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Import ordering (polish)
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
    },
  },

  // --- Node-side configs (Vite, scripts) ---
  {
    files: ['web/vite.config.ts', '*.config.{ts,cts,mts}', 'scripts/**/*.{ts,cts,mts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.node.json', // points at web/vite.config.ts
        tsconfigRootDir: new URL('.', import.meta.url),
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'off',
      'unused-imports/no-unused-imports': 'error',
      // keep node-side TS rules light unless you want full type-checking here too
    },
  },
];
