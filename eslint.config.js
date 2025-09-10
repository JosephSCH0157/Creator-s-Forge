// eslint.config.js
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,

  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**']
  },

  // Base JS/TS settings for the whole monorepo
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off', // handled by unused-imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always'
        }
      ]
    }
  },

  // Web app (React) overrides
  {
    files: ['web/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',  
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly'
      },
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      ...reactHooks.configs.recommended.rules
    }
  },

  // Server (Node) overrides
  {
    files: ['server/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { process: 'readonly', __dirname: 'readonly' }
    },
    rules: {
      // Place Node-specific rules you like here
    }
  }
];
