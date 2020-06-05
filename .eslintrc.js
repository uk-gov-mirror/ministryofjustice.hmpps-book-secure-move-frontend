module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['prettier', 'standard'],
  plugins: ['prettier', 'import'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'prettier/prettier': 'error',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'ignore',
      },
    ],
    curly: ['error', 'all'],
    'space-before-function-paren': ['off'],
    'object-curly-spacing': ['error', 'always'],
    'dot-notation': 'error',
    'no-process-env': 'error',
    'no-console': 'error',
    'import/no-unresolved': ['error', { commonjs: true }],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'block' },
      { blankLine: 'always', prev: 'block', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
    ],
  },
  overrides: [
    {
      files: ['*.test.js', '*.spec.js'],
      env: {
        mocha: true,
      },
      globals: {
        expect: 'readonly',
        sinon: 'readonly',
        nock: 'readonly',
        mockFs: 'readonly',
        requireUncached: 'readonly',
      },
      rules: {
        'no-unused-expressions': 'off',
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-mocha-arrows': 'error',
      },
      plugins: ['mocha'],
    },
  ],
}
