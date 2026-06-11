import { IconSprite } from '@/components/admin/IconSprite'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-app="admin"
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <IconSprite />
      {children}
    </div>
  )
}
