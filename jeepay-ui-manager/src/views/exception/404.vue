<template>
  <div class="result-err">
    <img src="~@/assets/svg/404.svg" alt="">
    <div>
      抱歉，您访问的页面不存在。
    </div>
    <a-button type="primary" @click="toHome" style="margin-top:30px">
      返回首页
    </a-button>
  </div>
</template>

<script>
export default {
  name: 'Exception404',
  methods: {
    toHome () {
      this.$router.push({ path: '/' })
    }
  }
}
</script>
