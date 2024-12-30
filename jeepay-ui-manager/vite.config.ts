import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import vueJsx from '@vitejs/plugin-vue-jsx'

/*
unplugin-vue-components(实现组件按需引入）
原名为vite-plugin-components 后更名为unplugin-vue-components
*/
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default ({ mode }) => {
  // 解析env对象
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    // 定义ENV, 可全局取到
    server: {
      host: true, // 监听所有host包括局域网
      port: 8000,
    },

    base: process.env.VITE_APP_BASE_URL,

    define: {
      'process.env': process.env,
    },

    // @ --> src目录
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
        },
      ],
    },

    plugins: [
      vue(),
      vueJsx(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importLess: true, // 导入less文件， 默认为false,  若需要自定义主题必须开启此选项
          }),
        ], // 按需引入 antd 组件, 无需显示引入即可。
      }),
    ],

    // 解决：Inline JavaScript is not enabled. Is it set in your options 问题
    css: {
      postcss: {},
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/less/color.less";`,
          modifyVars: {
            '@primary-color': '#1890ff', // 全局主色
            '@link-color': '#1890ff', // 链接色
            '@success-color': '#52c41a', // 成功色
            '@warning-color': '#faad14', // 警告色
            '@primary-glass': '#2691ff26', // 半透明主题色
            '@background-color': '#F2F5F7', //light全局背景色
            '@error-color': '#f5222d', // 错误色
            '@font-size-base': '14px', // 主字号
            '@heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
            '@text-color': 'rgba(0, 0, 0, 0.65)', // 主文本色
            '@text-color-secondary': 'rgba(0, 0, 0, 0.45)', // 次文本色
            '@disabled-color': 'rgba(0, 0, 0, 0.25)', // 失效色
            '@border-radius-base': '4px', // 组件/浮层圆角
            '@border-color-base': '#d9d9d9', // 边框色
            '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // 浮层阴影
          },
          // DO NOT REMOVE THIS LINE
          javascriptEnabled: true,
        },
      },
    },
    optimizeDeps: {
      // 解决 wondiws环境 依赖变更首次加载慢的问题
      include: [
        '@vue/reactivity',
        'qrcode.vue',
        'reconnectingwebsocket',
        'ant-design-vue/es',
        'v-viewer',
        '@amap/amap-jsapi-loader',

        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/config-provider/style',
        'ant-design-vue/es/form/style',
        'ant-design-vue/es/input/style',
        'ant-design-vue/es/dropdown/style',
        'ant-design-vue/es/menu/style',
        'ant-design-vue/es/breadcrumb/style',
        'ant-design-vue/es/badge/style',
        'ant-design-vue/es/avatar/style',
        'ant-design-vue/es/card/style',
        'ant-design-vue/es/tag/style',
        'ant-design-vue/es/spin/style',
        'ant-design-vue/es/button/style',
        'ant-design-vue/es/drawer/style',
        'ant-design-vue/es/table/style',
        'ant-design-vue/es/checkbox/style',
        'ant-design-vue/es/switch/style',
        'ant-design-vue/es/tooltip/style',
        'ant-design-vue/es/row/style',
        'ant-design-vue/es/date-picker/style',
        'ant-design-vue/es/col/style',
        'ant-design-vue/es/select/style',
        'ant-design-vue/es/alert/style',
        'ant-design-vue/es/divider/style',
        'ant-design-vue/es/popover/style',
        'ant-design-vue/es/radio/style',
        'ant-design-vue/es/descriptions/style',
        'ant-design-vue/es/upload/style',
        'ant-design-vue/es/modal/style',
        'ant-design-vue/es/input-number/style',
        'ant-design-vue/es/tree/style',
        'ant-design-vue/es/tabs/style',
        'ant-design-vue/es/steps/style',
        'ant-design-vue/es/list/style',
        'ant-design-vue/es/skeleton/style',
        'ant-design-vue/es/empty/style',
        'ant-design-vue/es/cascader/style',
        'ant-design-vue/es/collapse/style',
        'ant-design-vue/es/affix/style',
        'ant-design-vue/es/space/style',
        'ant-design-vue/es/statistic/style',
        'ant-design-vue/es/image/style',
      ],
    },
  })
}
