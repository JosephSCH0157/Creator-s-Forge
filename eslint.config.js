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
