/**
 * 通用信息弹层
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */
import { Modal, notification, message } from 'ant-design-vue'

// @ts-ignore
/**
 * 定义ant model类型的点击取消按钮的回调函数
 * 支持： 自动关闭（默认）， 用户手动调用函数关闭（不包含蒙层）
 * 返回结果： { closeFunc: 关闭函数 , triggerCancel: 是否蒙层关闭 }
 *
 * 原理：
 * antdv 约定： 当点击蒙层关闭： 返回数据为：  {triggerCancel: true} ,  点击按钮关闭时： 返回 关闭func
 * 如果extConfig 包含： { isCatchFuncClose ：true }, 那么会手动关闭，  需要开发者自行调用关闭函数（ 仅按钮关闭时, 因为蒙层无法手动控制 ）
 * **/
function modelConfirmPromiseRejectFunc(antCloseFuncOrMsg, extConfig, reject) {
  // 是否手动关闭 （ 不自动调用关闭接口， 会返回给reject去调用支持异步 ）
  let isCatchFuncClose = false
  if (extConfig && extConfig.isCatchFuncClose) {
    isCatchFuncClose = true
  }

  // 定义reject 返回的对象
  let rejectResult = {
    closeFunc: typeof antCloseFuncOrMsg == 'function' ? antCloseFuncOrMsg : () => {},
    triggerCancel: false,
  }

  // 当前是否是蒙层关闭的
  if (typeof antCloseFuncOrMsg == 'object' && antCloseFuncOrMsg.triggerCancel) {
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
  confirm: function (title, content, okFunc, cancelFunc = (e) => {}, extConfig = {}) {
    return Modal.confirm(
      Object.assign(
        {
          okText: '确定',
          cancelText: '取消',
          title: title || '提示',
          content: content,
          onOk: okFunc,
          onCancel: cancelFunc,
          confirmLoading: true,
        },
        extConfig
      )
    )
  },
  confirmPrimary: function (title, content, okFunc, cancelFunc = () => {}, extConfig = {}) {
    return this.confirm(
      title,
      content,
      okFunc,
      cancelFunc,
      Object.assign({ okType: 'primary' }, extConfig)
    )
  },

  confirmDanger: function (title, content, okFunc, cancelFunc = () => {}, extConfig = {}) {
    return this.confirm(
      title,
      content,
      okFunc,
      cancelFunc,
      Object.assign({ okType: 'danger' }, extConfig)
    )
  },

  confirmPrimaryPromise: function (title, content, extConfig = {}) {
    return new Promise((resolve, reject) => {
      this.confirm(
        title,
        content,
        () => {
          resolve('')
        },
        (antCloseFuncOrMsg) => {
          return modelConfirmPromiseRejectFunc(antCloseFuncOrMsg, extConfig, reject)
        },
        Object.assign({ okType: 'primary' }, extConfig)
      )
    })
  },

  confirmDangerPromise: function (title, content, extConfig = {}) {
    return new Promise((resolve, reject) => {
      return this.confirm(
        title,
        content,
        () => {
          resolve('')
        },
        (antCloseFuncOrMsg) => {
          return modelConfirmPromiseRejectFunc(antCloseFuncOrMsg, extConfig, reject)
        },
        Object.assign({ okType: 'danger' }, extConfig)
      )
    })
  },

  modalError: function (title, content, okFunc = () => {}) {
    return Modal.error({ title: title, content: content, onOk: okFunc })
  },

  modalSuccess: function (title, content, okFunc = () => {}) {
    return Modal.success({ title: title, content: content, onOk: okFunc })
  },

  modalWarning: function (title, content, okFunc = () => {}) {
    return Modal.warning({ title: title, content: content, onOk: okFunc })
  },

  notification: notification,
  modal: Modal,
  message: message,
}

export default confirmResult
