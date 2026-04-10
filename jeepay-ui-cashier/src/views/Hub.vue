<template>
  <div class="jump">
    <img src="@/assets/images/loading.gif" alt="" />
  </div>
</template>

<script>
import { getRedirectUrl } from '@/api/api'
import config from '@/config'

// 分发器页面：用户扫码后进入的第一个页面，获取重定向地址后跳转
export default {
  mounted() {
    const that = this
    getRedirectUrl().then(res => {
      if (res && (res.startsWith('http') || res.startsWith('/'))) {
        location.href = res
      } else {
        that.$router.push({ name: config.errorPageRouteName, params: { errInfo: '获取支付地址失败' } })
      }
    }).catch(res => {
      that.$router.push({ name: config.errorPageRouteName, params: { errInfo: res.msg || '获取支付地址异常' } })
    })
  }
}
</script>
<style lang="css" scoped>
  .jump {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
