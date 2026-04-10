<template>
  <div class="center">
    <img src="../assets/icon/error.svg" alt="">
    <p>{{ msg }}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      msg: '请重新扫码进入！',
    }
  },
  mounted() {
    // 优先从路由参数取错误信息，刷新后 params 丢失则显示默认提示
    this.msg = this.$route.params.errInfo || this.$route.query.errInfo || '请重新扫码进入！'
  }
}
</script>
<style lang="css" scoped>
  .center {
    margin-top: 30%;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  p {
    font-size: 36px;
    margin-top: 50px;
  }
</style>
