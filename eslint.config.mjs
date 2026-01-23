// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Disables the error for returning 'any' or untyped values
      '@typescript-eslint/no-unsafe-return': 'off',

      // Disables the error for calling methods/functions on 'any' types
      '@typescript-eslint/no-unsafe-call': 'off',

      // Disables the error for accessing properties on 'any' types
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // Disables the error for assigning 'any' to a variable
      '@typescript-eslint/no-unsafe-assignment': 'off',

      // Your existing rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off', // Change to 'off' if you want this gone too
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
