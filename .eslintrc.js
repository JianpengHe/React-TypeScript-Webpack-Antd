module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint', '@typescript-eslint/eslint-plugin'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: ['prettier'],
  rules: {
    // 取消 { a, b, c } 多个变量需要换行
    'object-curly-newline': [0],
    'comma-dangle': 'off',
    // 强制组件方法顺序
    'react/sort-comp': [2],
    // 检查 Hook 的规则，不允许在if for里面使用
    'react-hooks/rules-of-hooks': [2],
    // 检查 effect 的依赖
    'react-hooks/exhaustive-deps': [2],
    // jsx不可使用未声明变量
    'react/jsx-no-undef': [2],
    // 遍历元素需加key
    'react/jsx-key': [2],
    // 不使用废弃方法
    'react/no-deprecated': [2],
  },
}
