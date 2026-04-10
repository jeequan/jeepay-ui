/**
 * 路由配置信息
 *
 * @author terrfly
 * @site https://www.jeepay.vip
 * @date 2021/5/8 07:18
 */

import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/hub/:jeepayToken', name: 'Hub', component: () => import('../views/Hub.vue') },
  { path: '/error', name: 'Error', component: () => import('../views/Error.vue') },
  { path: '/oauth2Callback/:jeepayToken', name: 'Oauth2Callback', component: () => import('../views/Oauth2Callback.vue') },
  {
    path: '/cashier', name: 'Cashier', component: () => import('../views/Cashier.vue'),
    children: [
      { path: '/cashier/wxpay', name: 'CashierWxpay', component: () => import('../views/payway/Wxpay.vue') },
      { path: '/cashier/alipay', name: 'CashierAlipay', component: () => import('../views/payway/Alipay.vue') },
      { path: '/cashier/ysfpay', name: 'CashierYsfpay', component: () => import('../views/payway/Ysfpay.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
