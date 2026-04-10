import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/hub/:jeepayToken', name: 'Hub', component: () => import('../views/Hub.vue') },
  { path: '/error', name: 'Error', component: () => import('../views/Error.vue') },
  { path: '/oauth2Callback/:jeepayToken', name: 'Oauth2Callback', component: () => import('../views/Oauth2Callback.vue') },
  {
    path: '/cashier',
    name: 'Cashier',
    component: () => import('../views/Cashier.vue'),
    redirect: { name: 'CashierWxpay' },
    children: [
      { path: 'wxpay', name: 'CashierWxpay', component: () => import('../views/payway/Wxpay.vue') },
      { path: 'alipay', name: 'CashierAlipay', component: () => import('../views/payway/Alipay.vue') },
      { path: 'ysfpay', name: 'CashierYsfpay', component: () => import('../views/payway/Ysfpay.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
