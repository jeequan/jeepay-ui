<template>
  <a-config-provider :locale="zhCN">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const styleDom = document.createElement('style')
styleDom.textContent = `
  :root {
    --ant-primary-color: #1677ff
  }
`
// 创建全局的css变量
document.head.appendChild(styleDom)
</script>
