// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import ProLayout, { PageHeaderWrapper } from '@ant-design-vue/pro-layout'

import bootstrap from './core/bootstrap'
import './core/lazy_use' // use lazy load components
import './permission' // permission control  路由守卫
import './utils/filter' // global filter

import './global.less' // global style
import 'ant-design-vue/dist/antd.less'
import infoBox from '@/utils/infoBox'
import VueClipboard from 'vue-clipboard2' // 复制插件

Vue.use(VueClipboard) // 复制插件
Vue.config.productionTip = false

// use pro-layout components
Vue.component('pro-layout', ProLayout)
Vue.component('page-container', PageHeaderWrapper)
Vue.component('page-header-wrapper', PageHeaderWrapper)

/**
 * @description 全局注册权限验证
 */
Vue.prototype.$access = (entId) => {
  // eslint-disable-next-line eqeqeq
  return store.state.user.accessList.some(item => item == entId)
}

Vue.prototype.$infoBox = infoBox

new Vue({
  router,
  store,
  // init localstorage, vuex
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
