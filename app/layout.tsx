import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Paws & Glow — Estética Canina',
  description:
    'Estética canina premium con diagnóstico por inteligencia artificial. Agenda tu cita hoy.',
  keywords: 'estética canina, grooming, perros, peluquería canina, citas',
  manifest: '/manifest.json',
  themeColor: '#FF8C7A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF8C7A" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={quicksand.className}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
