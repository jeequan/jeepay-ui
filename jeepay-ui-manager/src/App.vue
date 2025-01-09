<template>
  <a-config-provider :locale="zhCN">
    <a-spin :spinning="userStore.globalLoading">
      <div id="app" style="height: 100vh">
        <router-view />
      </div>
    </a-spin>
  </a-config-provider>
</template>

<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useUserStore } from '@/store/modules/user'
const userStore = useUserStore()

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
