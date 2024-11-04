/**
 * 通用信息弹层
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */
import { Modal } from 'ant-design-vue'

function modelConfirmPromiseRejectFunc (antCloseFuncOrMsg, extConfig, reject) {
    // 是否手动关闭 （ 不自动调用关闭接口， 会返回给reject去调用支持异步 ）
    let isCatchFuncClose = false
    if (extConfig && extConfig.isCatchFuncClose) {
        isCatchFuncClose = true
    }

    // 定义reject 返回的对象
    const rejectResult = { closeFunc: typeof (antCloseFuncOrMsg) === 'function' ? antCloseFuncOrMsg : () => {}, triggerCancel: false }

    // 当前是否是蒙层关闭的
    if (typeof antCloseFuncOrMsg === 'object' && antCloseFuncOrMsg.triggerCancel) {
        rejectResult.triggerCancel = true
        return reject(rejectResult)
    }

    // 自动关闭
    if (!isCatchFuncClose) {
        rejectResult.closeFunc()
    }

    return reject(rejectResult)
}

// 确认提示： 标题， 内容， 点击确定回调函数， 取消回调，  扩展参数
export const confirmResult = {
  confirm: function (title, content, okFunc, cancelFunc = (() => {}), extConfig = {}) {
      return Modal.confirm(
      Object.assign({
        okText: '确定',
        cancelText: '取消',
        title: title || '提示',
        content: content,
        onOk: okFunc,
        onCancel: cancelFunc,
        confirmLoading: true
      }, extConfig))
  },
  confirmPrimary: function (title, content, okFunc, cancelFunc = (() => {}), extConfig = {}) {
      return this.confirm(title, content, okFunc, cancelFunc, Object.assign({ okType: 'primary' }, extConfig))
  },

  confirmDangerPromise: function (title, content, extConfig = {}) {
    return new Promise((resolve, reject) => {
        return this.confirm(
            title,
            content,
            () => { resolve('') },
            (antCloseFuncOrMsg) => { return modelConfirmPromiseRejectFunc(antCloseFuncOrMsg, extConfig, reject) },
            Object.assign({ okType: 'danger' },
            extConfig)
        )
    })
  },

  confirmDanger: function (title, content, okFunc, cancelFunc = (() => {}), extConfig = {}) {
      return this.confirm(title, content, okFunc, cancelFunc, Object.assign({ okType: 'danger' }, extConfig))
  },

  modalError: function (title, content, okFunc = (() => {})) {
      return Modal.error({ title: title, content: content, onOk: okFunc })
  },

  modalSuccess: function (title, content, okFunc = (() => {})) {
      return Modal.success({ title: title, content: content, onOk: okFunc })
  },

  modalWarning: function (title, content, okFunc = (() => {})) {
      return Modal.warning({ title: title, content: content, onOk: okFunc })
  }
}

export default confirmResult
