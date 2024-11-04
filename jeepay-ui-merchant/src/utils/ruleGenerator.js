export default {

  requiredInput: (showText, type = 'string') => {
          return { type: type, required: true, message: '请输入' + showText }
  },

  requiredSelect: (showText, type = 'string') => {
      return { type: type, required: true, message: '请选择' + showText }
  },

  requiredUpload: (showText, type = 'string') => {
      return { type: type, required: true, message: '请上传' + showText }
  },

  // 金额范围的判断  参数后面的问号，表示： 可选参数
  amountRange: (showText, minVal = 0.01, maxVal) => {
      return {
          validator: (rule, value) => {
            if (typeof (minVal) === 'number' && value < minVal) {
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject(`${showText}不能小于${minVal}元`)
            }
            if (typeof (maxVal) === 'number' && value > maxVal) {
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject(`${showText}不能大于${maxVal}元`)
            } else {
              return Promise.resolve()
            }
          }
       }
  },

  mobile: { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
  emall: { pattern: /^.+@.+(\.).+$/, message: '请输入正确的邮箱' },

  date: { pattern: /^\d{4}-\d{2}-\d{2}$/, message: '请输入正确的日期[yyyy-MM-dd]' },
  dateOrForever: { pattern: /^长期|(\d{4}-\d{2}-\d{2})$/, message: '请输入正确的日期[yyyy-MM-dd]或选择长期有效' }

}
