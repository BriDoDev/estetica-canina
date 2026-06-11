import type { ReactNode } from 'react'
import { StageProvider } from '@/components/landing/StageProvider'
import { Header } from '@/components/landing/Header'
import { FloatingDog } from '@/components/landing/FloatingDog'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <StageProvider>
      <Header />
      <main>{children}</main>
      <FloatingDog />
    </StageProvider>
  )
}
