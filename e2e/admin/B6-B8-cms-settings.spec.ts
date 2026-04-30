/**
 * FLOW-B6: CMS Content Editor
 * FLOW-B7: Form Builder
 * FLOW-B8: Settings
 */
import { test, expect } from '@playwright/test'

test.describe('CMS & Configuration Routes', () => {
  test('CMS route is protected', async ({ page }) => {
    await page.goto('/cms')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('Form Builder route is protected', async ({ page }) => {
    await page.goto('/form-builder')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('Settings route is protected', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('Services route is protected', async ({ page }) => {
    await page.goto('/services')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('Reviews route is protected', async ({ page }) => {
    await page.goto('/reviews')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })
})
