import Vue from 'vue'
import Router from 'vue-router'
import { UserLayout } from '@/layouts'

// hack router push callback
// [解决 vue-router跳转相同路径报错 ]
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

// 纯静态路由配置项
const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/user/Login') }
    ]
  }
]

export default new Router({
  mode: 'history',
  routes: constantRouterMap
})
