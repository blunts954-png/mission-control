import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="text-6xl font-bold text-neon-purple-500 mb-4 font-mono">404</div>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 text-sm font-medium rounded-lg bg-neon-purple-500 text-white hover:bg-neon-purple-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
