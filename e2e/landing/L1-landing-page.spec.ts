/**
 * FLOW-L1: Landing Page Navigation
 * Verify all sections render correctly with CMS content
 */
import { test, expect } from '@playwright/test'

test.describe('FLOW-L1: Landing Page', () => {
  test('renders hero section with title and CTAs', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Agendar cita').first()).toBeVisible()
  })

  test('renders services section', async ({ page }) => {
    await page.goto('/')
    const servicesSection = page.locator('#services, section').filter({ hasText: /Baño|Corte|Grooming|Spa/ })
    await expect(servicesSection.first()).toBeVisible({ timeout: 15000 })
  })

  test('renders testimonials section', async ({ page }) => {
    await page.goto('/')
    const testimonialsSection = page.locator('section').filter({ hasText: /reseñas|clientes|testimonio/i })
    await expect(testimonialsSection.first()).toBeVisible({ timeout: 15000 })
  })

  test('renders booking section', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Agenda tu cita').first()).toBeVisible()
  })

  test('renders footer', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('page has correct metadata', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Paws & Glow|Estética Canina/)
    const meta = page.locator('meta[name="description"]')
    await expect(meta).toHaveAttribute('content', /estética canina/i)
  })
})
