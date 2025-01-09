<template>
  <jeepayLayout
    v-model:openKeys="vdata.openKeys"
    v-model:selectedKeys="vdata.selectedKeys"
    v-model:collapsed="proLayoutObject.collapsed"
    layout="side"
    :active-name="route.path"
    :nav-theme="vdata.theme"
    :sider-width="260"
    :menu-data="vdata.menuData"
    is-mobile="true"
    :collapsed-button-render="false"
    :collapsed-width="80"
    @broken="(e) => (vdata.broken = e)"
  >
    <router-view v-if="vdata.isRouterAlive" />

    <!-- 菜单头部渲染插槽 -->
    <template #menuHeaderRender>
      <router-link :to="{ path: '/' }" style="display: flex; align-items: center">
        <div v-if="!proLayoutObject.collapsed">
          <img src="@/assets/logo-j.svg" alt="jeequan" />
          <img
            src="@/assets/svg/jeepay.svg"
            alt="jeepay"
            style="width: 90px; margin: 5px 0 0 5px"
          />
        </div>
        <div v-else><img src="@/assets/logo-j.svg" alt="jeequan" /></div>
      </router-link>
    </template>

    <!-- 自定义顶部内容， 包括刷新按钮，面包屑 -->
    <template #headerContentRender>
      <!-- 最顶部header的宽度： 小屏时，菜单栏改为抽屉浮动，所以直接撑满100vh, 大屏时要根据折叠状态减80或260 -->
      <div
        class="customhead"
        :style="{
          width: `calc(100vw - ${vdata.broken ? '0px' : proLayoutObject.collapsed ? '90px' : '270px'})`,
        }"
      >
        <div class="refash">
          <!-- 收起菜单栏 -->
          <MenuUnfoldOutlined
            v-if="proLayoutObject.collapsed"
            class="icon-style"
            @click="proLayoutObject.collapsed = false"
          />
          <!-- 展开菜单栏 -->
          <MenuFoldOutlined v-else class="icon-style" @click="proLayoutObject.collapsed = true" />

          <!-- 刷新按钮 -->
          <ReloadOutlined
            :class="{ 'icon-rotate': vdata.isRouterAlive }"
            class="icon-style"
            @click="clickRefsh"
          />
          <!-- 回到首页 -->
          <homeOutlined
            key="layout-main"
            :style="{ color: route.name === 'ENT_C_MAIN' ? '#409eff' : '#36454d' }"
            class="icon-style icon-main"
            @click="toMain"
          />

          <a-breadcrumb style="margin-left: 20px">
            <template v-for="(item, index) in vdata.matchList" :key="index">
              <a-breadcrumb-item>{{ item.meta.title }}</a-breadcrumb-item>
            </template>
          </a-breadcrumb>
        </div>

        <!-- 个人信息部分 -->
        <div style="display: flex; align-items: center">
          <a-button @click="openUrl('https://www.jeequan.com/ifstore/list.html')">
            接口市场
          </a-button>
          <a-button
            @click="openUrl('https://www.jeequan.com/product/jeepay4plus.html')"
            style="margin: 0 10px"
          >
            Plus商业版
          </a-button>

          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="userInfo">
                  <setting-outlined style="margin-right: 10px" />
                  <span style="cursor: hand">个人信息</span>
                </a-menu-item>
                <a-menu-item @click="logout">
                  <LogoutOutlined style="margin-right: 10px" />
                  <span style="cursor: hand">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
            <div class="self-info">
              <a-avatar shape="square" class="square" :src="userStore.userInfo.avatarUrl" />
              <span>{{ userStore.userInfo.realname }}</span>
              <caret-down-outlined style="margin-left: 5px" />
            </div>
          </a-dropdown>
        </div>
      </div>
    </template>
  </jeepayLayout>
</template>
<script lang="ts" setup>
import { useRouter, useRoute, createRouterMatcher } from 'vue-router'
import { reactive, computed, watchEffect, nextTick, getCurrentInstance } from 'vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { generatorDynamicRouter } from '@/router/generator-routers'
import { useUserStore } from '@/store/modules/user'

const { $infoBox, $access, $hasAgentEnt } = getCurrentInstance()!.appContext.config.globalProperties

// store对象
const userStore = useUserStore()

const route = useRoute()

