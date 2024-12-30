<template>
  <div class="dr-wrapper">
    <MenuItem>
      <a-button type="link" @click.stop>{{ title }}</a-button>
    </MenuItem>
    <div class="dr-content">
      <slot />
    </div>
  </div>
</template>
  
  <script setup>
  import { MenuItem } from 'ant-design-vue'
  const props = defineProps({
      // 传入的数据
      title: {
          type: String,
          default: ''
      }
  })
  </script>
  
  <style lang="less" scoped>
  .dr-wrapper {
      position: relative;
  
      .dr-content {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          position: absolute;
          top: 50%;
          left: -110%;
          padding: 10px;
          transform: translateY(-40%);
          background-color: #fff;
          box-shadow: 1px 0px 5px 1px rgba(0, 0, 0, 0.1);
          border-radius: 5px;
          cursor: pointer;
  
          z-index: 10;
  
          &::after {
              content: '';
              position: absolute;
              top: 40%;
              transform: translateY(-50%);
              right: -19px;
              width: 0;
              height: 0;
              border: 10px solid #fff;
              border-top: 10px solid transparent;
              border-bottom: 10px solid transparent;
              border-right: 10px solid transparent;
          }
  
          &::before {
              content: '';
              position: absolute;
              top: 40%;
              transform: translateY(-50%);
              right: -25%;
              width: 40%;
              height: 60px;
              background-color: transparent;
              z-index: 10;
          }
      }
  }
  
  .dr-wrapper:hover .dr-content {
      display: flex;
  }
  
  .dr-content:hover {
      display: flex;
  }
  </style>