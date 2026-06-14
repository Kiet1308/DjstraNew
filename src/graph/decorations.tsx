import { motion, useAnimationFrame, useMotionValue } from 'motion/react'
import { type CSSProperties, useEffect, useRef } from 'react'
import type {
  CostPacketDef,
  DecisionDef,
  DepArrowDef,
  GhostEdge,
  MathOverlayDef,
  MinHolderDef,
  PrevArrowDef,
  ProbeDef,
} from './types'
import type { LayoutMap } from './layouts'
import { routeToPathD, usePointAlongPath } from './usePointAlongPath'
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
  soft,
  delay = 0,
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
      strokeWidth={solid ? 4.5 : soft ? 3 : 3.5}
      strokeDasharray={solid ? undefined : '9 8'}
      strokeLinecap="round"
      markerEnd={`url(#${ids.depArrowHead})`}
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: dim ? 0.22 : soft ? 0.45 : 0.95, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    />
  )
}

/**
 * Mũi tên "tôi đến từ đây" (Phần 4 — Prev): NGẮN, THẲNG, LIỀN NÉT, màu xanh —
 * khác hẳn mũi tên phụ thuộc tím cong nét đứt của Phần 3, kẻo nhầm khái niệm.
 * Cắm tại node, chỉ ngược về điểm ngay trước nó. Đổi from = exit/enter
 * (AnimatePresence key theo `node:from`) — mũi tên cũ rút, mũi tên mới cắm.
 */
export function PrevArrow({
  node,
  from,
  flare,
  layout,
  nodeRadius = 34,
}: PrevArrowDef & { layout: LayoutMap; nodeRadius?: number }) {
  const ids = useSvgIds()
  const a = layout[node]
  const b = layout[from]
  const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const ux = (b.x - a.x) / dist
  const uy = (b.y - a.y) / dist
  const start = nodeRadius + 12
  const len = Math.min(110, Math.max(64, dist * 0.32))
  const x1 = a.x + ux * start
  const y1 = a.y + uy * start
  const x2 = a.x + ux * (start + len)
  const y2 = a.y + uy * (start + len)

  return (
    <motion.path
      d={`M ${x1} ${y1} L ${x2} ${y2}`}
      fill="none"
      stroke={flare ? '#7dffc4' : 'var(--green)'}
      strokeWidth={flare ? 6.5 : 5}
      strokeLinecap="round"
      markerEnd={`url(#${ids.prevArrowHead})`}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: flare ? 1 : 0.85 }}
      exit={{ opacity: 0, pathLength: 0.3 }}
      transition={{ pathLength: { duration: 0.5, ease: 'easeOut' }, opacity: { duration: 0.3 } }}
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

/* ===================== Gadget Phần 4 — "viết code" =====================
   Tất cả scene-driven: lùi beat = re-mount → animate-vào lại (như ChaosRays).
   Hai cái chạy-dọc (ProbeCursor, CostPacket) tái dùng nguyên cơ chế TravelerDot
   (usePointAlongPath + useMotionValue + useAnimationFrame). Hai cái HTML
   (MinHolderCard, DecisionTable) tái dùng pattern MathOverlayChip. */

/** Con trỏ quét tìm min: vòng sáng nét đứt xoay tròn, chạy dọc route rồi dừng
    ở đỉnh cuối (= ứng viên min). tone 'lock' = đỉnh vừa chốt → đổi sang amber. */
