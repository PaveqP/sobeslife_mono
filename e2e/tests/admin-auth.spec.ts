import { test, expect } from '@playwright/test'
import { getAdminAppBase } from './admin-base'

test.describe('Admin auth', () => {
  const admin = getAdminAppBase()

  test('admin sign-in page renders', async ({ page }) => {
    await page.goto(`${admin}/sign-in`)
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('unauthenticated admin redirected to sign-in', async ({ page }) => {
    await page.goto(`${admin}/`)
    await expect(page).toHaveURL(/\/admin\/sign-in/)
  })
})
