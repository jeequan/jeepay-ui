import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return defineConfig({
    server: {
      host: true,
      port: 9226,
    },
    base: env.VITE_BASE_URL || '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    plugins: [vue()],
    css: {
      postcss: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 75,
            propList: ['*'],
          }),
        ],
      },
    },
  })
}
