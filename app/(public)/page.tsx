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
  const { data } = await supabase
    .from('landing_config')
    .select('value')
    .eq('key', 'hero')
    .single()

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

      <section id="booking" className="py-24 bg-[#fafaf8]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              🐾 Reserva tu turno
            </p>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              Agenda tu cita
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
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
