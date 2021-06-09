import Vue from 'vue'
import App from './App.vue'
import router from './router'
import wayCode from './utils/wayCode';
import config from './config'
import 'amfe-flexible'
Vue.config.productionTip = false

/**
 * 路由守卫
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */
router.beforeEach((to, from, next) => {

    console.log("进入路由守卫",from, to)

    // from: 当前导航正要离开的路由
    // to: 即将要进入的目标路由对象

    // 如果在免登录页面则直接放行
    if (config.errorPageRouteName.includes(to.name)) {
      // 在免登录名单，直接进入
      next()
      return false
    }

    //获取不到参数
    let token = to.params[config.urlTokenName];
    // let token = 'test';  // 不提交
    if(token){  //放置token信息
        config.cacheToken = token;
    }

    if(!config.cacheToken) {
        next({ name: config.errorPageRouteName, params: { errInfo: "token参数有误！" } })
        return false;
    }

  //获取不到支付类型, 需要跳转到错误页面
   if( ! wayCode.getPayWay() ) {
     next({ name: config.errorPageRouteName, params: { errInfo: "不支持的支付方式！" } })
     return false;
   }

    next()
})


Vue.prototype.$config = config;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
