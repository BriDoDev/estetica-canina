import { HeroSection } from '@/components/landing/HeroSection'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { Footer } from '@/components/landing/Footer'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { createClient } from '@/lib/supabase/server'

interface HeroConfig {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.from('landing_config').select('value').eq('key', 'hero').single()

  const hero = (data?.value as HeroConfig | null) ?? {}

  return (
    <main>
      <HeroSection
        title={hero.title}
        subtitle={hero.subtitle}
        ctaPrimary={hero.ctaPrimary}
        ctaSecondary={hero.ctaSecondary}
      />
      <ServicesSection />
      <TestimonialsSection />

      <section id="booking" className="bg-[#fafaf8] py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold tracking-widest text-indigo-600 uppercase">
              🐾 Reserva tu turno
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-slate-900">Agenda tu cita</h2>
            <p className="mx-auto max-w-xl text-lg text-slate-500">
              Sube la foto de tu mascota y nuestra IA te recomendará el servicio ideal.
            </p>
          </div>
          <div className="flex justify-center">
            <AppointmentForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
