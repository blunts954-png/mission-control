import type { Metadata } from 'next'
import './globals.css'
import ClientGuard from './ClientGuard'

export const metadata: Metadata = {
  title: 'Chaotically Organized AI - Command Center',
  description: 'Cyber-Noir Command Center for monitoring and managing AI operations',
  keywords: ['AI', 'Command Center', 'Dashboard', 'Monitoring', 'Analytics'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
      </body>
    </html>
  )
}
