<template>
  <pro-layout
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :i18nRender="false"
    v-bind="settings"
    :breadcrumbRender="handleBreadcrumbRender"
  >
    <!-- 1.0.0+ 版本 pro-layout 提供 API，
          我们推荐使用这种方式进行 LOGO 和 title 自定义
    -->
    <template v-slot:menuHeaderRender>
      <div>
        <!-- 当侧边栏卷起来的时候，切换仅有J字母的图标 -->
        <img src="@/assets/logo-j.svg" alt="jeequan">
        <!-- 在这里可以添加title，我们以图片的方式替代文字 -->
        <img v-show="!collapsed" src="@/assets/svg/jeepay.svg" alt="jeepay" style="width:90px;margin: 5px 0 0 5px">
      </div>
    </template>
    <!-- 1.0.0+ 版本 pro-layout 提供 API,
          增加 Header 左侧内容区自定义
    -->
    <template v-slot:headerContentRender>
      <div class="ant-pro-global-header-trigger" @click="routeReload()">
        <a-tooltip title="刷新页面">
          <a-icon type="reload" style="font-size: 18px;cursor: pointer;" />
        </a-tooltip>
      </div>
    </template>

    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>
    <!-- custom footer / 自定义Footer -->
    <template v-slot:footerRender>
      <global-footer />
    </template>
    <router-view v-if="isRouterAlive"/>
  </pro-layout>
</template>

<script>
// import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { mapState } from 'vuex'

import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import appConfig from '@/config/appConfig'

export default {
  name: 'BasicLayout',
  components: {
    // SettingDrawer,
    RightContent,
    GlobalFooter
  },
  data () {
    return {
      isRouterAlive: true,
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end

      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: appConfig.APP_TITLE,
      settings: {
        // 布局类型
        layout: 'sidemenu', // 'sidemenu', 'topmenu'
        contentWidth: 'Fluid', // Fixed , Fluid  内容区布局： 固定  | 流式
        theme: 'light', // 主题 'dark' | 'light'
        // 主色调
        primaryColor: '#1a53ff', // 默认主题色, 如果修改颜色不生效，请清理 localStorage
        fixedHeader: false, // 固定 Header
        fixSiderbar: true, // 固定左侧菜单栏
        colorWeak: false, // 色盲模式将
        hideHintAlert: false,
        hideCopyButton: false
      },
      // 媒体查询
      query: {},

      // 是否手机模式
      isMobile: false
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: state => state.asyncRouter.addRouters
    })
  },
  created () {
    const routes = this.mainMenu.find(item => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    // this.$watch('collapsed', () => {
    //   this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    // })
    // this.$watch('isMobile', () => {
    //   this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    // })
  },
  mounted () {
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    // if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
    //   updateTheme(this.settings.primaryColor)
    // }
  },
  methods: {
    handleMediaQuery (val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
      }
    },
    handleCollapse (val) {
      this.collapsed = val
    },
    handleBreadcrumbRender (rrr) {
      if (rrr.route.path.startsWith('/ENT')) {
        return <span>{rrr.route.breadcrumbName}</span>
      }
      return <router-link to={rrr.route.path || '/'}><span>{rrr.route.breadcrumbName}</span></router-link>
    },
    routeReload () { // 刷新页面函数
      this.isRouterAlive = false
      this.$nextTick(() => { this.isRouterAlive = true })
    }
  }
}
</script>

<style lang="less">
@import "./BasicLayout.less";
</style>
