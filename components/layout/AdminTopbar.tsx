'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/admin/Icon'
import { createClient } from '@/lib/supabase/client'

interface AdminTopbarProps {
  onMenuClick?: () => void
}

function initialsFromEmail(email: string | null | undefined): string {
  if (!email) return 'P'
  const handle = email.split('@')[0] ?? ''
  const parts = handle.split(/[._-]/).filter(Boolean)
  if (parts.length === 0) return handle.charAt(0).toUpperCase() || 'P'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setEmail(data.user?.email ?? null)
    })
    return () => {
      mounted = false
    }
  }, [])

  const initials = initialsFromEmail(email)

  return (
    <header className="ds-topbar">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost lg:hidden"
      >
        <Icon name="dots" size="sm" />
      </button>

      <div className="ds-topbar__search ds-input-group">
        <Icon name="search" size="sm" />
        <input type="text" placeholder="Buscar citas, clientes, productos…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="hidden flex-1 sm:block" />

      <button
        type="button"
        aria-label="Notificaciones"
        className="ds-btn ds-btn--icon ds-btn--sm ds-btn--ghost"
        style={{ position: 'relative' }}
      >
        <Icon name="bell" size="sm" />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 0 2px var(--surface)',
          }}
        />
      </button>

      <div className="ds-topbar__divider" />

      <div
        className="ds-avatar ds-avatar--sm"
        title={email ?? undefined}
        aria-label="Perfil"
      >
        {initials}
      </div>
    </header>
  )
}
