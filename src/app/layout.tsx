import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEXO UAPA',
  description: 'Comunidad académica interactiva de la Universidad Abierta para Adultos',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('nexo-theme')?.value ?? 'light'
  const lang  = cookieStore.get('nexo-lang')?.value  ?? 'es'

  return (
    <html lang={lang} data-theme={theme} className="h-full" suppressHydrationWarning>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
