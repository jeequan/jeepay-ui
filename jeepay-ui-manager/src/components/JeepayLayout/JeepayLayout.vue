<!-- eslint-disable vue/no-mutating-props -->
<template>
  <!-- 2024-09-03 由pro-layout 改为ant原本layout实现 -->
  <a-layout style="overflow: hidden; height: 100vh">
    <!-- 左侧路由菜单栏 , 当宽度小于992时，隐藏固定在左侧的路由，该为抽屉弹窗 -->
    <!-- :collapsed-width="vdata.broken ? 0 : props.collapsedWidth" -->
    <a-layout-sider
      v-if="!vdata.broken"
      key="external"
      v-model:collapsed="vdata.collapsed"
      collapsible
      :trigger="null"
      :theme="props.navTheme"
      :width="!vdata.collapsed ? props.siderWidth : props.collapsedWidth"
      class="jeepay-menu"
    >
      <!-- logo部分插槽 -->
      <div class="sider-header">
        <slot name="menuHeaderRender">
          <div class="logo" />
        </slot>
      </div>

      <a-menu
        v-model:openKeys="props.openKeys"
        v-model:selectedKeys="props.selectedKeys"
        :theme="props.navTheme"
        mode="inline"
      >
        <!-- :inline-collapsed="vdata.collapsed" -->
        <template v-for="firstRoute in props.menuData" :key="firstRoute.path">
          <!-- 无子节点 -->
          <template
            v-if="
              (!firstRoute.children || firstRoute.children.length === 0) &&
              !firstRoute.meta.hideInMenu &&
              firstRoute.meta.icon
            "
          >
            <a-menu-item
              :key="firstRoute.path"
              class="no-child"
              @click="menuHandle(firstRoute.path)"
            >
              <template #icon>
                <component :is="firstRoute.meta.icon" style="font-size: 16px" />
              </template>
              {{ firstRoute.meta.title }}
            </a-menu-item>
          </template>

          <!-- 有子节点 -->
          <template v-else>
            <sub-menu :key="firstRoute.key" :menu-info="firstRoute" />
          </template>
        </template>
      </a-menu>

      <!-- 菜单栏底部功能区 -->
      <div class="sider-footer">
        <slot name="menuFooterRender" />
      </div>
    </a-layout-sider>

    <!-- 抽屉，992以下时会出现  -->
    <a-drawer
      v-model:open="vdata.open"
      :closable="false"
      placement="left"
      :mask-closable="true"
      :width="props.siderWidth"
      class="jeepay-drawer"
      :body-style="{ padding: 0, height: '100vh', overflow: 'hidden' }"
      @close="closeHandle"
    >
      <a-layout-sider
        key="internal"
        :trigger="null"
        :theme="props.navTheme"
        class="jeepay-menu"
        :width="props.siderWidth"
      >
        <!-- logo部分插槽 -->
        <div style="padding: 25px">
          <slot name="menuHeaderRender">
            <div class="logo" />
          </slot>
        </div>

        <a-menu
          v-model:openKeys="props.openKeys"
          v-model:selectedKeys="props.selectedKeys"
          :theme="props.navTheme"
          mode="inline"
          class="drawer-menu"
        >
          <template v-for="firstRoute in props.menuData" :key="firstRoute.path">
            <!-- 无子节点 -->
            <template
              v-if="
                (!firstRoute.children || firstRoute.children.length === 0) &&
                !firstRoute.meta.hideInMenu
              "
            >
              <a-menu-item
                :key="firstRoute.path"
                style="padding-left: 5px"
                class="no-child"
                @click="menuHandle(firstRoute.path)"
              >
                <template #icon>
                  <component :is="firstRoute.meta.icon" style="font-size: 16px" />
                </template>
                {{ firstRoute.meta.title }}
              </a-menu-item>
            </template>

            <!-- 有子节点 -->
            <template v-else>
              <!-- sub-menu 递归组件，子节点还存在子节点会一直递归下去 -->
              <sub-menu :key="firstRoute.key" :menu-info="firstRoute" />
            </template>
          </template>
        </a-menu>

        <!-- 菜单栏底部功能区 -->
        <div class="sider-footer">
          <slot name="menuFooterRender" />
        </div>
      </a-layout-sider>
    </a-drawer>

    <!-- 右侧内容展示区 -->
    <a-layout :style="{ padding: 0, position: 'relative', 'background-color': '#f0f2f5' }">
      <!-- 顶部功能区 -->
      <a-layout-header :style="{ padding: 0 }">
        <!-- 顶部功能区插槽 放刷新按钮， 页签栏， 个人中心栏等... -->
        <slot name="headerContentRender" />
      </a-layout-header>

      <!-- 页面主体区域 -->
      <a-layout-content
        style="display: flex; flex-direction: column; justify-content: space-between"
      >
        <!-- 页面主体区域默认插槽，主要就是放个router-view -->
        <slot />

        <div class="foot">
          Copyright © 2021-2025
          <a href="https://www.jeequan.com" target="_blank">计全科技</a>
          All rights reserved.
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router'
import subMenu from './SubMenu.vue'
import { reactive, watch, onMounted, onUnmounted } from 'vue'
import { debounce } from '@/utils/throttle'

