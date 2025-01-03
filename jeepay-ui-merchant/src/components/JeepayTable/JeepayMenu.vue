<template>
  <a-dropdown :trigger="['click']" placement="bottom">
    <a-button type="link" class="ant-dropdown-link">更多<caret-down-filled /></a-button>
    <template #overlay>
      <a-menu class="selfe-cls-menu">
        <slot />
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts" setup>
</script>
<style lang="less">
.ant-btn > span + .anticon {
    margin-left: 3px;
    font-size: 12px;
}
.selfe-cls-menu{

  &::-webkit-scrollbar {
    width: 5px;
    height: 3px;
 
  }
  &::-webkit-scrollbar-thumb{
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
  }
}
</style>