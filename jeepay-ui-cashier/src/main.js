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
    // 免守卫路由名单（使用 passGuardRouteList 数组判断，而非字符串 includes）
    if (config.passGuardRouteList.includes(to.name)) {
      next()
      return
    }

    // 从路由参数或 query 中恢复 token（支持 /hub/:jeepayToken 和刷新场景）
    const token = to.params[config.urlTokenName] || to.query[config.urlTokenName]
    if (token) {
        config.cacheToken = token
    }

    if (!config.cacheToken) {
        next({ name: config.errorPageRouteName, params: { errInfo: '请通过二维码进入支付页面！' } })
        return
    }

    if (!wayCode.getPayWay()) {
        next({ name: config.errorPageRouteName, params: { errInfo: '不支持的支付方式！ 请在微信/支付宝/银联应用内扫码进入！' } })
        return
    }

    next()
})

const app = createApp(App)
app.config.globalProperties.$config = config
app.use(router)
app.mount('#app')
