module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'prettier',
    'prettier/vue',
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/essential',
    'eslint:recommended'
  ],

  // plugins: ['prettier'],
  // add your custom rules here
  rules: {
    // 'prettier/prettier': [
    //   'error',
    //   {
    //     endOfLine: 'auto',
    //     singleQuote: true,
    //   },
    // ],
    // 'vue/multiline-html-element-content-newline': 'off',
    // 'vue/singleline-html-element-content-newline': 'off',
  }
}
