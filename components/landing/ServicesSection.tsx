import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface ServiceItem {
  icon: string
  name: string
  description: string
  price: string
  badge?: string | null
  active?: boolean
  imageUrl?: string | null
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    icon: '🛁',
    name: 'Baño Profundo',
    description: 'Limpieza profunda con productos premium. Incluye secado y cepillado.',
    price: 'Desde $250',
    badge: 'Popular',
  },
  {
    icon: '✂️',
    name: 'Corte Profesional',
    description: 'Corte personalizado según la raza y preferencias del dueño.',
    price: 'Desde $350',
    badge: null,
  },
  {
    icon: '✨',
    name: 'Grooming Completo',
    description: 'Baño, corte, uñas, oídos y todo lo que tu mascota necesita.',
    price: 'Desde $550',
    badge: 'Recomendado',
  },
  {
    icon: '💚',
    name: 'Cuidado Especial',
    description: 'Tratamientos dermatológicos y mascarillas para pelo dañado.',
    price: 'Desde $400',
    badge: 'IA Diagnóstico',
  },
  {
    icon: '🌀',
    name: 'Deslanado',
    description: 'Remoción profesional del pelo muerto para razas de doble capa.',
    price: 'Desde $450',
    badge: null,
  },
  {
    icon: '🌟',
    name: 'Spa Canino',
    description: 'Experiencia premium: aromaterapia, masaje relajante y más.',
    price: 'Desde $700',
    badge: 'Premium',
  },
]

const badgeStyles: Record<string, string> = {
  Popular: 'bg-blue-100 text-blue-700',
  Recomendado: 'bg-indigo-100 text-indigo-700',
  'IA Diagnóstico': 'bg-violet-100 text-violet-700',
  Premium: 'bg-amber-100 text-amber-700',
}

async function getServices(): Promise<ServiceItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'services')
      .single()

    if (data?.value && Array.isArray(data.value)) {
      const items = data.value as unknown as ServiceItem[]
      return items.filter((s) => s.active !== false)
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_SERVICES
}

export async function ServicesSection() {
  const services = await getServices()

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
            🐾 Lo que ofrecemos
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Cada servicio está diseñado pensando en el bienestar y felicidad de tu
            mascota.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.name}
              className="group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-slate-100 bg-[#fafaf8] rounded-2xl overflow-hidden"
            >
              {service.imageUrl ? (
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {service.badge && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`${badgeStyles[service.badge] ?? 'bg-slate-100 text-slate-600'} border-none text-xs shadow`}
                      >
                        {service.badge}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : null}
              <CardHeader className="pb-3">
                {!service.imageUrl && (
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3 text-2xl group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                    {service.badge && (
                      <Badge
                        className={`${badgeStyles[service.badge] ?? 'bg-slate-100 text-slate-600'} border-none text-xs`}
                      >
                        {service.badge}
                      </Badge>
                    )}
                  </div>
                )}
                <CardTitle className="text-slate-800 text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>
                <p className="font-bold text-indigo-600 text-base">{service.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
