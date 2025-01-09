/**
 * Http请求包装对象
 * 参考： iview https://gitee.com/icarusion/iview-admin/blob/master/src/libs/axios.js
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */

import axios from 'axios'
import storage from '@/utils/jeepayStorageWrapper'
import appConfig from '@/config/appConfig'
import { useUserStore } from '@/store/modules/user'
import $infoBox from '@/utils/infoBox'
class HttpRequest {
  constructor(baseUrl = process.env.VITE_API_BASE_URL) {
    this.baseUrl = baseUrl
    this.queue = {} // 发送队列, 格式为: {请求url: true}, 可以做一些验证之类
  }
  // 基础配置信息
  baseConfig() {
    const headers = {}
    headers[appConfig.ACCESS_TOKEN_NAME] = storage.getToken()
    return {
      baseURL: this.baseUrl,
      headers: headers,
    }
  }
  destroy(url, showLoading) {
    delete this.queue[url]
  }
  interceptors(instance, url, showErrorMsg, showLoading) {
    // 请求拦截
    instance.interceptors.request.use(
      (config) => {
        // 添加全局的loading...
        if (!Object.keys(this.queue).length && showLoading) {
          this.myGlobalLoadingFunc(true) // 加载中显示loading组件
        }
        this.queue[url] = true
        return config
      },
      (error) => {
        this.myGlobalLoadingFunc(false) // 报错关闭loading组件
        return Promise.reject(error)
      }
    )

    // 响应拦截
    instance.interceptors.response.use(
      (res) => {
        this.destroy(url, showLoading)

        if (showLoading) {
          this.myGlobalLoadingFunc(false) // 报错关闭loading组件
        }

        const resData = res.data // 接口实际返回数据 格式为：{code: '', msg: '', data: ''}， res.data 是axios封装对象的返回数据；

        if (resData.code !== 0) {
          // 相应结果不为0， 说明异常
          if (showErrorMsg) {
            $infoBox.message.error(resData.msg) // 显示异常信息
          }

          return Promise.reject(resData)
        } else {
          return resData.data
        }
      },
      (error) => {
        this.destroy(url, showLoading)

        if (showLoading) {
          this.myGlobalLoadingFunc(false) // 报错关闭loading组件
        }

        let errorInfo = error.response && error.response.data && error.response.data.data
        if (!errorInfo) {
          errorInfo = error.response.data
        }

        if (error.response.status === 401) {
          // 无访问权限，会话超时， 提示用户信息 & 退出系统

          useUserStore().logout()

          $infoBox.confirmDanger('会话超时，请重新登录', '3s后将自动退出...', () => {}, {
            okText: '重新登录',
            cancelText: '关闭对话',
          })
        } else {
          if (showErrorMsg) {
            $infoBox.message.error(JSON.stringify(errorInfo)) // 显示异常信息
          }
        }

        return Promise.reject(errorInfo)
      }
    )
  }
  // interceptorsFlag： 是否进行自定义拦截器处理，默认为： true
  // showErrorMsg 发送请求出现异常是否全局提示错误信息
  // showLoading 发送请求前后显示全局loading
  request(options, interceptorsFlag = true, showErrorMsg = true, showLoading = false) {
    const instance = axios.create()
    options = Object.assign(this.baseConfig(), options)
    if (interceptorsFlag) {
      // 注入 req, respo 拦截器
      this.interceptors(instance, options.url, showErrorMsg, showLoading)
    }

    return instance(options)
  }

  myGlobalLoadingFunc(isShowGlobalLoadingVal) {
    useUserStore().setGlobalLoading(isShowGlobalLoadingVal)
  }
}
export default HttpRequest
