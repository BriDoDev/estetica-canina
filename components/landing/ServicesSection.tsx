import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { StageTag } from './StageTag'
import { StageSection } from './StageSection'

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
    /* fall through to defaults */
  }
  return DEFAULT_SERVICES
}

export async function ServicesSection() {
  const services = await getServices()

  return (
    <StageSection n={2} id="servicios" className="bg-stage-2 relative overflow-hidden py-[72px]">
      <div className="mx-auto w-full max-w-[500px] px-5">
        <div className="mb-8 flex flex-col gap-3.5">
          <StageTag n={2} label="Etapa 2 · El baño" />
          <h2 className="h2 text-ink">
            Servicios pensados
            <br />
            para cada pelaje.
          </h2>
          <p className="text-[16px] leading-[1.55] text-ink-2">
            Desde un baño express hasta un día completo de spa. Todos incluyen revisión rápida de
            oídos y almohadillas.
          </p>
        </div>

        <div className="stage-hero">
          <Image
            src="/images/stages/dog-2-bano.png"
            alt="Perro en el baño con burbujas"
            width={950}
            height={580}
            className="h-auto w-full"
          />
          <span className="stage-hero__caption">Listo para el baño</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-paper grid items-center gap-3.5 rounded-[14px] p-4.5"
              style={{ gridTemplateColumns: '44px 1fr auto', padding: 18 }}
            >
              <div
                className="grid h-11 w-11 place-items-center rounded-xl text-xl text-ink"
                style={{ background: 'var(--color-stage-2)' }}
              >
                {service.icon}
              </div>
              <div className="leading-tight">
                <h3 className="text-[16px] font-medium text-ink" style={{ marginBottom: 2 }}>
                  {service.name}
                </h3>
                <p className="m-0 text-[12.5px] leading-[1.4] text-ink-3">{service.description}</p>
              </div>
              <div
                className="whitespace-nowrap pl-1 font-display text-[16px] font-medium text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {service.price.replace(/^Desde\s*/i, '')}
              </div>
            </div>
          ))}
        </div>

        <div className="process">
          <div className="eyebrow">El proceso</div>
          <h3 className="font-display text-[24px] font-medium" style={{ marginTop: 8, fontWeight: 500 }}>
            De desastre a radiante en 4 pasos.
          </h3>
          <div className="process__steps">
            <div className="process__step">
              <div className="dot s1">1</div>
              <div className="name">Desastre</div>
            </div>
            <div className="process__step">
              <div className="dot s2">2</div>
              <div className="name">Baño</div>
            </div>
            <div className="process__step">
              <div className="dot s3">3</div>
              <div className="name">Cepillado</div>
            </div>
            <div className="process__step">
              <div className="dot s4">4</div>
              <div className="name">Radiante</div>
            </div>
          </div>
        </div>
      </div>
    </StageSection>
  )
}
