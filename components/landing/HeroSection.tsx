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
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#fafaf8]">
      {/* Decorative paw prints */}
      <PawPrintDecor className="absolute top-16 left-8 w-12 h-12 text-indigo-200/50 rotate-12 pointer-events-none" />
      <PawPrintDecor className="absolute top-32 right-16 w-8 h-8 text-amber-200/60 -rotate-20 pointer-events-none" />
      <PawPrintDecor className="absolute bottom-24 left-1/4 w-10 h-10 text-indigo-100/60 rotate-45 pointer-events-none" />
      <PawPrintDecor className="absolute bottom-40 right-8 w-14 h-14 text-amber-100/50 -rotate-12 pointer-events-none" />
      <PawPrintDecor className="absolute top-1/2 left-4 w-6 h-6 text-indigo-200/40 rotate-30 pointer-events-none" />

      {/* Soft blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-amber-100/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text content */}
        <div className="space-y-7">
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 border-none px-3 py-1"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            IA Vision para tu mascota
          </Badge>

          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {title}
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-md">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="w-full sm:w-auto gap-2 shadow-lg"
              style={{ backgroundColor: '#FF8C7A', color: '#4A1E1E' }}
            >
              <Calendar className="w-4 h-4" />
              {ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToServices}
              className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
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
                <span className="text-2xl font-extrabold text-indigo-600">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dog image */}
        <div className="relative flex items-center justify-center">
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[440px] h-[440px] rounded-full border-2 border-dashed border-indigo-200/60" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[380px] h-[380px] rounded-full bg-indigo-50/80" />
          </div>

          <div className="relative w-[320px] lg:w-[360px] h-[360px] lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/60 border-4 border-white">
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
          <div className="absolute top-4 right-0 lg:right-4 bg-white shadow-lg shadow-indigo-100 border border-indigo-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-700">IA Vision ✨</span>
          </div>

          {/* Floating paw badge */}
          <div className="absolute bottom-6 left-0 lg:-left-4 bg-amber-50 shadow-lg shadow-amber-100 border border-amber-200 rounded-2xl px-4 py-2 flex items-center gap-2">
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
