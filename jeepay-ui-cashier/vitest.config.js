import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig({ mode: 'test' }), defineConfig({
  test: { environment: 'jsdom', pool: 'forks', maxWorkers: 1, fileParallelism: false, include: ['tests/**/*.test.js'] },
}))
