import Image from 'next/image'
import { HeroSection } from '@/components/landing/HeroSection'
import { ServicesSection } from '@/components/landing/ServicesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { Footer } from '@/components/landing/Footer'
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { StageTag } from '@/components/landing/StageTag'
import { StageSection } from '@/components/landing/StageSection'
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
    <>
      <HeroSection
        title={hero.title}
        subtitle={hero.subtitle}
        ctaPrimary={hero.ctaPrimary}
        ctaSecondary={hero.ctaSecondary}
      />
      <ServicesSection />
      <TestimonialsSection />

      <StageSection
        n={4}
        id="agenda"
        className="bg-stage-4 relative overflow-hidden py-[72px]"
        style={{ ['--radius' as string]: '14px' }}
      >
        <div data-stage="agenda" className="mx-auto w-full max-w-[500px] px-5">
          <div className="mb-8 flex flex-col gap-3.5">
            <StageTag n={4} label="Etapa 4 · Radiante" />
            <h2 className="h2 text-ink">
              Agenda una cita
              <br />
              en 4 pasos.
            </h2>
            <p className="text-[16px] leading-[1.55] text-ink-2">
              Llena tus datos, cuéntanos de tu perro, deja que la IA recomiende el mejor corte y
              confirma. Total ~3 minutos.
            </p>
          </div>

          <div className="stage-hero">
            <Image
              src="/images/stages/dog-4-radiante.png"
              alt="Perro radiante con moño"
              width={950}
              height={580}
              className="h-auto w-full"
            />
            <span className="stage-hero__caption">¡Radiante y perfecto!</span>
          </div>

          <AppointmentForm />
        </div>
      </StageSection>

      <Footer />
    </>
  )
}
