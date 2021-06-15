import router from './router'
import store from './store'
import storage from '@/utils/jeepayStorageWrapper'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { setDocumentTitle } from '@/utils/domUtil'
import appConfig from '@/config/appConfig'

import { getInfo } from '@/api/login'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register', 'registerResult'] // no redirect allowList
const loginRoutePath = '/user/login'

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar

  to.meta && (typeof to.meta.title !== 'undefined' && setDocumentTitle(`${to.meta.title} - ${appConfig.APP_TITLE}`)) // 设置浏览器标题

  // 如果在免登录页面则直接放行
  if (allowList.includes(to.name)) {
    // 在免登录名单，直接进入
    next()
    NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    return false
  }

  // 不包含Token 则直接跳转到登录页面
  if (!storage.getToken()) {
    next({ path: loginRoutePath, query: { redirect: to.fullPath } })
    NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    return false
  }

  // 以下为包含Token的情况
  // 如果用户信息不存在， 则重新获取 [用户登录成功 & 强制刷新浏览器时 会执行该函数]
  if (!store.state.user.userId) {
    // request login userInfo

    getInfo().then(bizData => {
      store.commit('SET_USER_INFO', bizData) // 调用vuex设置用户基本信息
      // TODO 生成菜单

      store.dispatch('GenerateRoutes', {}).then(() => {
        // 根据roles权限生成可访问的路由表
        // 动态添加可访问路由表
        router.addRoutes(store.state.asyncRouter.addRouters)
      })

      next()
    }).catch(() => {
      // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
      store.dispatch('Logout').then(() => {
        next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      })
    })
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
