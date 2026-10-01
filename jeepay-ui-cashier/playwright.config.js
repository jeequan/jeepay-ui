const { defineConfig } = require('@playwright/test')
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  repeatEach: 3,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:9326' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 9326 --strictPort --mode test',
    url: 'http://127.0.0.1:9326/tests/oauth-callback.html',
    reuseExistingServer: false,
  },
})
