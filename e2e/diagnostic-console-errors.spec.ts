/**
 * Diagnostic: capture all console errors during full user flow
 */
import { test, expect } from '@playwright/test'

test.describe('Diagnostic: Full User Flow Console Errors', () => {
  test('capture console errors during landing page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(3000)

    console.log('=== LANDING PAGE CONSOLE ERRORS ===')
    errors.forEach((e) => console.log('  ❌', e.substring(0, 200)))
    console.log(`Total: ${errors.length} errors`)
    expect(errors.length).toBe(0)
  })

  test('capture console errors during booking form interaction', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(3000)

    // Scroll down to booking section
    await page.evaluate(() => {
      document.querySelector('#booking')?.scrollIntoView({ behavior: 'instant' })
    })
    await page.waitForTimeout(2000)

    // Try to interact with the form
    const customerName = page.locator('#customerName')
    if (await customerName.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customerName.fill('Test User')
      await page.locator('#customerEmail').fill('test@qa.com')
      await page.locator('#customerPhone').fill('+525512345678')
    }

    // Look for next/continue buttons
    const nextBtn = page.locator('button').filter({ hasText: /siguiente|continuar/i }).first()
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(1000)
    }

    console.log('=== BOOKING FORM CONSOLE ERRORS ===')
    errors.forEach((e) => console.log('  ❌', e.substring(0, 200)))
    console.log(`Total: ${errors.length} errors`)
  })

  test('capture console errors during service step', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    await page.waitForTimeout(3000)

    // Navigate through form steps
    await page.evaluate(() => {
      document.querySelector('#booking')?.scrollIntoView({ behavior: 'instant' })
    })
    await page.waitForTimeout(2000)

    // Step 1: Customer
    const customerName = page.locator('#customerName')
    if (await customerName.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customerName.fill('Test User QA')
      await page.locator('#customerEmail').fill('testuser@qa.com')
      await page.locator('#customerPhone').fill('+525512345678')
      const next1 = page.locator('button').filter({ hasText: /siguiente|continuar/i }).first()
      if (await next1.isVisible({ timeout: 3000 }).catch(() => false)) {
        await next1.click()
        await page.waitForTimeout(1000)
      }
    }

    // Step 2: Pet
    const petName = page.locator('#petName')
    if (await petName.isVisible({ timeout: 5000 }).catch(() => false)) {
      await petName.fill('Max')
      const petBreed = page.locator('#petBreed')
      if (await petBreed.isVisible()) await petBreed.fill('Golden Retriever')
      const next2 = page.locator('button').filter({ hasText: /siguiente|continuar/i }).first()
      if (await next2.isVisible({ timeout: 3000 }).catch(() => false)) {
        await next2.click()
        await page.waitForTimeout(1000)
      }
    }

    // Step 3: Service selection
    const serviceBtn = page.locator('button').filter({ hasText: /Baño|Corte|Grooming|Spa/i }).first()
    if (await serviceBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await serviceBtn.click()
      await page.waitForTimeout(500)
    }

    console.log('=== SERVICE STEP CONSOLE ERRORS ===')
    errors.forEach((e) => console.log('  ❌', e.substring(0, 200)))
    console.log(`Total: ${errors.length} errors`)
  })
})
