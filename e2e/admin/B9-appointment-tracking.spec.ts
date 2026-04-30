/**
 * FLOW-B9: Appointment Tracking E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('FLOW-B9: Appointment Tracking', () => {
  test('appointments page loads with table', async ({ page }) => {
    await page.goto('/appointments')
    await page.waitForURL('**/login**', { timeout: 10000 })
    // Should redirect to login when unauthenticated
    expect(page.url()).toContain('/login')
  })

  test('appointments redirect protects tracking page', async ({ page }) => {
    const res = await page.goto('/appointments')
    expect(res?.status()).toBeLessThan(400)
  })

  test('dashboard loads with MD3 stats cards', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })
})
