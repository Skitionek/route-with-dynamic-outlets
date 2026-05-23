const tsEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['src/types/global.d.ts'],
  },
  ...tsEslint.configs['flat/recommended-type-checked'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './tsconfig.spec.json'],
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      quotes: ['warn', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
];
