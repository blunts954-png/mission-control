import type { Metadata } from 'next'
import './globals.css'

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
      <body className="bg-cyber-black min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
