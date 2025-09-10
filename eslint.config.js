import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';   // 👈 add this line

export default [
  js.configs.recommended,

  { ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'] },

  // ... web override (browser globals) ...
// Web (browser) override
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
      ...globals.browser    // 👈 add browser globals here
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
}

  // Server (Node) override
  {
    files: ['server/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node   // 👈 this pulls in all Node.js built-ins (console, process, Buffer, etc.)
      }
    },
    rules: {
      // your server-specific rules here
    }
  }
];

