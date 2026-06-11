import type { Metadata, Viewport } from 'next'
import { Fredoka, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/ui/ServiceWorkerRegistration'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Paws & Glow — Estética Canina con IA',
  description:
    'Estética canina premium con diagnóstico por inteligencia artificial. Sube una foto y recibe recomendaciones personalizadas para tu mascota.',
  keywords: 'estética canina, grooming, perros, peluquería canina, citas, IA',
  manifest: '/manifest.json',
  authors: [{ name: 'Paws & Glow' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Paws & Glow — Estética Canina con IA',
    description: 'Diagnóstico por inteligencia artificial para tu mascota. Agenda tu cita hoy.',
    type: 'website',
    locale: 'es_MX',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e5631" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-sans">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
