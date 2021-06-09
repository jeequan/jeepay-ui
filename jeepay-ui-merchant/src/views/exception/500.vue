<template>
  <div class="result-err">
    <img src="~@/assets/svg/500.svg" alt="">
    <div>
      对不起，服务器错误。
    </div>
    <a-button type="primary" @click="toHome" style="margin-top:30px">
      返回首页
    </a-button>
  </div>
</template>

<script>
export default {
  name: 'Exception500',
  methods: {
    toHome () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