const router = useRouter()

const proLayoutObject = reactive({
  collapsed: false,
})

const vdata: any = reactive({
  broken: false, // 页面宽度是否小于992 true小屏   false大屏

  selectedKeys: [],
  openKeys: [],
  // default
  collapsed: false,

  layout: 'side',
  theme: 'light',
  menuData: [],
  //刷新
  isRouterAlive: true,
  isSpin: false,
  siteInfo: '',
})

//个人信息页
function userInfo() {
  router.push({
    path: '/current/userinfo',
  })
}

// 登出函数
function logout() {
  $infoBox.confirmDanger(
    '是否退出登录？',
    `你好${userStore.userInfo['realname']}确认退出登录吗？`,
    () => {
      userStore.logout()
    }
  )
}

// 递归面包屑对象，获取面包屑数组
const matchHandle = (currentMatch) => {
  vdata.matchList.unshift(currentMatch.record)

  if (currentMatch.parent) {
    matchHandle(currentMatch.parent)
  }
}

// menu对象信息
generatorDynamicRouter().then((resRouter: any) => {
  // 过滤掉系统通用菜单
  vdata.menuData = resRouter[0].children.filter(
    (item) => item.name != 'ENT_COMMONS' && item.name != 'ENT_C_USERINFO'
  )

  vdata.routerMatch = createRouterMatcher(vdata.menuData, {})
})

watchEffect(() => {
  if (vdata.routerMatch) {
    // 根据当前路由的name 获取整体面包屑对象
    vdata.matchList = []
    const currentMatch = vdata.routerMatch.getRecordMatcher(route.name)

    // 递归面包屑对象，获取面包屑数组
    if (currentMatch) {
      matchHandle(currentMatch)
    }

    // 获取当前访问的路由，用于左侧菜单列表的展示
    if (vdata.matchList.length > 0) {
      vdata.selectedKeys = vdata.matchList.map((r) => r.path)
      vdata.openKeys = vdata.matchList.map((r) => r.path)
    }
  }
  vdata.routeName = route.meta.title
})

// 回主页
function toMain() {
  router.push({
    path: '/main',
  })
}

const breadcrumb = computed(() =>
  router.currentRoute.value.matched.concat().map((item) => {
    return {
      path: item.path,
      breadcrumbName: item.meta.title || '',
    }
  })
)

function openUrl(url) {
  window.open(url, '_blank')
}

const handleCollapsed = () => {
  vdata.collapsed = !vdata.collapsed
}

const clickRefsh = () => {
  vdata.isSpin = true
  vdata.isRouterAlive = false
  nextTick(() => {
    vdata.isRouterAlive = true
  })
  vdata.isSpin = false
}
</script>

<style scoped lang="less">
:deep(.ant-pro-global-header-layout-side) {
  background-color: transparent;
  box-shadow: none;
  padding: 25px 25px;
}
// 路由名称
.router-name {
  display: inline-block;
  margin-right: 15px;
  color: #000;
  font-size: 20px;
}

// 图标部分
.refash {
  display: flex;
  align-items: center;
  justify-self: center;
  height: 100%;

  .icon-style {
    flex: 1;

    line-height: 56px;
    display: inline-block;
    height: 100%;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
    padding: 0 20px;

    &:hover {
      color: #000 !important;
    }
  }

  .icon-main {
    border-right: 1px solid #eee;
    border-left: 1px solid #eee;
  }
}
.customhead {
  background-color: #fff;
  z-index: 9;

  position: fixed;
  top: 0;
  right: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  height: 56px;

  // 页签， 撑满剩余部分
  .tabs {
    flex: 1;

    display: flex;
    justify-content: flex-start;
  }
}

// 个人信息
.self-info {
  display: flex;
  align-items: center;
  align-items: center;

  height: 56px;
  padding: 0 20px;
  border-left: 1px solid #eee;

  &:hover {
    cursor: pointer;
  }

  .square {
    margin-right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    &:hover {
      cursor: pointer;
    }
  }
}

