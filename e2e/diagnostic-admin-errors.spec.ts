/**
 * Diagnose backoffice navigation errors
 */
import { test } from '@playwright/test'

test.describe('Backoffice Navigation Diagnostic', () => {
  test('capture errors navigating all admin routes', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text().substring(0, 300))
    })

    // Go to login first (all admin routes redirect here)
    await page.goto('/login')
    await page.waitForTimeout(1000)

    // Navigate to login (we can at least check it loads)
    const firstError = errors.length

    // Try each admin route — they'll redirect to login but shouldn't crash
    const routes = ['/dashboard', '/appointments', '/customers', '/products', '/services', '/reviews', '/cms', '/form-builder', '/settings']
    for (const route of routes) {
      await page.goto(route)
      await page.waitForTimeout(500)
      console.log(`  ${route}: ${errors.length - firstError} new errors`)
    }

    console.log(`\nTotal errors: ${errors.length}`)
    errors.forEach(e => console.log('  ❌', e))
  })
})
