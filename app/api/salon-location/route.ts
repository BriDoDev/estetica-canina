import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('landing_config')
    .select('value')
    .eq('key', 'salon_location')
    .single()

  const defaults = { lat: 19.1862, lng: -98.9477, radiusKm: 1.5, name: 'San Salvador Cuauhtenco' }
  return NextResponse.json(data?.value ?? defaults)
}
