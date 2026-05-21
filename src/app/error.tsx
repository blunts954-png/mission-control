'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-red/20 flex items-center justify-center">
          <span className="text-cyber-red text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-4">{error.message || 'An unexpected error occurred in this section'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-neon-purple-500 text-white hover:bg-neon-purple-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
