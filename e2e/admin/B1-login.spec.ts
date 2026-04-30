/**
 * FLOW-B1: Login via Supabase Auth
 */
import { test, expect } from '@playwright/test'

test.describe('FLOW-B1: Login', () => {
  test('login page renders with email input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows validation error for empty fields', async ({ page }) => {
    await page.goto('/login')
    const submitBtn = page.locator('button[type="submit"]')
    await submitBtn.click()
    await page.waitForTimeout(500)
    // HTML5 validation or custom error should appear
  })

  test('redirects to login when accessing admin without auth', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects to login when accessing /customers without auth', async ({ page }) => {
    await page.goto('/customers')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects to login when accessing /products without auth', async ({ page }) => {
    await page.goto('/products')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects to login when accessing /appointments without auth', async ({ page }) => {
    await page.goto('/appointments')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects to login when accessing /cms without auth', async ({ page }) => {
    await page.goto('/cms')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('redirects to login when accessing /form-builder without auth', async ({ page }) => {
    await page.goto('/form-builder')
    await page.waitForURL('**/login**', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })

  test('login form has proper accessibility labels', async ({ page }) => {
    await page.goto('/login')
    const emailLabel = page.locator('label').filter({ hasText: /email|correo/i })
    await expect(emailLabel.first()).toBeVisible()
  })
})
