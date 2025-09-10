// eslint.config.js
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals'; // 👈 add this

export default [
  js.configs.recommended,

  { ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'] },

  // base rules (unchanged) ...

  // Web (browser) override (unchanged) ...
  {
    files: ['web/**/*.{js,jsx,ts,tsx}'],
    // ...
    languageOptions: {
      // ...
      globals: { ...globals.browser }, // 👈 browser globals for web
    },
    // ...
  },

  // Server (Node) override — add Node globals
  {
    files: ['server/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node }, // 👈 this makes console/process/etc. defined
    },
    rules: {
      // your node rules here
    }
  }
];
