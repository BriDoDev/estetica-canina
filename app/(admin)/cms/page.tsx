import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CmsEditor } from './CmsEditor'
import { Icon } from '@/components/admin/Icon'

export const dynamic = 'force-dynamic'

interface LandingConfig {
  hero?: {
    title?: string
    subtitle?: string
    ctaPrimary?: string
    ctaSecondary?: string
  }
  contact?: {
    phone?: string
    email?: string
    address?: string
  }
  hours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  }
}

export default async function CmsPage() {
  const configMap: Record<string, unknown> = {}
  let fetchError: string | null = null

  try {
    const supabase = await createClient()
    const { data: configs } = await supabase
      .from('landing_config')
      .select('*')
      .in('key', ['hero', 'contact', 'hours'])

    for (const c of configs ?? []) {
      configMap[c.key] = c.value
    }
  } catch (err) {
    console.error('[CMS]', err)
    fetchError = 'Error al cargar configuración. Mostrando defaults.'
  }

  const hero = (configMap['hero'] as LandingConfig['hero']) ?? {
    title: 'Tu mascota merece brillar ✨',
    subtitle: 'Estética canina de alto nivel con diagnóstico por inteligencia artificial.',
    ctaPrimary: 'Agendar cita',
    ctaSecondary: 'Ver servicios',
  }

  const contact = (configMap['contact'] as LandingConfig['contact']) ?? {
    phone: '+52 55 1234 5678',
    email: 'hola@pawsandglow.mx',
    address: '',
  }

  const hours = (configMap['hours'] as LandingConfig['hours']) ?? {
    weekdays: 'Lun–Vie: 9:00–19:00',
    saturday: 'Sáb: 9:00–17:00',
    sunday: 'Dom: Cerrado',
  }

  return (
    <div className="ds-stack-6" style={{ maxWidth: 760 }}>
      <header className="ds-stack-2">
        <h1 className="ds-t-d1">CMS Landing</h1>
        <p className="ds-t-body ds-t-muted">
          Edita el contenido de la página principal directamente desde aquí.
        </p>
      </header>

      {fetchError && (
        <div className="ds-alert ds-alert--warning">
          <Icon name="alert" className="ds-alert__icon" />
          <div className="ds-alert__body">
            <strong>Cargando defaults</strong>
            {fetchError}
          </div>
        </div>
      )}

      <CmsEditor
        hero={hero}
        contact={contact}
        hours={hours}
        key={JSON.stringify({ hero, contact, hours })}
      />

      <div className="ds-grid-2">
        <Link
          href="/services"
          className="ds-card group flex items-center justify-between"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="ds-avatar ds-avatar--lg ds-avatar-pet"
              style={{ borderRadius: 12 }}
            >
              <Icon name="scissors" />
            </div>
            <div>
              <p className="ds-t-d4">Servicios</p>
              <p className="ds-t-xs ds-t-muted">Gestionar servicios del landing</p>
            </div>
          </div>
          <Icon name="arrow-r" size="sm" className="ds-t-muted" />
        </Link>
        <Link
          href="/reviews"
          className="ds-card group flex items-center justify-between"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="ds-avatar ds-avatar--lg ds-avatar-pet--cream"
              style={{ borderRadius: 12 }}
            >
              <Icon name="sparkle" />
            </div>
            <div>
              <p className="ds-t-d4">Reseñas</p>
              <p className="ds-t-xs ds-t-muted">Gestionar reseñas del landing</p>
            </div>
          </div>
          <Icon name="arrow-r" size="sm" className="ds-t-muted" />
        </Link>
      </div>
    </div>
  )
}
