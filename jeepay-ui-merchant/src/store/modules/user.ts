import { defineStore } from 'pinia'
import jeepayStorageWrapper from '@/utils/jeepayStorageWrapper'
import { getCurrentUserInfo } from '@/api/login'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      userId: '',
      realname: '',
      user: '',
      sysUserId: '', // 用户ID
      avatarUrl: '', // 头像
      allMenuRouteTree: [] as any, // 全部动态 router
      entIdList: [] as any, // 用户权限集合
      isAdmin: '', // 是否是超级管理员
      loginUsername: '', // 登录用户名
      state: '', // 用户状态
      sysType: '', // 所属系统
      telphone: '', // 手机号
      sex: '', // 性别
      mchType: '', // 商户类型 1-普通商户, 2-特约商户(服务商模式)
      mchLevel: '', // 商户级别
      isHasAgentEnt: false, //是否包含代理商功能
      isHasMemberEnt: false, //是否包含会员功能
      infoNo: '', // 系统编号当前仅用于解决进件资料上传无商户号目录问题
    },
    globalLoading: false, //全局加载
  }),

  actions: {
    putToken(token: string) {
      jeepayStorageWrapper.setToken(token, true)
    },

    refUserInfo(val?) {
      // 刷新用户信息
      if (val) return (this.userInfo = Object.assign({}, val))
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
