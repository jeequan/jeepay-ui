const { test, expect } = require('@playwright/test')

test('cashier OAuth browser regression suite', async ({ page }) => {
  test.setTimeout(60000)
  await page.goto('/tests/oauth-callback.html')
  await page.getByRole('button', { name: 'Run tests' }).click()
  await expect(page.getByRole('button', { name: 'Run tests' })).toBeEnabled({ timeout: 50000 })
  await page.screenshot({ path: 'test-results/oauth-browser.png', fullPage: true })
  await expect(page.locator('#results')).toContainText('15/15 passed')
  await expect(page.locator('#results')).not.toContainText('FAIL')
})
