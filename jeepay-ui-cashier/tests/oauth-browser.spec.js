const { test, expect } = require('@playwright/test')

test('cashier OAuth browser regression suite', async ({ page }, testInfo) => {
  test.setTimeout(60000)
  await page.goto('/tests/oauth-callback.html')
  await page.getByRole('button', { name: 'Run tests' }).click()
  try {
    await expect(page.getByRole('button', { name: 'Run tests' })).toBeEnabled({ timeout: 50000 })
    await expect(page.locator('#results')).toContainText('15/15 passed')
    await expect(page.locator('#results')).not.toContainText('FAIL')
  } finally {
    await page.screenshot({ path: testInfo.outputPath('oauth-browser.png'), fullPage: true })
    console.log(await page.locator('body').innerText())
  }
})