export function ProbeCursor({
  route,
  runId,
  tone = 'scan',
  layout,
  nodeRadius = 34,
}: ProbeDef & { layout: LayoutMap; nodeRadius?: number }) {
  const pts = route.map((id) => layout[id]).filter(Boolean)
  const d = routeToPathD(pts)
  const { pathRef, sample } = usePointAlongPath()
  const cx = useMotionValue(pts[0]?.x ?? -300)
  const cy = useMotionValue(pts[0]?.y ?? -300)
  const startRef = useRef<number | null>(null)
  const duration = 420 + Math.max(0, pts.length - 1) * 360 // ~360ms mỗi nhịp nhảy

  useEffect(() => {
    startRef.current = null
  }, [runId, d])

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t
    const progress = Math.min(1, (t - startRef.current) / duration)
    const p = sample(progress)
    if (p) {
      cx.set(p.x)
      cy.set(p.y)
    }
  })

  if (pts.length === 0) return null
  const color = tone === 'lock' ? 'var(--amber)' : 'var(--cyan)'
  // path đo cần độ dài > 0 kể cả route 1 đỉnh (đứng yên) — thêm đoạn cực ngắn
  const measureD = d && pts.length > 1 ? d : `M ${pts[0].x} ${pts[0].y} L ${pts[0].x + 0.01} ${pts[0].y}`

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <path ref={pathRef} d={measureD} fill="none" stroke="none" style={{ opacity: 0 }} />
      <motion.circle r={nodeRadius + 18} style={{ cx, cy }} fill={color} opacity={0.1} />
      <motion.circle
        r={nodeRadius + 8}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray="7 9"
        style={{ cx, cy, transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={{ opacity: [0.5, 1, 0.5], rotate: [0, 360] }}
        transition={{
          opacity: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
        }}
      />
    </motion.g>
  )
}

/** Gói chi phí: viên thuốc ghi phép tính trượt từ from→to dọc cạnh (easeOut),
    dừng ngay TRƯỚC tâm đỉnh đích để không che badge cost. */
export function CostPacket({
  packet,
  layout,
  nodeRadius = 34,
}: {
  packet: CostPacketDef
  layout: LayoutMap
  nodeRadius?: number
}) {
  const a = layout[packet.from]
  const b = layout[packet.to]
  const { pathRef, sample } = usePointAlongPath()
  const x = useMotionValue(a?.x ?? -300)
  const y = useMotionValue(a?.y ?? -300)
  const startRef = useRef<number | null>(null)
  const duration = 850

  useEffect(() => {
    startRef.current = null
  }, [packet.id])

  const dist = a && b ? Math.hypot(b.x - a.x, b.y - a.y) || 1 : 1
  const tEnd = Math.max(0.45, 1 - (nodeRadius + 30) / dist)

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t
    const raw = Math.min(1, (t - startRef.current) / duration)
    const eased = 1 - Math.pow(1 - raw, 3)
    const p = sample(eased * tEnd)
    if (p) {
      x.set(p.x)
      y.set(p.y)
    }
  })

  if (!a || !b) return null
  const color =
    packet.tone === 'worse' ? 'var(--red)' : packet.tone === 'info' ? 'var(--cyan)' : 'var(--green)'
  const w = 28 + packet.label.length * 13

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <path ref={pathRef} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} fill="none" stroke="none" style={{ opacity: 0 }} />
      <motion.g style={{ x, y }}>
        <rect x={-w / 2} y={-19} width={w} height={38} rx={12} fill="var(--ink-1)" stroke={color} strokeWidth={2.5} />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono)"
          fontSize={21}
          fontWeight={700}
          fill={color}
        >
          {packet.label}
        </text>
      </motion.g>
    </motion.g>
  )
}

