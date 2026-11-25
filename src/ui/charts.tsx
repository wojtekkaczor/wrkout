/*
 * Small SVG charts. They take plain numbers and labels, use the theme's
 * colour tokens, and describe themselves to screen readers.
 */

export type ChartPoint = {
  label: string
  value: number
}

type ChartProps = {
  points: ChartPoint[]
  /** Sentence describing the chart for screen readers. */
  description: string
  formatValue?: (value: number) => string
}

const WIDTH = 320
const HEIGHT = 150
const PAD = { top: 18, right: 12, bottom: 22, left: 12 }
const INNER_WIDTH = WIDTH - PAD.left - PAD.right
const INNER_HEIGHT = HEIGHT - PAD.top - PAD.bottom

function defaultFormat(value: number): string {
  return value.toLocaleString('pl-PL', { maximumFractionDigits: 1 })
}

function AxisLabels({ first, last }: { first?: string; last?: string }) {
  return (
    <>
      <text x={PAD.left} y={HEIGHT - 6} className="fill-muted text-[11px]">
        {first}
      </text>
      <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" className="fill-muted text-[11px]">
        {last}
      </text>
    </>
  )
}

/** Trend over time, one dot per workout. The peak is labelled; first and last values sit on the axis. */
export function LineChart({ points, description, formatValue = defaultFormat }: ChartProps) {
  if (points.length === 0) {
    return null
  }
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = points.length > 1 ? INNER_WIDTH / (points.length - 1) : 0
  const coords = points.map((point, index) => ({
    x: points.length > 1 ? PAD.left + index * step : PAD.left + INNER_WIDTH / 2,
    y: PAD.top + INNER_HEIGHT - ((point.value - min) / span) * INNER_HEIGHT,
    value: point.value,
  }))
  const peak = coords.reduce((best, coord) => (coord.value > best.value ? coord : best))
  const firstPoint = points[0]
  const lastPoint = points.length > 1 ? points.at(-1) : undefined

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={description} className="w-full">
      <line
        x1={PAD.left}
        x2={WIDTH - PAD.right}
        y1={PAD.top + INNER_HEIGHT}
        y2={PAD.top + INNER_HEIGHT}
        className="stroke-border"
      />
      <polyline
        points={coords.map((coord) => `${coord.x},${coord.y}`).join(' ')}
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-accent"
      />
      {coords.map((coord, index) => (
        <circle key={index} cx={coord.x} cy={coord.y} r="3" className="fill-accent" />
      ))}
      <text
        x={Math.min(Math.max(peak.x, PAD.left + 16), WIDTH - PAD.right - 16)}
        y={peak.y - 7}
        textAnchor="middle"
        className="fill-text text-[11px] font-semibold"
      >
        {formatValue(peak.value)}
      </text>
      <AxisLabels
        first={firstPoint ? `${firstPoint.label} · ${formatValue(firstPoint.value)}` : undefined}
        last={lastPoint ? `${formatValue(lastPoint.value)} · ${lastPoint.label}` : undefined}
      />
    </svg>
  )
}

/** Totals per period, e.g. kilometres per week. */
export function BarChart({ points, description, formatValue = defaultFormat }: ChartProps) {
  if (points.length === 0) {
    return null
  }
  const max = Math.max(...points.map((point) => point.value), 1)
  const slot = INNER_WIDTH / points.length
  const barWidth = Math.min(slot * 0.7, 28)
  const showValues = points.length <= 16

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={description} className="w-full">
      <line
        x1={PAD.left}
        x2={WIDTH - PAD.right}
        y1={PAD.top + INNER_HEIGHT}
        y2={PAD.top + INNER_HEIGHT}
        className="stroke-border"
      />
      {points.map((point, index) => {
        const height = (point.value / max) * INNER_HEIGHT
        const x = PAD.left + index * slot + (slot - barWidth) / 2
        const y = PAD.top + INNER_HEIGHT - height
        return (
          <g key={index}>
            <rect x={x} y={y} width={barWidth} height={height} rx="3" className="fill-accent" />
            {showValues && point.value > 0 ? (
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-muted text-[10px]"
              >
                {formatValue(point.value)}
              </text>
            ) : null}
          </g>
        )
      })}
      <AxisLabels first={points[0]?.label} last={points.length > 1 ? points.at(-1)?.label : undefined} />
    </svg>
  )
}
