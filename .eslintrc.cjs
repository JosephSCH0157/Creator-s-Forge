// .eslintrc.cjs
const ts = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '**/*.d.ts',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: ['web/tsconfig.json', 'tsconfig.node.json'],
      },
    },
  },
  overrides: [
    // --- React app (browser) ---
    {
      files: ['web/src/**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'web/tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      env: { browser: true, es2021: true },
      plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'unused-imports'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        // Prefer our unused-imports auto-fixer
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

        // Match your recent changes
        '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }],
        'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc', caseInsensitive: true } }],
      },
    },

    // --- Node-side configs (vite, scripts) ---
    {
      files: ['web/vite.config.ts', '*.config.{ts,cts,mts}', 'scripts/**/*.{ts,cts,mts}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.node.json', // points to web/vite.config.ts (you already set this)
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      env: { node: true, es2021: true },
      plugins: ['@typescript-eslint', 'import', 'unused-imports'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        'no-console': 'off',
        'unused-imports/no-unused-imports': 'error',
        '@typescript-eslint/no-var-requires': 'off',

        // Optional: force explicit import of Node's URL
        // 'no-restricted-globals': ['error', { name: 'URL', message: "Import { URL } from 'node:url' explicitly." }],
      },
    },
  ],
};
