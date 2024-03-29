module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  globals: {
    '_': 'on',
    'wx': 'on',
    'zerosApp': 'on'
  },
  rules: {
    'x-invalid-end-tag': 'off',
    'vue/no-unused-components': 'off',
    'vue/valid-template-root': 'off',
    'no-unused-vars': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
