<template>
  <div class="center">
    <img src="../assets/icon/error.svg" alt="">
<!--    <p>支付失败，请重新扫码进入！</p>-->
    <p>错误: {{msg}}</p>
  </div>
</template>

<script>

// 分发器页面，  用户扫码后进入的第一个页面：
// 判断是否存在channelUserId, 如果存在则直接跳到 对应的支付页面，如果不存在则重定向到对应的页面。
export default {
  data () {
    return {
        msg: "请重新扫码进入！",
    }
  },
  components: {

  },
  mounted() {
    this.msg = this.$route.params.errInfo || '请重新扫码进入！'
  }
}
</script>
<style lang="css" scoped>
  .center {
    margin-top:30%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  p {
    font-size: 36px;
    margin-top: 50px;
  }
</style>
