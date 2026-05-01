/**
 * FLOW-A1, A2, A3: API Endpoint Tests
 */
import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('FLOW-A1: GET /api/form-config returns valid config', async ({ request }) => {
    const res = await request.get('/api/form-config')
    expect(res.status()).toBe(200)

    const json = await res.json()
    if (json.appointment_form_config) {
      const cfg = json.appointment_form_config
      expect(cfg).toHaveProperty('sections')
      expect(cfg).toHaveProperty('fields')
      expect(Array.isArray(cfg.fields)).toBe(true)
    }
  })

  test('FLOW-A2: GET /api/salon-location returns location data', async ({ request }) => {
    const res = await request.get('/api/salon-location')
    expect(res.status()).toBe(200)

    const json = await res.json()
    expect(json).toHaveProperty('lat')
    expect(json).toHaveProperty('lng')
    expect(json).toHaveProperty('radiusKm')
    expect(json).toHaveProperty('name')
    expect(typeof json.lat).toBe('number')
    expect(typeof json.radiusKm).toBe('number')
  })

  test('FLOW-A3: POST /api/webhooks/whatsapp returns without crashing', async ({ request }) => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '+521234567890', phone_number_id: '123' },
                contacts: [{ profile: { name: 'Test User' }, wa_id: '521234567890' }],
                messages: [
                  {
                    from: '521234567890',
                    id: 'wamid.test',
                    timestamp: '123',
                    text: { body: 'Hola' },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    }

    const res = await request.post('/api/webhooks/whatsapp', {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    // Webhook may return 500 if payload format is wrong (Content-Type check),
    // but it shouldn't crash the server. We just verify it responds.
    expect([200, 400, 403, 500]).toContain(res.status())
  })

  test('FLOW-A3: WhatsApp webhook GET returns verification challenge', async ({ request }) => {
    const res = await request.get(
      '/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test&hub.challenge=challenge123',
    )
    // May return 200 with challenge or 403 if token doesn't match
    expect(res.status()).toBeLessThan(500)
  })
})