const router = useRouter()

const props: any = defineProps({
  // 菜单
  menuData: { type: Array, default: () => [] },

  // 当前展开的 SubMenu 菜单项
  openKeys: { type: Array, default: () => [] },

  // 当前选中的菜单项
  selectedKeys: { type: Array, default: () => [] },

  // 菜单是否收起状态 false未折叠  true 折叠  v-model的属性
  collapsed: { type: Boolean, default: false },

  // 活跃状态， 暂时没用到？
  activeName: { type: String, default: '' },

  // 主题 dark light
  navTheme: { type: String, default: 'light' },

  // 菜单栏正常宽度
  siderWidth: { type: Number, default: 260 },

  // 菜单栏折叠宽度
  collapsedWidth: { type: Number, default: 80 },
})

console.log(props.menuData)

const emit = defineEmits(['update:collapsed', 'broken'])

type vdataType = {
  collapsed: boolean
  broken: boolean
  open: boolean
}

const vdata: vdataType = reactive({
  broken: false, // 是否处于小屏状态 true小屏   false大屏
  collapsed: false, // 折叠状态  true折叠   false未折叠
  open: false, // 抽屉开关
})

// 抽屉开关初始化 出现规则：1.屏幕宽度小于992px   2.未折叠
vdata.open = vdata.broken && !vdata.collapsed

// 抽屉关闭后的回掉 需要通知父组件切换折叠状态
const closeHandle = () => emit('update:collapsed', true)

// 监听折叠状态发生变化
watch(
  () => props.collapsed,
  (newVal) => {
    vdata.collapsed = newVal

    // 当小于992时，展开抽屉
    if (vdata.broken && !newVal) {
      emit('update:collapsed', false)
      vdata.open = true
    }
  }
)

// 路由跳转
const menuHandle = (path: string) => router.push({ path })

// 监听窗口变化 当浏览器宽度小于992px时，隐藏固定的菜单栏， 展开抽屉
const handleResize = debounce(() => {
  // broken(小于992 true  大于false)
  vdata.broken = window.innerWidth <= 992

  emit('broken', vdata.broken)

  // 小于992 并且，未折叠状态下， 展开抽屉
  vdata.open = !vdata.collapsed && window.innerWidth <= 992
}, 50)

onMounted(() => {
  handleResize() // 默认调用一次
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped lang="less">
:deep(.ant-layout-sider-light) {
  background: #f7f8fa;
}

.sider-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  overflow: hidden;
}

/*
  菜单栏部分
*/
:deep(.jeepay-menu) {
  height: 100%;
  position: relative;

  .ant-menu-inline {
    border-right: none;
  }

  .ant-menu-root {
    padding: 0 15px;
    background-color: transparent;

    /*
      ant-d-vue menu子节点与父节点相差24px 太大， 改为父子节点相差16px
    */
    // 不存在子节点的一级路由
    .no-child {
      padding-left: 16px !important;
    }

    // 一级路由
    & > .ant-menu-submenu .ant-menu-submenu-title {
      padding-left: 16px !important;
    }

    // 不存在子节点的二级路由
    & > .ant-menu-submenu .ant-menu-item {
      padding-left: 32px !important;
    }

    // 有子节点的二级路由
    & > .ant-menu-submenu .ant-menu-submenu .ant-menu-submenu-title {
      padding-left: 32px !important;
    }

    // 不存在子节点的三级路由
    & > .ant-menu-submenu .ant-menu-submenu .ant-menu-item {
      padding-left: 48px !important;
    }
  }

  .ant-menu-root {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;

    /* 滚动条整体样式 */
    &::-webkit-scrollbar {
      border-radius: 10px; /* 滑块的边角圆滑度 */
      width: 6px; /* 这实际上控制的是滚动条整体区域的宽度，而非滚动条的“滑块” */
      height: 1px; /* 对于水平滚动条，这个值可能不重要，但保持一致性 */
    }

    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
      background: #d0d2d4; /* 滑块的颜色 */
      border-radius: 20px; /* 滑块的边角圆滑度 */
    }

    /* 滚动条轨道 */
    &::-webkit-scrollbar-track {
      background: transparent; /* 轨道的颜色 */
    }
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;

    padding: 0;
  }
}

/* 同时，可能需要调整子菜单的列表项的内边距或外边距来确保整体布局的美观 */
.ant-menu-vertical .ant-menu-item,
.ant-menu-vertical .ant-menu-submenu-title {
  margin-left: 12px !important; /* 如果需要，可以调整这个值 */
}

/*
  抽屉部分
*/
:deep(.jeepay-drawer) {
  padding: 0;

  :deep(.ant-drawer-body) {
    padding: 0;
  }
}

.foot {
  padding: 50px 0 30px;
  text-align: center;
}

:deep(.ant-menu-submenu-popup) {
  .ant-menu-item {
    display: flex;
    align-items: center;
  }
}
</style>