/** Thẻ "min" nổi (HTML over-SVG): neo trên đỉnh, có dây nối xuống. */
export function MinHolderCard({
  holder,
  layout,
  nodeRadius = 34,
}: {
  holder: MinHolderDef
  layout: LayoutMap
  nodeRadius?: number
}) {
  const p = layout[holder.node]
  if (!p) return null
  const tone = holder.tone ?? 'keep'
  const color = tone === 'warn' ? 'var(--amber)' : tone === 'lose' ? 'var(--fog-400)' : 'var(--green)'
  const LIFT = 152
  const tetherH = Math.max(16, LIFT - nodeRadius - (holder.note ? 104 : 60))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -8, x: '-50%' }}
      transition={{ duration: 0.42, ease: 'backOut' }}
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y - LIFT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 23,
          fontWeight: 700,
          color: 'var(--fog-100)',
          background: 'rgba(11, 18, 32, 0.94)',
          border: `2.5px solid ${color}`,
          borderRadius: 12,
          padding: '8px 18px',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 28px rgba(2, 6, 14, 0.6)',
        }}
      >
        <span style={{ color: 'var(--fog-400)' }}>min</span> ={' '}
        <span style={{ color }}>{holder.node}</span>
        <span style={{ color: 'var(--fog-400)' }}> · </span>
        <span style={{ color }}>{holder.value}</span>
      </div>
      {holder.note && (
        <div
          style={{
            marginTop: 7,
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color,
            background: 'rgba(11, 18, 32, 0.82)',
            border: `1.5px solid ${color}`,
            borderRadius: 9,
            padding: '3px 12px',
            whiteSpace: 'nowrap',
          }}
        >
          {holder.note}
        </div>
      )}
      <div style={{ width: 2.5, height: tetherH, background: color, opacity: 0.45, marginTop: 3 }} />
    </motion.div>
  )
}

/* Toạ độ nội bộ bảng quyết định (trong khung 560×196). */
const DEC_ENTRY_X = 80
const DEC_GATE_X = 268
const DEC_CELL_X = 456
const DEC_ROW_Y = 120
const DEC_CHIP: CSSProperties = {
  position: 'absolute',
  top: DEC_ROW_Y,
  transform: 'translate(-50%, -50%)',
  minWidth: 56,
  height: 44,
  borderRadius: 11,
  border: '2.5px solid',
  background: 'var(--ink-1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 23,
  fontWeight: 800,
}

/** Bảng quyết định Cost[at]: cửa vào → cổng so sánh → ô đang giữ (HTML over-SVG).
    Mỗi phase một tiểu-cảnh; ô đang giữ là TRẠNG THÁI THẬT (rewind-an-toàn),
    chip chuyển động chỉ là hiệu ứng-vào lúc mount. */
