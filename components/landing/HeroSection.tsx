'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Calendar } from 'lucide-react'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

function PawPrintDecor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="currentColor">
      <ellipse cx="50" cy="75" rx="22" ry="18" />
      <ellipse cx="25" cy="52" rx="10" ry="13" transform="rotate(-15 25 52)" />
      <ellipse cx="75" cy="52" rx="10" ry="13" transform="rotate(15 75 52)" />
      <ellipse cx="38" cy="38" rx="9" ry="12" transform="rotate(-5 38 38)" />
      <ellipse cx="62" cy="38" rx="9" ry="12" transform="rotate(5 62 38)" />
    </svg>
  )
}

export function HeroSection({
  title = 'Tu mascota merece brillar ✨',
  subtitle = 'Estética canina de alto nivel con diagnóstico por inteligencia artificial. Analizamos a tu mascota y te recomendamos el cuidado perfecto. Resultados que se ven y se sienten.',
  ctaPrimary = 'Agendar cita',
  ctaSecondary = 'Ver servicios',
}: HeroSectionProps) {
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#fafaf8]">
      {/* Decorative paw prints */}
      <PawPrintDecor className="pointer-events-none absolute top-16 left-8 h-12 w-12 rotate-12 text-accent/40" />
      <PawPrintDecor className="pointer-events-none absolute top-32 right-16 h-8 w-8 -rotate-20 text-amber-200/60" />
      <PawPrintDecor className="pointer-events-none absolute bottom-24 left-1/4 h-10 w-10 rotate-45 text-accent/30" />
      <PawPrintDecor className="pointer-events-none absolute right-8 bottom-40 h-14 w-14 -rotate-12 text-warning/40" />
      <PawPrintDecor className="pointer-events-none absolute top-1/2 left-4 h-6 w-6 rotate-30 text-accent/30" />

      {/* Soft blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 -right-1/4 h-[700px] w-[700px] rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2">
        {/* Text content */}
        <div className="space-y-7">
          <Badge
            variant="secondary"
            className="border-none bg-[#FFDAD6] px-3 py-1 text-[#4A1E1E]"
          >
            <Sparkles className="mr-1.5 h-3 w-3" />
            IA Vision para tu mascota
          </Badge>

          <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-foreground lg:text-6xl">
            {title}
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="w-full gap-2 shadow-lg shadow-primary/20 sm:w-auto"
              style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }}
            >
              <Calendar className="h-4 w-4" />
              {ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToServices}
              className="w-full gap-2 border-border text-foreground hover:bg-muted sm:w-auto"
            >
              {ctaSecondary}
            </Button>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { value: '500+', label: 'mascotas atendidas' },
              { value: '4.9★', label: 'calificación' },
              { value: '3 años', label: 'de experiencia' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-extrabold text-primary">{stat.value}</span>
                <span className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dog image */}
        <div className="relative flex items-center justify-center">
          {/* Decorative ring */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[440px] w-[440px] rounded-full border-2 border-dashed border-accent/40" />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[380px] w-[380px] rounded-full bg-accent/20" />
          </div>

          <div className="relative h-[360px] w-[320px] overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-primary/20 lg:h-[400px] lg:w-[360px]">
            <Image
              src="/images/hero-dog.png"
              alt="Perro feliz después de su sesión de grooming en Paws & Glow"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 320px, 360px"
            />
          </div>

          {/* Floating IA badge */}
          <div className="absolute top-4 right-0 flex items-center gap-2 rounded-2xl border border-accent/30 bg-white px-4 py-2 shadow-lg shadow-accent/30 lg:right-4">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">IA Vision ✨</span>
          </div>

          {/* Floating paw badge */}
          <div className="absolute bottom-6 left-0 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 shadow-lg shadow-amber-100 lg:-left-4">
            <span className="text-lg">🐾</span>
            <div>
              <p className="text-xs font-bold text-amber-800">Premium Grooming</p>
              <p className="text-xs text-amber-600">Cuidado con amor</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
