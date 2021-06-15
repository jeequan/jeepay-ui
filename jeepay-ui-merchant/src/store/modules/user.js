import storage from '@/utils/jeepayStorageWrapper'
import { login, logout } from '@/api/login'
import appConfig from '@/config/appConfig'

const user = {
  state: {
    token: '',
    userName: '', // 用户名
    userId: '', // 用户ID
    avatarImgPath: '', // 头像
    allMenuRouteTree: [], // 全部动态 router
    accessList: [], // 用户权限集合
    isAdmin: '', // 是否是超级管理员
    loginUsername: '', // 登录用户名
    state: '', // 用户状态
    sysType: '', // 所属系统
    telphone: '' // 手机号
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    // 设置头像
    SET_AVATAR (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    // 设置用户信息
    SET_USER_INFO: (state, userInfo) => {
      state.userId = userInfo.sysUserId // 用户ID
      state.userName = userInfo.realname // 昵称
      state.avatarImgPath = userInfo.avatarUrl // 头像
      state.accessList = userInfo.entIdList // 权限集合
      state.allMenuRouteTree = userInfo.allMenuRouteTree // 全部路由集合
      state.isAdmin = userInfo.isAdmin // 是否是超级管理员
      state.loginUsername = userInfo.loginUsername // 登录用户名
      state.state = userInfo.state // 用户状态
      state.sysType = userInfo.sysType // 所属系统
      state.telphone = userInfo.telphone // 手机号
    }
  },

  actions: {
    // 登录
    Login ({ commit }, { loginParams, isSaveStorage }) {
      return new Promise((resolve, reject) => {
        login(loginParams).then(bizData => {
          storage.setToken(bizData[appConfig.ACCESS_TOKEN_NAME], isSaveStorage)
          commit('SET_TOKEN', bizData[appConfig.ACCESS_TOKEN_NAME])
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    Logout ({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          storage.cleanToken()
          location.reload() // 退出时 重置缓存
          resolve()
        }).catch(() => {
          resolve()
        }).finally(() => {
        })
      })
    }

  }
}

export default user
