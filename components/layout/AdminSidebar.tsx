'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/admin/Icon'
import { IconSprite, type IconName } from '@/components/admin/IconSprite'
import { AdminTopbar } from './AdminTopbar'

interface NavGroup {
  label: string
  items: { href: string; icon: IconName; label: string }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { href: '/dashboard', icon: 'home', label: 'Dashboard' },
      { href: '/appointments', icon: 'calendar', label: 'Citas' },
      { href: '/customers', icon: 'users', label: 'Clientes' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/products', icon: 'cart', label: 'Productos' },
      { href: '/services', icon: 'scissors', label: 'Servicios' },
      { href: '/reviews', icon: 'sparkle', label: 'Reseñas' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/cms', icon: 'image', label: 'CMS' },
      { href: '/settings', icon: 'cog', label: 'Configuración' },
    ],
  },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="ds-sidebar h-full" style={{ width: '100%' }}>
      <div className="ds-sidebar__brand">
        <div className="ds-sidebar__brand__mark">P</div>
        <div className="min-w-0 flex-1">
          <div className="ds-sidebar__brand__name truncate">Paws &amp; Glow</div>
          <div className="ds-sidebar__brand__sub">Panel Admin</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost lg:hidden"
        >
          <Icon name="x" size="sm" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {NAV_GROUPS.map((group) => (
          <div className="ds-sidebar__group" key={group.label}>
            <div className="ds-sidebar__group__label">{group.label}</div>
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`ds-nav-item${active ? ' is-on' : ''}`}
                >
                  <Icon name={item.icon} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ paddingTop: 12, borderTop: '1px solid var(--ink-3)' }}>
        <button
          type="button"
          onClick={handleLogout}
          className="ds-nav-item w-full"
          style={{ background: 'transparent' }}
        >
          <Icon name="arrow-r" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    queueMicrotask(() => setSidebarOpen(false))
  }, [pathname])

  return (
    <div data-app="admin" className="min-h-screen">
      <IconSprite />
      <div
        className="min-h-screen p-4 lg:p-5"
        style={{
          display: 'grid',
          gridTemplateColumns: 'var(--sidebar-w) 1fr',
          gap: 16,
          background: 'var(--bg)',
        }}
      >
        {/* Desktop sidebar */}
        <div className="sticky top-5 hidden lg:block" style={{ alignSelf: 'start', height: 'calc(100vh - 40px)' }}>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="absolute top-0 bottom-0 left-0 w-[280px] p-4" style={{ background: 'var(--bg)' }}>
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>

      {/* On mobile, grid collapses to single column — hide first column */}
      <style>{`
        @media (max-width: 1023px) {
          [data-app="admin"] > div:first-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
