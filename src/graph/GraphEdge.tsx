import { motion } from 'motion/react'
import type { EdgeVisualState } from './types'
import { useSvgIds } from './svgIds'

type EdgeStyle = { stroke: string; width: number; opacity: number; dash?: string }

export function GraphEdge({
  x1,
  y1,
  x2,
  y2,
  state,
  weight,
  showWeight,
  directed,
  nodeRadius = 34,
  delay = 0,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  state: Exclude<EdgeVisualState, 'hidden'>
  weight: number
  showWeight: boolean
  directed?: boolean
  nodeRadius?: number
  /** trễ animation đổi trạng thái — đường cuối "sáng dậy ngược về A" */
  delay?: number
}) {
  const ids = useSvgIds()
  const STYLES: Record<Exclude<EdgeVisualState, 'hidden'>, EdgeStyle> = {
    idle: { stroke: 'var(--line)', width: 3, opacity: 1 },
    active: { stroke: 'var(--cyan)', width: 4.5, opacity: 1 },
    relaxing: { stroke: '#a5f3ff', width: 5.5, opacity: 1 },
    hypothetical: { stroke: 'var(--red)', width: 3.5, opacity: 0.95, dash: '11 9' },
    pruned: { stroke: 'var(--red-dim)', width: 3, opacity: 0.45 },
    onPath: { stroke: `url(#${ids.pathGrad})`, width: 7, opacity: 1 },
    dimmed: { stroke: 'var(--line-soft)', width: 3, opacity: 0.3 },
  }
  const s = STYLES[state]
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len

  // Cạnh có hướng: rút ngắn để mũi tên chạm mép đỉnh, không xuyên tâm.
  const ax1 = directed ? x1 + ux * nodeRadius : x1
  const ay1 = directed ? y1 + uy * nodeRadius : y1
  const ax2 = directed ? x2 - ux * (nodeRadius + 14) : x2
  const ay2 = directed ? y2 - uy * (nodeRadius + 14) : y2
  const d = `M ${ax1} ${ay1} L ${ax2} ${ay2}`

  // Nhãn trọng số: đặt lệch về phía "trên" theo pháp tuyến của cạnh.
  let nx = -uy
  let ny = ux
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const mx = (x1 + x2) / 2 + nx * 30
  const my = (y1 + y2) / 2 + ny * 30
  const wText = String(weight)
  const chipW = 18 + wText.length * 13

  const emphasized = state === 'relaxing' || state === 'active' || state === 'onPath'

  return (
    <g>
      {(state === 'relaxing' || state === 'active') && (
        <motion.path
          d={d}
          fill="none"
          stroke={state === 'relaxing' ? '#a5f3ff' : 'var(--cyan)'}
          strokeWidth={16}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.16 }}
          exit={{ opacity: 0 }}
        />
      )}

      {s.dash ? (
        <motion.path
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={s.dash}
          initial={{ opacity: 0 }}
          animate={{ opacity: s.opacity, stroke: s.stroke, strokeWidth: s.width }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
      ) : (
        <motion.path
          d={d}
          fill="none"
          strokeLinecap="round"
          markerEnd={directed ? `url(#${ids.edgeArrowHead})` : undefined}
          initial={{ pathLength: 0, opacity: 0.9, stroke: s.stroke, strokeWidth: s.width }}
          animate={{
            pathLength: 1,
            // cắt nhánh phải NHÌN THẤY được: flash đỏ một nhịp rồi lịm
            opacity: state === 'pruned' ? [0.95, 0.3, s.opacity] : s.opacity,
            stroke: state === 'pruned' ? ['#ff7a6e', s.stroke] : s.stroke,
            strokeWidth: s.width,
          }}
          exit={{ opacity: 0 }}
          transition={{
            pathLength: { duration: 0.7, ease: 'easeOut' },
            default: { duration: state === 'pruned' ? 0.9 : 0.4, delay },
          }}
        />
      )}

      {state === 'pruned' && (
        <motion.text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight={800}
          fill="var(--red)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.35 }}
        >
          ✕
        </motion.text>
      )}

      {state === 'onPath' && (
        <path
          d={d}
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth={2}
          strokeDasharray="6 22"
          strokeLinecap="round"
          style={{ animation: 'marching-ants 1.1s linear infinite' }}
        />
      )}

      {showWeight && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: state === 'dimmed' ? 0.25 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <rect
            x={mx - chipW / 2}
            y={my - 16}
            width={chipW}
            height={32}
            rx={9}
            fill="var(--ink-1)"
            stroke={emphasized ? 'var(--cyan-dim)' : 'var(--line-soft)'}
            strokeWidth={1.5}
          />
          <text
            x={mx}
            y={my + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="var(--font-mono)"
            fontSize={20}
            fontWeight={700}
            fill={emphasized ? 'var(--fog-100)' : 'var(--fog-300)'}
          >
            {wText}
          </text>
        </motion.g>
      )}
    </g>
  )
}
