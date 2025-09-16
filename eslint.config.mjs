// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import { fileURLToPath, URL } from 'node:url';

const TS_ROOT = fileURLToPath(new URL('.', import.meta.url));
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must be a string (not a URL object)
// Use __dirname for robust path resolution

export default [
  // Ignore build artfacts + legacy config files
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '.eslintrc.*', // ignore any old-style configs if present
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // --- React app (browser, TypeScript) ---
  // Apply the type-aware TS presets ONLY to app TS/TSX files
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['web/src/**/*.{ts,tsx}'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        project: './web/tsconfig.json',
        tsconfigRootDir: TS_ROOT,
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
      // TypeScript safety
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],
      // React / Hooks
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      ...reactHooks.configs.recommended.rules,
      // Unused imports/vars (prefer plugin with autofix)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Import ordering polish
      'import/order': [
        'warn',
        { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } },
      ],
    },
  },

  // --- Node-side (typed TS): Vite config + *.config + TS scripts ---
  ...tseslint.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['web/vite.config.ts', '*.config.{ts,cts,mts}', 'scripts/**/*.{ts,cts,mts}'],
    languageOptions: {
      ...(cfg.languageOptions ?? {}),
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: TS_ROOT,
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

  // --- Node-side (plain JS): give Node globals, no TS parser ---
  {
    files: ['scripts/**/*.{js,mjs,cjs}', 'server/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
