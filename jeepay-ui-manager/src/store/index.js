import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'

// default router permission control
import asyncRouter from './modules/async-router'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user, // 用户相关状态机
    asyncRouter // 动态菜单
  },
  state: {
    // 定义全局loading 为false
    globalLoading: false
  },
  mutations: {
    // 显示与关闭 全局 loading
    showLoading (state) {
      state.globalLoading = true
    },
    hideLoading (state) {
      state.globalLoading = false
    }
  },
  actions: {

  }
})