// 刷新图标旋转
.icon-rotate {
  animation: rotateAnimation 0.3s linear; /* 动画名称、时长和速度曲线 */
}
/* 定义旋转动画 */
@keyframes rotateAnimation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.customfoot {
  padding: 10px 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>

<style lang="less">
.ant-menu {
  background: transparent;
}

.ant-layout-sider-children {
  //导航整体的右侧新增一条border
  border-right: 1px solid #08174212;
  background: transparent;
  padding-bottom: 30px;
}
.ant-layout-sider-light {
  //亮色模式下整体的背景色
  background: @background-color;
}

.ant-menu-inline-collapsed {
  //收起状态下，导航内容区域两侧的padding变小
  padding: 0 10px !important;
}
.ant-menu-submenu-title {
  //使导航在收起状态下，带有子item的一级菜单的图标居中
  margin: 0 auto;
}
.ant-menu-item {
  margin: 0 auto !important; //使导航在收起状态下，没有子item的一级菜单图标居中
  border-radius: 3px;
  &:hover {
    background: @primary-glass; //导航item的hover样式
  }
}
.ant-menu-sub.ant-menu-inline > .ant-menu-item {
  //二级导航item的上下边距
  margin: 5px 0 !important;
}
.ant-menu-vertical.ant-menu-sub {
  //收起状态下，子菜单的容器padding
  padding: 5px;
}
.ant-menu-dark .ant-menu-inline.ant-menu-sub {
  //暗色模式下，子菜单背景颜色调整
  background: #001529;
}
.ant-menu-sub.ant-menu-inline {
  //亮色模式下，子菜单背景颜色调整
  background-color: @background-color;
}

.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  //选中状态下的item的样式
  background-color: var(--ant-primary-color) !important;
  color: #fff !important;
  border-radius: 3px;
  & a:hover {
    color: #fff !important;
  }
}
.ant-menu-item-selected a {
  //选中状态下的文字颜色继承父元素
  color: inherit !important;
}
.ant-menu-item .ant-menu-item-icon + span {
  //去掉文字变色的延迟动画效果
  transition: 0s;
}
.ant-menu-vertical .ant-menu-item::after,
.ant-menu-vertical-left .ant-menu-item::after,
.ant-menu-vertical-right .ant-menu-item::after,
.ant-menu-inline .ant-menu-item::after {
  //取消选中状态下item右侧的蓝色方条
  content: none;
}

//header样式
.ant-layout-header {
  background-color: transparent;
  height: auto !important;
  width: 100%;
  padding: 25px 0 !important;
  line-height: inherit !important;
}

aside {
  max-width: 300px;
}

aside::before {
  // content: '';
  position: absolute;
  background-color: @jee-theme;
  width: 10px;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 99;
}

/*
  菜单栏底部  亮色与暗色
*/
.menu-footer-box {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  padding: 16px 16px 20px;
  border-top: 1px solid #eff1f4;

  .menu-footer {
    box-sizing: border-box;
    padding: 8px 20px;

    border: 1px solid #eff0f2;
    cursor: pointer;
    border-radius: 8px;
    background: #eff0f2;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #535454;
    transition: 0.3s ease;
    margin-bottom: 16px;
    &:hover {
      border: 1px dashed var(--ant-primary-color);
      color: var(--ant-primary-color);
      background: @primary-glass;
    }
    .bi-circle-half {
      transform: rotate(45deg);
      transition: 0.2s ease;
    }
    span {
      font-weight: normal;
      font-size: 14px;
      letter-spacing: 0.05em;
      text-align: left;
      margin-left: 8px;
      transition: 0.2s ease;
    }
  }

  .version {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid #eff1f4;

    .label {
      color: rgba(0, 0, 0, 0.5);
    }
  }
}

.menu-footer-box-dark {
  border-top: 1px solid #a6adb4;

  .menu-footer {
    background: rgba(235, 238, 242, 0);
    border: 1px dashed #4d5c6a;
    color: #fff;
    .bi-circle-half {
      transform: rotate(225deg);
    }
    .verson p span {
      color: #ffffff;
    }
  }

  .version {
    border-top: 1px solid #a6adb4;
    color: #fff;
    .label {
      color: #fff;
    }
  }
}
</style>
<style>
.ant-layout-header {
  background-color: transparent !important;
  padding: 0 !important;
}

.ant-layout-content {
  padding: 80px 20px 20px;
  margin: 0;
  height: auto;
}

.ant-layout:first-child .ant-layout {
  /* background-color: #fff; */
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>
