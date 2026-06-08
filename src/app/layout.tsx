import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ClientGuard from './ClientGuard'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chaotically Organized AI - Command Center',
  description: 'Cyber-Noir Command Center for monitoring and managing AI operations',
  keywords: ['AI', 'Command Center', 'Dashboard', 'Monitoring', 'Analytics'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://mission-control-main-five.vercel.app" />
        <script type="speculationrules" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            prerender: [{
              where: { href_matches: "/*" },
              eagerness: "moderate"
            }]
          })
        }} />
      </head>
      <body className="bg-cyber-black min-h-screen antialiased">
        <ClientGuard>
          {children}
        </ClientGuard>
        <Analytics />
      </body>
    </html>
  )
}
