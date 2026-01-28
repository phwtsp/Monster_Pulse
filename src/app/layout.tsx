import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // Using Inter as standard modern font
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monster Pulse',
  description: 'Survey Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
