import { test, expect } from '@playwright/test'

test.describe('Auth flow', () => {
  test('sign-in page renders', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('input[type="text"], input[type="email"], input[type="tel"]').first()).toBeVisible()
  })

  test('unauthenticated users are redirected to sign-in', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/sign-in/)
  })

  test('sign-up page redirects to sign-in', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page).toHaveURL(/sign-in/)
  })
})
