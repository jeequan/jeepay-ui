import { defineStore } from 'pinia'
import jeepayStorageWrapper from '@/utils/jeepayStorageWrapper'
import { getCurrentUserInfo } from '@/api/login'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      avatarUrl: '',
      realname: '',
      userName: '', // 真实姓名
      sysUserId: '', // 用户ID
      avatarImgPath: '', // 头像
      allMenuRouteTree: [], // 全部动态 router
      entIdList: [] as any, // 用户权限集合
      accessList: [], // 用户权限集合
      isAdmin: '', // 是否是超级管理员
      loginUsername: '', // 登录用户名
      state: '', // 用户状态
      sysType: '', // 所属系统
      telphone: '', // 手机号
      sex: '', // 性别
    },
    globalLoading: false,
  }),

  actions: {
    putToken(token: string) {
      jeepayStorageWrapper.setToken(token, true)
    },

    refUserInfo() {
      // 刷新用户信息
      return getCurrentUserInfo().then((bizData: any) => {
        this.userInfo = Object.assign({}, bizData)
      })
    },

    logout: () => {
      jeepayStorageWrapper.cleanToken()
      window.location.reload()
    },

    setGlobalLoading(val) {
      this.globalLoading = val
    },
  },
})
