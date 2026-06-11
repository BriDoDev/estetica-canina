'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Icon } from '@/components/admin/Icon'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="ds-card w-full max-w-sm">
      <div className="ds-stack-4 text-center" style={{ marginBottom: 18 }}>
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-full font-display text-xl text-white"
          style={{ background: 'var(--brand-deep)', fontWeight: 500 }}
        >
          P
        </div>
        <div>
          <h1 className="ds-t-d2">Paws &amp; Glow</h1>
          <p className="ds-t-sm ds-t-muted">Acceso al panel de administración</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="ds-stack-3">
        <div className="ds-field">
          <label htmlFor="email" className="ds-field__label">
            Correo
          </label>
          <input
            id="email"
            type="email"
            className="ds-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@pawsandglow.mx"
            required
          />
        </div>
        <div className="ds-field">
          <label htmlFor="password" className="ds-field__label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="ds-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="ds-alert ds-alert--danger">
            <Icon name="alert" className="ds-alert__icon" />
            <div className="ds-alert__body">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="ds-btn ds-btn--accent ds-btn--lg ds-btn--block"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
