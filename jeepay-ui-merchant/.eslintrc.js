/**
 默认eslint规则：
   代码末尾不能加分号 ;（强迫症的我受不了 哭）
   代码中不能存在多行空行；（这个我更也忍不了大哭）
   tab键不能使用，必须换成两个空格；（超级不习惯）
   代码中不能存在声明了但未使用的变量；（这个我觉得可以有）
 * **/

module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/strongly-recommended',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'generator-star-spacing': 'off',
    'no-mixed-operators': 0,
    'vue/max-attributes-per-line': [
      2,
      {
        'singleline': 5,  //单行的情况下可以接受的属性数量
        'multiline': {
          'max': 1,  //多行的情况下每行最多属性数量
          'allowFirstLine': false  //不允许在多行的情况下第一行有属性
        }
      }
    ],
    'vue/attribute-hyphenation': 0,
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': 0,
    'vue/html-closing-bracket-spacing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-parsing-error': 0,
    'no-tabs': 0,
    'quotes': [
      2,
      'single',
      {
        'avoidEscape': true,
        'allowTemplateLiterals': true
      }
    ],

    /**
     * 分号配置项：
     *  第一个参数：
     "  off"或0 - 关闭规则
     "  warn"或1 - 将该规则作为警告打开（不影响退出代码）
     "  error"或2 - 将规则作为错误打开（退出代码将为1）
     *
     *第二个参数
     always（默认）：在语句末尾需要分号
     never：不允许加分号
     *
     * 第三个参数：
     "beforeStatementContinuationChars": "any"（默认）如果下一行语句以 [，(，/，+，或 - 开头，忽略语句末尾的分号（或缺失分号），
     "beforeStatementContinuationChars": "always" 如果下一行语句以 [，(，/，+，或 - 开头，在语句末尾需要添加分号。
     "beforeStatementContinuationChars": "never" 如果该语句不会因为ASI而带来风险，那么即使它的下一行语句以 [，(，/，+，或 - 开头，也不允许在语句末尾添加分号。
     * **/
    'semi': [
      2,
      'never',
      {
        'beforeStatementContinuationChars': 'never'
      }
    ],
    'no-delete-var': 2,
    'prefer-const': [
      2,
      {
        'ignoreReadBeforeAssign': false
      }
    ],
    'template-curly-spacing': 'off',
    'indent': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