export function DecisionTable({ decision }: { decision: DecisionDef; layout: LayoutMap }) {
  const { phase, held, incoming, runId } = decision
  // neo trong khoảng trời trống trên-phải, cạnh đỉnh B — nằm gọn trong vùng crop
  const left = 1180
  const top = 200
  const cellShows = phase === 'overwrite' ? incoming : phase === 'empty' ? null : held
  const cellRed = phase === 'overwrite'
  const cellDashed = phase === 'empty'
  const cellColor = cellRed ? 'var(--red)' : cellDashed ? 'var(--fog-500)' : 'var(--green)'

  const movingChip = phase === 'receive' || phase === 'overwrite' || phase === 'gate'
  // ứng viên đang được XÉT = cyan (đang mở), không phải amber (amber = đã chốt)
  const movingColor = phase === 'overwrite' ? 'var(--red)' : phase === 'gate' ? 'var(--cyan)' : 'var(--green)'
  const movingVal = phase === 'receive' ? held : incoming
  // số keyframe của left & opacity & times phải KHỚP nhau
  const movingLeft =
    phase === 'gate'
      ? [DEC_ENTRY_X, DEC_GATE_X - 30, DEC_ENTRY_X] // lao tới cổng rồi bật ngược
      : [DEC_ENTRY_X, DEC_ENTRY_X, DEC_CELL_X, DEC_CELL_X] // chờ → trượt vào ô → đậu
  const movingOpacity = phase === 'gate' ? [0, 1, 1] : [0, 1, 1, 0]
  const movingTimes = phase === 'gate' ? [0, 0.5, 1] : [0, 0.15, 0.7, 1]

  const label = (x: number, text: string) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 64,
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: 17,
        color: 'var(--fog-400)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  )
  const arrow = (from: number, to: number) => (
    <div
      style={{
        position: 'absolute',
        left: from,
        top: DEC_ROW_Y,
        width: to - from,
        height: 2,
        transform: 'translateY(-50%)',
        background: 'var(--line)',
      }}
    />
  )

  return (
    <motion.div
      key={runId}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.45, ease: 'backOut' }}
      style={{
        position: 'absolute',
        left,
        top,
        width: 560,
        height: 196,
        background: 'rgba(9, 14, 26, 0.96)',
        border: '1.5px solid var(--line)',
        borderRadius: 16,
        boxShadow: '0 18px 50px rgba(2, 6, 14, 0.6)',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 24,
          fontFamily: 'var(--font-mono)',
          fontSize: 21,
          fontWeight: 700,
          color: 'var(--fog-200)',
        }}
      >
        ô <span style={{ color: 'var(--cyan)' }}>Cost[{decision.at}]</span>
      </div>

      {label(DEC_ENTRY_X, 'ứng viên')}
      {/* câu hỏi treo lên TỪ lúc có hai số để so (second), trước khi đóng dấu ✗ (gate) */}
      {label(DEC_GATE_X, phase === 'second' || phase === 'gate' ? 'rẻ hơn?' : '')}
      {label(DEC_CELL_X, 'đang giữ')}

      {arrow(DEC_ENTRY_X + 44, DEC_GATE_X - 44)}
      {arrow(DEC_GATE_X + 44, DEC_CELL_X - 52)}

      {/* cổng chặn (chỉ phase gate) */}
      {phase === 'gate' && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            left: DEC_GATE_X,
            top: DEC_ROW_Y,
            transform: 'translate(-50%, -50%)',
            width: 7,
            height: 76,
            borderRadius: 4,
            background: 'var(--red)',
            boxShadow: '0 0 14px rgba(255,122,110,0.5)',
          }}
        />
      )}

      {/* ô đang giữ — trạng thái thật của beat */}
      <div
        style={{
          ...DEC_CHIP,
          left: DEC_CELL_X,
          borderStyle: cellDashed ? 'dashed' : 'solid',
          borderColor: cellColor,
          background: cellRed ? '#2a1512' : cellDashed ? 'var(--ink-2)' : '#143524',
          color: cellColor,
        }}
      >
        {cellShows == null ? '' : cellShows}
      </div>

      {/* ứng viên đứng chờ ở cửa (phase second) */}
      {phase === 'second' && (
        <div style={{ ...DEC_CHIP, left: DEC_ENTRY_X, borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
          {incoming}
        </div>
      )}

      {/* chip chuyển động — hiệu ứng vào */}
      {movingChip && (
        <motion.div
          key={`mv-${phase}-${runId}`}
          initial={{ left: DEC_ENTRY_X, opacity: 0 }}
          animate={{ left: movingLeft, opacity: movingOpacity }}
          transition={{ duration: phase === 'gate' ? 1.0 : 0.85, times: movingTimes, ease: 'easeInOut' }}
          style={{ ...DEC_CHIP, borderColor: movingColor, color: movingColor }}
        >
          {movingVal}
        </motion.div>
      )}

      {/* dấu ✗ khi bị cổng chặn */}
      {phase === 'gate' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.4, ease: 'backOut' }}
          style={{
            position: 'absolute',
            left: DEC_GATE_X,
            top: DEC_ROW_Y - 2,
            transform: 'translate(-50%, -50%)',
            fontSize: 34,
            fontWeight: 800,
            color: 'var(--red)',
          }}
        >
          ✗
        </motion.div>
      )}

      {/* nhãn "X bị mất" (phase overwrite) */}
      {phase === 'overwrite' && held != null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            position: 'absolute',
            left: DEC_CELL_X,
            top: DEC_ROW_Y + 42,
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--red)',
            whiteSpace: 'nowrap',
          }}
        >
          {held} bị mất
        </motion.div>
      )}
    </motion.div>
  )
}
