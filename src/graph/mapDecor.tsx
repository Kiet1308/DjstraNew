import { motion } from 'motion/react'
import type { LayoutMap } from './layouts'
import type { GraphEdgeDef } from './types'

/**
 * Lớp trang trí "bản đồ thành phố cách điệu" — vẽ DƯỚI đồ thị:
 * các cạnh thành đường phố (nền rộng + vạch tim đường), thêm khối nhà mờ.
 * Render trong một <svg> riêng để không đụng GraphView.
 */
export function CityDecorLayer({
  layout,
  edges,
  opacity = 1,
}: {
  layout: LayoutMap
  edges: GraphEdgeDef[]
  opacity?: number
}) {
  return (
    <motion.svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      animate={{ opacity }}
      transition={{ duration: 1.1 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* Khối nhà — cụm rect mờ đặt tay, né các đỉnh */}
      <g fill="#0f1830" stroke="#1d2a48" strokeWidth={1.5} opacity={0.75}>
        {BLOCKS.map((b, i) => (
          <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx={7} />
        ))}
      </g>

      {/* Đường phố theo cạnh đồ thị */}
      <g>
        {edges.map((e) => {
          const a = layout[e.from]
          const b = layout[e.to]
          if (!a || !b) return null
          const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`
          return (
            <g key={e.id}>
              <path d={d} stroke="#131e36" strokeWidth={30} strokeLinecap="round" fill="none" />
              <path
                d={d}
                stroke="rgba(234, 240, 253, 0.07)"
                strokeWidth={2.5}
                strokeDasharray="14 18"
                fill="none"
              />
            </g>
          )
        })}
        {/* vài nhánh phố cụt cho có hơi thở thành phố */}
        {STUBS.map((s, i) => (
          <g key={i}>
            <path
              d={`M ${s[0]} ${s[1]} L ${s[2]} ${s[3]}`}
              stroke="#101a31"
              strokeWidth={20}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ))}
      </g>

      {/* đèn phố — chấm sáng li ti */}
      <g fill="#93a3c4">
        {LIGHTS.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={2.4} opacity={0.4} />
        ))}
      </g>
    </motion.svg>
  )
}

const BLOCKS: [number, number, number, number][] = [
  [380, 360, 90, 60],
  [490, 360, 70, 60],
  [380, 440, 110, 70],
  [770, 380, 100, 64],
  [890, 360, 80, 100],
  [700, 640, 90, 70],
  [810, 650, 110, 60],
  [700, 730, 80, 64],
  [1280, 540, 100, 70],
  [1400, 560, 80, 64],
  [1300, 300, 90, 70],
  [1180, 130, 100, 60],
  [560, 950, 100, 56],
  [330, 760, 84, 64],
  [1450, 800, 100, 64],
  [1600, 700, 80, 70],
]

const STUBS: [number, number, number, number][] = [
  [635, 300, 700, 160],
  [1045, 240, 1180, 120],
  [1120, 635, 1300, 700],
  [515, 840, 380, 950],
  [1610, 455, 1760, 380],
  [300, 565, 150, 660],
]

const LIGHTS: [number, number][] = [
  [430, 330], [560, 430], [820, 350], [950, 480], [760, 620],
  [1100, 380], [1240, 520], [1380, 420], [1500, 640], [680, 880],
  [420, 700], [980, 800], [1340, 760], [1660, 540], [880, 180],
]

/** Ghim bản đồ kiểu Google Maps — giọt nước chỉ xuống đỉnh. */
export function MapPin({
  x,
  y,
  color,
  label,
  labelSide = 'top',
  delay = 0,
}: {
  x: number
  y: number
  color: string
  label?: string
  /** 'left' khi phía trên bị chiếm (vd cột chip bên phải màn) */
  labelSide?: 'top' | 'left'
  delay?: number
}) {
  return (
    <motion.g
      initial={{ opacity: 0, y: -46 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, delay, ease: 'backOut' }}
    >
      <g transform={`translate(${x}, ${y - 44})`}>
        <path
          d="M 0 44 C -7 26 -26 14 -26 -8 C -26 -24 -14 -36 0 -36 C 14 -36 26 -24 26 -8 C 26 14 7 26 0 44 Z"
          fill={color}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2.5}
        />
        <circle cx={0} cy={-8} r={10} fill="rgba(11, 18, 32, 0.85)" />
        {label && (
          <text
            x={labelSide === 'left' ? -40 : 0}
            y={labelSide === 'left' ? -4 : -66}
            textAnchor={labelSide === 'left' ? 'end' : 'middle'}
            fontSize={22}
            fontWeight={800}
            fill={color}
            style={{ letterSpacing: '0.08em' }}
          >
            {label}
          </text>
        )}
      </g>
    </motion.g>
  )
}
