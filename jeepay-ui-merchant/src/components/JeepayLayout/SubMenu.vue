<template>
  <a-sub-menu v-if="!props.menuInfo.meta.hideInMenu" :key="props.menuInfo.path">
    <template #icon>
      <component :is="props.menuInfo.meta.icon" style="font-size: 16px;" />
    </template>
    <template #title>
      {{ props.menuInfo.meta.title }}
    </template>

    <template v-for="item in props.menuInfo.children" :key="item.key">
      <template v-if="!item.children || item.children.length === 0">
        <a-menu-item :key="item.path" @click="menuHandle(item.path)">
          <template #icon>
            <component :is="item.meta.icon" style="font-size: 16px;" />
          </template>
          <div class="subMenu-title">
            {{ item.meta.title }}
            <!-- class="prompt" -->
            <div />
          </div>
        </a-menu-item>
      </template>
      <template v-else>
        <sub-menu :key="item.key" :menu-info="item" />
      </template>
    </template>
  </a-sub-menu>
</template>

<script lang="ts" setup>

import { useRouter } from 'vue-router'
import {  getCurrentInstance } from 'vue'
import { useUserStore } from '@/store/modules/user'

const { $access } = getCurrentInstance()!.appContext.config.globalProperties
const userStore = useUserStore()

const router = useRouter()

const props = defineProps({
  menuInfo: {type: Object, default: () => ({}) },
})

// 路由跳转
const menuHandle = (path: string) => router.push({ path })

</script>

<style lang="less" scoped>
.subMenu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .prompt {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #E61717;
    margin-right: 3px;
  }
}

</style>