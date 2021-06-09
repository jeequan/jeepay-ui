// eslint-disable-next-line
import * as loginService from '@/api/login'
// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'
import store from '@/store'
import { asyncRouteDefine } from '@/config/appConfig'

// 前端路由表 = 基础定义 + 动态组件
const constantRouterComponents = Object.assign({
  // 基础页面 layout 必须引入
  BasicLayout: { component: BasicLayout },
  BlankLayout: { component: BlankLayout },
  RouteView: { component: RouteView },
  PageView: { component: PageView },
  '403': () => import('@/views/exception/403'),
  '404': () => import('@/views/exception/404'),
  '500': () => import('@/views/exception/500')
}, asyncRouteDefine)

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*', component: () => import('@/views/exception/404')
}

// 根级菜单
const rootRouter = {
  name: 'index',
  path: '/',
  component: BasicLayout,
  redirect: redirectFunc, // 根页面【/】默认跳转 地址
  children: [],
  meta: { title: '主页' }
}

// 动态跳转路径 func
function redirectFunc () {
  let mainPageUri = ''
  store.state.user.allMenuRouteTree.forEach(item => {
    if (item.entId === 'ENT_MCH_MAIN') { // 当前用户是否拥有主页权限， 如果有直接跳转到该路径
      mainPageUri = item.menuUri
      return false
    }
  })

  if (mainPageUri) {
    return mainPageUri
  }

  return getOneUri(store.state.user.allMenuRouteTree)
}

// 获取到第一个uri (递归查找)
function getOneUri (item) {
  let result = ''
  for (let i = 0; i < item.length; i++) {
    if (item[i].menuUri && item[i].entType === 'ML') {
      return item[i].menuUri
    }

    if (item[i].children) {
      result = getOneUri(item[i].children)
      if (result) {
        return result
      }
    }
  }
  return result
}

/**
 * 动态生成菜单
 * @param token
 * @returns {Promise<Router>}
 */
export const generatorDynamicRouter = () => {
  return new Promise((resolve, reject) => {
    // 根据树状结构生成路由格式
    rootRouter.children = generator(store.state.user.allMenuRouteTree)

    // 构建完整路由
    resolve([rootRouter, notFoundRouter])
  })
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @returns {*}
 */
export const generator = (allMenuRouteTreeArray) => {
  const menuResult = []

  // 遍历map
  allMenuRouteTreeArray.map(item => {
    const defComponent = constantRouterComponents[item.componentName || item.entId]

    // 找不到组件 || 其他菜单
    if (!defComponent) {
      return
    }

    // 跳转uri
    let path = item.menuUri || defComponent.defaultPath

    // 没有配置path, 如果为目录则允许为空， 否则不在加载此配置
    if (!path) {
      if (item.children && item.children.length > 0) {
        path = `/${item.entId}`
      } else {
        return // 不再加载此配置项
      }
    }

    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 为默认配置
      path: path,
      // 路由名称，建议唯一
      name: item.entId,
      // 该路由对应页面的 组件 :方案2 (动态加载)
      component: ((defComponent && defComponent.component) || (() => import(`@/views/${item.componentName}`))),
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: item.entName,
        icon: item.menuIcon,
        keepAlive: false
      },
      hidden: item.entType === 'MO' // 当其他菜单时需要隐藏显示
    }
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children)
    }
    menuResult.push(currentRouter)
  })

  return menuResult
}
