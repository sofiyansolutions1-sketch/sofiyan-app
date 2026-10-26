import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'netlify-dist/**',
      'node_modules/**',
      '*.cjs',
      '*.sh',
      '*.sql',
      '*.patch',
      '*.txt',
      '*.json'
    ]
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-undef': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off'
    }
  }
);
