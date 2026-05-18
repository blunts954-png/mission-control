'use client'

interface TrendChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

export default function TrendChart({
  data,
  width = 80,
  height = 28,
  color = '#6366f1',
  className = ''
}: TrendChartProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const gradientId = `trend-grad-${Math.random().toString(36).substr(2, 9)}`

  const trend = data[data.length - 1] - data[0]
  const strokeColor = trend >= 0 ? '#22c55e' : color

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#${gradientId})`}
        points={`0,${height} ${points} ${width},${height}`}
      />
    </svg>
  )
}
