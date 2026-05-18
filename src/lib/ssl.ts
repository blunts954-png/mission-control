export interface SSLInfo {
  hostname: string
  valid: boolean
  issuer?: string
  subject?: string
  validFrom?: string
  validTo?: string
  daysRemaining: number
  protocol?: string
  error?: string
}

export async function checkSSL(hostname: string): Promise<SSLInfo> {
  const cleanHostname = hostname.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

  if (typeof window !== 'undefined') {
    return {
      hostname: cleanHostname,
      valid: false,
      daysRemaining: 0,
      error: 'SSL checks only available server-side'
    }
  }

  const tls = await import('tls')
  const net = await import('net')

  return new Promise((resolve) => {
    const socket = new net.Socket()
    let settled = false

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        socket.destroy()
        resolve({
          hostname: cleanHostname,
          valid: false,
          daysRemaining: 0,
          error: 'SSL check timed out'
        })
      }
    }, 10000)

    socket.on('error', (err) => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        resolve({
          hostname: cleanHostname,
          valid: false,
          daysRemaining: 0,
          error: `Connection error: ${err.message}`
        })
      }
    })

    const tlsSocket = tls.connect({
      host: cleanHostname,
      port: 443,
      socket,
      servername: cleanHostname,
      rejectUnauthorized: false
    })

    tlsSocket.once('secureConnect', () => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)

        const cert = tlsSocket.getPeerCertificate()
        const validTo = cert.valid_to ? new Date(cert.valid_to) : new Date()
        const now = new Date()
        const daysRemaining = Math.max(0, Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

        resolve({
          hostname: cleanHostname,
          valid: daysRemaining > 0,
          issuer: typeof cert.issuer?.O === 'string' ? cert.issuer.O : typeof cert.issuer?.CN === 'string' ? cert.issuer.CN : undefined,
          subject: typeof cert.subject?.CN === 'string' ? cert.subject.CN : undefined,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining,
          protocol: tlsSocket.getProtocol() || undefined
        })

        tlsSocket.end()
      }
    })

    tlsSocket.on('error', (err) => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        resolve({
          hostname: cleanHostname,
          valid: false,
          daysRemaining: 0,
          error: `TLS error: ${err.message}`
        })
      }
    })
  })
}
