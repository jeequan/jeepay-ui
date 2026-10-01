import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Keep component tests independent of application plugins and API environment.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    pool: 'forks',
    maxWorkers: 1,
    fileParallelism: false,
    include: ['tests/**/*.test.js'],
  },
})
