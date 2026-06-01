import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '48 Kingdoms — Fantasy World Cup',
  description: 'Draft nations. Earn points. Rule the world.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
