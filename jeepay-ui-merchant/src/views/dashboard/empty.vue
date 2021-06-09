<template>
  <div class="empty">
    <img src="@/assets/svg/empty.svg" alt="" style="width:100px;">
    <p style="padding-right:5px;">暂无数据</p>
  </div>
</template>

<script>
export default {
  name: 'Empty'
}
</script>

<style scoped lang="less">
  .empty {
    width: 100%;
    height:300px; // 与环状图一个高度
    display: flex;
    justify-content:center;
    align-items: center;
    flex-direction: column;
    text-align:center;
  }
</style>
