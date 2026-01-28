import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Monster Pesquisa',
  description: 'Survey Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/zxz2xqf.css" />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
