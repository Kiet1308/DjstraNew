import { motion } from 'motion/react'
import type { NodeVisualState } from './types'
import { useSvgIds } from './svgIds'

type NodeStyle = {
  fill: string
  stroke: string
  strokeWidth: number
  dash?: string
  labelFill: string
  opacity: number
}

const STYLES: Record<Exclude<NodeVisualState, 'hidden'>, NodeStyle> = {
  idle: {
    fill: 'var(--ink-3)',
    stroke: 'var(--line)',
    strokeWidth: 2.5,
    labelFill: 'var(--fog-200)',
    opacity: 1,
  },
  fogged: {
    fill: 'var(--ink-2)',
    stroke: 'var(--line-soft)',
    strokeWidth: 2,
    labelFill: 'rgba(195, 207, 232, 0.18)',
    opacity: 0.4,
  },
  frontier: {
    fill: '#0f2733',
    stroke: 'var(--cyan)',
    strokeWidth: 3,
    dash: '8 7',
    labelFill: 'var(--fog-100)',
    opacity: 1,
  },
  locked: {
    fill: 'var(--amber)',
    stroke: '#ffe09a',
    strokeWidth: 2.5,
    labelFill: '#1a1206',
    opacity: 1,
  },
  current: {
    fill: '#0f2733',
    stroke: 'var(--cyan)',
    strokeWidth: 3.5,
    labelFill: 'var(--fog-100)',
    opacity: 1,
  },
  onPath: {
    fill: '#13202f',
    stroke: 'PATH_GRAD', // thay bằng url(#…) theo instance trong component
    strokeWidth: 4.5,
    labelFill: '#ffffff',
    opacity: 1,
  },
  dimmed: {
    fill: 'var(--ink-2)',
    stroke: 'var(--line-soft)',
    strokeWidth: 2,
    labelFill: 'var(--fog-500)',
    opacity: 0.3,
  },
}

export function GraphNode({
  id,
  x,
  y,
  state,
  variant,
  clickable,
  hinting,
  onClick,
  size = 34,
}: {
  id: string
  x: number
  y: number
  state: Exclude<NodeVisualState, 'hidden'>
  variant: 'map' | 'abstract'
  clickable?: boolean
  hinting?: boolean
  onClick?: (id: string) => void
  size?: number
}) {
  const ids = useSvgIds()
  const s = STYLES[state]
  const stroke = s.stroke === 'PATH_GRAD' ? `url(#${ids.pathGrad})` : s.stroke
  const rx = variant === 'abstract' ? size : Math.round(size * 0.42)
  const morph = { type: 'tween' as const, duration: 1.1, ease: 'easeInOut' as const }

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {state === 'current' && (
        <circle
          cx={x}
          cy={y}
          r={size + 6}
          fill="none"
          stroke="var(--cyan)"
          strokeWidth={3}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'halo-pulse 1.6s ease-out infinite',
          }}
        />
      )}

      {hinting && (
        <circle
          cx={x}
          cy={y}
          r={size + 12}
          fill="none"
          stroke="var(--cyan)"
          strokeWidth={2.5}
          style={{
            transformBox: 'fill-box',
            transformOrigin: 'center',
            animation: 'nudge-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      <motion.rect
        className="node-shape"
        width={size * 2}
        height={size * 2}
        strokeDasharray={s.dash}
        initial={false}
        animate={{
          x: x - size,
          y: y - size,
          rx,
          fill: s.fill,
          stroke,
          strokeWidth: s.strokeWidth,
          opacity: s.opacity,
        }}
        transition={{ x: morph, y: morph, rx: morph, default: { duration: 0.45 } }}
      />

      <motion.text
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight={800}
        fontSize={30}
        initial={false}
        animate={{ x, y: y + 2, fill: s.labelFill }}
        transition={{ x: morph, y: morph, default: { duration: 0.45 } }}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {id}
      </motion.text>

      {state === 'locked' && (
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {/* cx/cy/x/y animate theo morph — dấu ✓ trượt cùng đỉnh, không nhảy */}
          <motion.circle
            r={14}
            fill="#1a1206"
            initial={false}
            animate={{ cx: x + size - 8, cy: y + size - 8 }}
            transition={{ cx: morph, cy: morph }}
          />
          <motion.text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={17}
            fontWeight={800}
            fill="var(--amber)"
            initial={false}
            animate={{ x: x + size - 8, y: y + size - 7 }}
            transition={{ x: morph, y: morph }}
            style={{ pointerEvents: 'none' }}
          >
            ✓
          </motion.text>
        </motion.g>
      )}

      {clickable && (
        <circle
          className="node-hit"
          data-node={id}
          cx={x}
          cy={y}
          r={Math.max(48, size + 14)}
          fill="transparent"
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onClick={() => onClick?.(id)}
        />
      )}
    </motion.g>
  )
}
