import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    const profileName = formData.get('ProfileName') as string

    console.log('[WhatsApp Webhook]', { from, body, profileName })

    // TODO: Implement WhatsApp message processing
    // 1. Parse customer intent (appointment confirmation, cancellation, etc.)
    // 2. Look up customer by phone number
    // 3. Update appointment status if applicable
    // 4. Send automated response via Twilio API

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
