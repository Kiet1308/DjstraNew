import { motion } from 'motion/react'
import type { DepArrowDef, GhostEdge, MathOverlayDef } from './types'
import type { LayoutMap } from './layouts'
import { useSvgIds } from './svgIds'

/**
 * Mũi tên phụ thuộc — cong, màu tím riêng, bay PHÍA TRÊN đồ thị.
 * Nét đứt = "câu hỏi: cần biết trước"; khi solid = "câu trả lời lan ra"
 * (dùng ở beat đảo chiều — quy ước đọc được đặt lại trong lời dẫn).
 */
export function DepArrow({
  from,
  to,
  dim,
  flip,
  solid,
  layout,
  nodeRadius = 34,
}: DepArrowDef & { solid?: boolean; layout: LayoutMap; nodeRadius?: number }) {
  const ids = useSvgIds()
  const a = layout[from]
  const b = layout[to]
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  // Pháp tuyến hướng lên — control point bồng lên trên đồ thị (flip = úp xuống)
  let nx = -(b.y - a.y) / len
  let ny = (b.x - a.x) / len
  if (ny > 0 !== !!flip) {
    nx = -nx
    ny = -ny
  }
  const bow = Math.min(150, len * 0.36)
  const cx = mx + nx * bow
  const cy = my + ny * bow

  // Rút hai đầu khỏi tâm đỉnh (xấp xỉ theo hướng tới control point)
  const trim = (px: number, py: number, qx: number, qy: number, r: number) => {
    const d = Math.hypot(qx - px, qy - py) || 1
    return { x: px + ((qx - px) / d) * r, y: py + ((qy - py) / d) * r }
  }
  const p0 = trim(a.x, a.y, cx, cy, nodeRadius + 12)
  const p1 = trim(b.x, b.y, cx, cy, nodeRadius + 18)

  return (
    <motion.path
      d={`M ${p0.x} ${p0.y} Q ${cx} ${cy} ${p1.x} ${p1.y}`}
      fill="none"
      stroke="var(--violet)"
      strokeWidth={solid ? 4.5 : 3.5}
      strokeDasharray={solid ? undefined : '9 8'}
      strokeLinecap="round"
      markerEnd={`url(#${ids.depArrowHead})`}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: dim ? 0.22 : 0.95, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    />
  )
}

/** Cạnh giả định "biết đâu có đường..." — nét đứt đỏ + nhãn "?". */
export function GhostEdgeView({
  ghost,
  layout,
}: {
  ghost: GhostEdge
  layout: LayoutMap
}) {
  const a = layout[ghost.from]
  const b = layout[ghost.to]
  const t = ghost.labelT ?? 0.5
  const mx = a.x + (b.x - a.x) * t
  const my = a.y + (b.y - a.y) * t
  const label = ghost.label ?? '?'
  const chipW = 26 + label.length * 13

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.path
        d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
        fill="none"
        stroke="var(--red)"
        strokeWidth={4}
        strokeDasharray="12 10"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.75, 1] }}
        transition={{ duration: 0.7 }}
      />
      <rect
        x={mx - chipW / 2}
        y={my - 19}
        width={chipW}
        height={38}
        rx={11}
        fill="#2a1512"
        stroke="var(--red)"
        strokeWidth={2}
      />
      <text
        x={mx}
        y={my + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono)"
        fontSize={21}
        fontWeight={700}
        fill="var(--red)"
      >
        {label}
      </text>
    </motion.g>
  )
}

/**
 * Đường giả định "lẻn" (cut property): rời A bằng đường ĐÃ BIẾT, bước qua
 * đúng một CỬA đang mở (crossAt), rồi mới lặn vào vùng tối — hình phải kể
 * cùng câu chuyện với lời: vùng tối không có cửa sau.
 */
export function PhantomPath({
  points,
  crossAt,
}: {
  points: [number, number][]
  crossAt?: [number, number]
}) {
  if (points.length < 2) return null
  // Catmull-Rom → bezier để đường "lẻn" mềm mại
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke="var(--red)"
        strokeWidth={4}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ pathLength: { duration: 2.0, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
      />
      {crossAt && (
        <motion.circle
          cx={crossAt[0]}
          cy={crossAt[1]}
          r={48}
          fill="none"
          stroke="var(--red)"
          strokeWidth={3.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1] }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.9, duration: 1.2 }}
        />
      )}
    </g>
  )
}

/** Chip phép tính cạnh đỉnh — "4+12=16 < 18". Lớp HTML phía trên SVG. */
export function MathOverlayChip({
  overlay,
  layout,
}: {
  overlay: MathOverlayDef
  layout: LayoutMap
}) {
  const p = layout[overlay.at]
  const tone = overlay.tone ?? 'info'
  const color =
    tone === 'better' ? 'var(--green)' : tone === 'worse' ? 'var(--red)' : 'var(--cyan)'
  return (
    <motion.div
      // x:'-50%' phải nằm TRONG animation values — transform tĩnh sẽ bị Motion ghi đè
      initial={{ opacity: 0, y: 14, scale: 0.92, x: '-50%' }}
      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
      exit={{ opacity: 0, y: -8, scale: 0.95, x: '-50%' }}
      transition={{ duration: 0.45, ease: 'backOut' }}
      style={{
        position: 'absolute',
        left: p.x + (overlay.dx ?? 0),
        top: p.y + (overlay.dy ?? -118),
        fontFamily: 'var(--font-mono)',
        fontSize: 24,
        fontWeight: 700,
        color,
        background: 'rgba(11, 18, 32, 0.92)',
        border: `2px solid ${color}`,
        borderRadius: 12,
        padding: '8px 16px',
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 28px rgba(2, 6, 14, 0.6)',
      }}
    >
      {overlay.text}
    </motion.div>
  )
}

/** Chùm tia rối loạn tỏa từ một điểm — callback cảnh "trăm ngả từ A". */
export function ChaosRays({ from, count = 14 }: { from: { x: number; y: number }; count?: number }) {
  // Pseudo-random có seed — render thuần túy, không Math.random
  const rays = Array.from({ length: count }, (_, i) => {
    const t = (i * 137.508) % 360 // góc vàng — phân bố đều mà nhìn "rối"
    const spread = ((i * 73) % 50) - 25
    const angle = ((t % 130) - 65 + spread / 2) * (Math.PI / 180)
    const len = 380 + ((i * 97) % 320)
    const x1 = from.x + Math.cos(angle) * 70
    const y1 = from.y + Math.sin(angle) * 70
    const x2 = from.x + Math.cos(angle) * len
    const y2 = from.y + Math.sin(angle) * len
    const bend = ((i * 53) % 160) - 80
    return { x1, y1, x2, y2, cx: (x1 + x2) / 2 - bend * 0.6, cy: (y1 + y2) / 2 + bend, i }
  })
  return (
    <g>
      {rays.map((r) => (
        <motion.path
          key={r.i}
          d={`M ${r.x1} ${r.y1} Q ${r.cx} ${r.cy} ${r.x2} ${r.y2}`}
          fill="none"
          stroke="var(--red)"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, delay: r.i * 0.06, ease: 'easeOut' }}
        />
      ))}
    </g>
  )
}
