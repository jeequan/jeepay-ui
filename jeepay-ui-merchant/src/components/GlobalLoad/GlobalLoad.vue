<template>
  <div class="loading">
    <div>
      <a-spin size="large" />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'GlobalLoad',
    data () {
      return {}
    }
  }
</script>
<style scoped>
  .loading{
    position: fixed;
    top:0;
    left:0;
    z-index:100;
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.25);
  }
</style>
