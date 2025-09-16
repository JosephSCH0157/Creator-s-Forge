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
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'] },

  // Base JS (only JS rules, no TS here)
  js.configs.recommended,

  // --- React app (browser, TS) ---
  // Apply TS presets *only* to app TS/TSX files
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['web/src/**/*.{ts,tsx}'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        project: 'web/tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url),
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: {
      ...(cfg.plugins ?? {}),
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
  })),
  {
    files: ['web/src/**/*.{ts,tsx}'],
    settings: { react: { version: 'detect' } },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
    },
  },

  // --- Node-side configs (Vite, scripts, TS) ---
  // TS presets only for node/config TS files
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['web/vite.config.ts', '*.config.{ts,cts,mts}', 'scripts/**/*.{ts,cts,mts}'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.node.json',
        tsconfigRootDir: new URL('.', import.meta.url),
        sourceType: 'module',
      },
      globals: { ...globals.node },
    },
    plugins: {
      ...(cfg.plugins ?? {}),
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
  })),
  {
    files: ['web/vite.config.ts', '*.config.{ts,cts,mts}', 'scripts/**/*.{ts,cts,mts}'],
    rules: {
      'no-console': 'off',
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
