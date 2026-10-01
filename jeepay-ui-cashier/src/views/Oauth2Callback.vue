<template>
  <div>
    <p style="font-size:16px;">正在跳转...</p>
  </div>
</template>

<script>
import { getChannelUserId } from '@/api/api'
import wayCodeUtils from '@/utils/wayCode'
import channelUserIdUtil from '@/utils/channelUserId'
import config from '@/config'

export default {
  data() {
    return { callbackVersion: 0 }
  },
  watch: {
    '$route.fullPath': {
      immediate: true,
      handler() {
        if (this.$route.name === 'Oauth2Callback') this.loadChannelUserId()
      }
    }
  },
  beforeUnmount() {
    // 已离开回跳页面时，不允许旧请求恢复支付流程。
    this.callbackVersion++
  },
  methods: {
    async loadChannelUserId() {
      const version = ++this.callbackVersion
      const callbackPath = this.$route.fullPath
      const isCurrent = () => version === this.callbackVersion && this.$route.fullPath === callbackPath
      // 微信将 code 放在 # 之前；hash 路由 query 只包含 # 之后的参数。
      // 优先使用本次 OAuth 回跳的 search 参数，保留其他渠道的 hash 参数。
      const allQuery = { ...this.$route.query }
      new URLSearchParams(window.location.search).forEach((value, key) => {
        allQuery[key] = value
      })

      try {
        channelUserIdUtil.clearChannelUserId()
        const res = await getChannelUserId(allQuery)
        if (!isCurrent()) return
        if (typeof res !== 'string' || !res.trim() || ['undefined', 'null'].includes(res.trim())) {
          throw new Error('获取用户信息失败')
        }

        const payWay = wayCodeUtils.getPayWay()
        if (!payWay || !payWay.routeName) throw new Error('无法识别支付方式')
        channelUserIdUtil.setChannelUserId(res)
        // 回跳 code 只能使用一次，返回时不应再次交换。
        this.$router.replace({ name: payWay.routeName })
      } catch (error) {
        if (!isCurrent()) return
        this.$router.replace({
          name: config.errorPageRouteName,
          query: { errInfo: (error && (error.msg || error.message)) || '获取用户信息失败' }
        })
      }
    }
  }
}
</script>
