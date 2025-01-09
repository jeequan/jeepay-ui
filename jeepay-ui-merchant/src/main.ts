import { createApp } from 'vue'
import App from './App.vue'

// 引入 antd样式表， 否则没有message提示
// import { message } from 'ant-design-vue';
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import './global.less' // global style
import infoBox from '@/utils/infoBox'

// vue路由
import router from './router'

import icons from './icons'

// 使用 pinia 替换掉 vuex
import { createPinia } from 'pinia'

import { useUserStore } from '@/store/modules/user'

import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import { VueClipboard } from '@soerenmartius/vue3-clipboard' //复制插件 https://github.com/soerenmartius/vue3-clipboard

//引入bootstrap图标库
import 'bootstrap-icons/font/bootstrap-icons.css'

const store = createPinia()

const app = createApp(App)
app.config.globalProperties.$access = function (entId) {
  let accessList = useUserStore().userInfo.entIdList

  return accessList && accessList.includes(entId)
}
app.config.globalProperties.$infoBox = infoBox

app.use(store).use(Antd).use(icons).use(router).use(VueClipboard).use(VueViewer).mount('#app')
