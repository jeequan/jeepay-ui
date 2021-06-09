/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { generatorDynamicRouter } from '@/router/generator-routers'

const asyncRouter = {
  state: {
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
    }
  },
  actions: {
    GenerateRoutes ({ commit }, data) {
      return new Promise(resolve => {
        generatorDynamicRouter().then(routers => {
          commit('SET_ROUTERS', routers)
          resolve()
        })
      })
    }
  }
}

export default asyncRouter
