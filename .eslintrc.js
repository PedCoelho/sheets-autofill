module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    '@nuxtjs/eslint-config',
    'prettier',
    'prettier/vue',
    // 'plugin:vue/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
      },
    ],
    // 'vue/multiline-html-element-content-newline': 'off',
    // 'vue/singleline-html-element-content-newline': 'off',
  },
};
