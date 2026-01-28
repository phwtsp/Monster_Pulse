import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
