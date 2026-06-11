import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { NodeVisualState } from './types'

type Tone = { bg: string; border: string; text: string }

function toneFor(state: NodeVisualState): Tone {
  if (state === 'locked')
    return { bg: 'var(--amber)', border: '#ffe09a', text: '#1a1206' }
  if (state === 'onPath')
    return { bg: '#15293a', border: 'var(--path-a)', text: 'var(--fog-100)' }
  if (state === 'dimmed' || state === 'fogged')
    return { bg: 'var(--ink-2)', border: 'var(--fog-500)', text: 'var(--fog-400)' }
  return { bg: '#0f2733', border: 'var(--cyan)', text: 'var(--cyan)' }
}

/**
 * Chip cost ở góc trên-phải của đỉnh.
 * value === null → chip ghost rỗng (chưa biết gì — TUYỆT ĐỐI KHÔNG ∞).
 * Giá trị GIẢM → flash xanh: "tìm được đường ngắn hơn".
 */
export function CostBadge({
  x,
  y,
  value,
  nodeState,
  size = 34,
}: {
  x: number
  y: number
  value: number | null
  nodeState: Exclude<NodeVisualState, 'hidden'>
  size?: number
}) {
  const prevRef = useRef<number | null>(null)
  const decreased = value !== null && prevRef.current !== null && value < prevRef.current
  useEffect(() => {
    prevRef.current = value
  }, [value])

  const tone = toneFor(nodeState)
  const text = value === null ? '' : String(value)
  const chipW = value === null ? 34 : 24 + text.length * 14
  const cx = x + size + 4
  const cy = y - size - 6

  return (
    <motion.g
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: nodeState === 'dimmed' ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.35, ease: 'backOut' }}
    >
      {/* key theo value: GIẢM (đi xuôi) thì pop + lóe xanh;
          TĂNG chỉ xảy ra khi tua lùi → đổi số im lặng (trạng thái lắng) */}
      <motion.g
        key={value === null ? 'ghost' : value}
        initial={decreased ? { scale: 1.35 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <motion.rect
          x={cx - chipW / 2}
          y={cy - 19}
          width={chipW}
          height={38}
          rx={12}
          strokeWidth={2}
          strokeDasharray={value === null ? '5 5' : undefined}
          initial={decreased ? { fill: '#143524', stroke: 'var(--green)' } : false}
          animate={{
            fill: value === null ? 'var(--ink-2)' : tone.bg,
            stroke: value === null ? 'var(--fog-500)' : tone.border,
          }}
          transition={{ duration: decreased ? 1.1 : 0.4, ease: 'easeOut' }}
        />
        {value !== null && (
          <motion.text
            x={cx}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-mono)"
            fontSize={22}
            fontWeight={700}
            initial={decreased ? { fill: 'var(--green)' } : false}
            animate={{ fill: tone.text }}
            transition={{ duration: decreased ? 1.1 : 0.4, ease: 'easeOut' }}
          >
            {text}
          </motion.text>
        )}
      </motion.g>
    </motion.g>
  )
}
