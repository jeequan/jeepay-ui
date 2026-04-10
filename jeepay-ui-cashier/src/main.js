import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import wayCode from './utils/wayCode'
import config from './config'
import 'amfe-flexible'

/**
 * 路由守卫
 */
router.beforeEach((to, from, next) => {
    // 如果在免登录页面则直接放行
    if (config.errorPageRouteName.includes(to.name)) {
      next()
      return
    }

    // 获取 token
    let token = to.params[config.urlTokenName]
    if (token) {
        config.cacheToken = token
    }

    if (!config.cacheToken) {
        next({ name: config.errorPageRouteName, params: { errInfo: '请通过二维码进入支付页面！' } })
        return
    }

    // 获取不到支付类型, 跳转到错误页面
    if (!wayCode.getPayWay()) {
        next({ name: config.errorPageRouteName, params: { errInfo: '不支持的支付方式！ 请在微信/支付宝/银联应用内扫码进入！' } })
        return
    }

    next()
})

const app = createApp(App)

// Vue 3 全局属性注入（替代 Vue.prototype）
app.config.globalProperties.$config = config

app.use(router)
app.mount('#app')
