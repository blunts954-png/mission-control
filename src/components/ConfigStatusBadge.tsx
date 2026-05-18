'use client'

interface ConfigStatusBadgeProps {
  live: boolean
  label?: string
}

export default function ConfigStatusBadge({ live, label }: ConfigStatusBadgeProps) {
  if (live) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-electric-green-500/10 text-electric-green-500 border border-electric-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-electric-green-500" />
        {label || 'Live'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      {label || 'Mock'}
    </span>
  )
}
