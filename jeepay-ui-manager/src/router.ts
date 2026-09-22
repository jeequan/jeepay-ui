import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/user/Login.vue'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { useUserStore } from '@/store/modules/user'
import jeepayStorageWrapper from '@/utils/jeepayStorageWrapper'
import { generatorDynamicRouter } from '@/router/generator-routers'

NProgress.configure({ showSpinner: false })

const rootRoute: any = [{ name: 'login', path: '/login', component: Login }]

const router = createRouter({
  // history base 需与 vite 构建的 base（VITE_APP_BASE_URL）一致：子路径部署（如 /manager/）时，
  // 若不传 base 则缺省为 /，路由地址不带前缀，刷新页面会 404 或报 No match found
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: rootRoute,
})

// 路由守卫
const allowList = ['login', 'register', 'registerResult'] // no redirect allowList
const loginRoutePath = '/login'

// 路由守卫 // eslint-disable-next-line @typescript-eslint/no-explicit-any
router.beforeEach((to: any, from, next) => {
  NProgress.start()
  // 如果在免登录页面则直接放行
  if (allowList.includes(to.name)) {
    // 在免登录名单，直接进入
    next()
    NProgress.done()
    return false
  }

  // 不包含Token 则直接跳转到登录页面
  if (!jeepayStorageWrapper.getToken()) {
    next({ path: loginRoutePath, query: { redirect: to.fullPath } })
    NProgress.done()
    return false
  }

  // 以下为包含Token的情况
  // 如果用户信息不存在， 则重新获取 [用户登录成功 & 强制刷新浏览器时 会执行该函数]
  if (!useUserStore().userInfo.sysUserId) {
    useUserStore()
      .refUserInfo()
      .then(() => {
        generatorDynamicRouter().then((resRouter) => {
          //增加rootRouter
          router.addRoute(resRouter[0])

          // console.log(to.matched, to.matched.length, to.path)

          // https://ask.csdn.net/questions/7419202, 解决跳转白屏的问题
          if (to.matched.length == 0) {
            router.push(to.path)
          }
          // next()
        })
      })
  } else {
    next()
    return false
  }
})

// 之后处理
router.afterEach(() => {
  NProgress.done()
})

export default router
