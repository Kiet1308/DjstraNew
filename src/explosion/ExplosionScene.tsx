import { useEffect, useMemo, useRef } from 'react'
import { bigGraph, bigLayout } from './bigGraph'
import { enumeratePaths } from './enumeratePaths'
import { useRafLoop } from './useRafLoop'
import { routeToPathD } from '../graph/usePointAlongPath'

const POOL_SIZE = 8
const POOL_COLORS = [
  'var(--cyan)',
  'var(--violet)',
  'var(--green)',
  '#ff9d6e',
  '#7aa8ff',
  '#ffd76e',
  '#6effd8',
  '#ff7ab8',
]

export const allBigPaths = enumeratePaths(bigGraph, 'S', 'T')
export const BIG_TOTAL = allBigPaths.length

/** Nền đồ thị 12 ngã tư — dùng chung cho ExplosionScene và SnipScene. */
export function BigGraphBase() {
  return (
    <>
      <g>
        {bigGraph.edges.map((e) => {
          const a = bigLayout[e.from]
          const b = bigLayout[e.to]
          return (
            <line
              key={e.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--line-soft)"
              strokeWidth={2.5}
            />
          )
        })}
      </g>
      <g>
        {bigGraph.nodes.map((n) => {
          const p = bigLayout[n.id]
          const isEnd = n.id === 'S' || n.id === 'T'
          return (
            <g key={n.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isEnd ? 30 : 17}
                fill={isEnd ? '#0f2733' : 'var(--ink-3)'}
                stroke={isEnd ? 'var(--cyan)' : 'var(--line)'}
                strokeWidth={isEnd ? 3 : 2}
              />
              {isEnd && (
                <text
                  x={p.x}
                  y={p.y + 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                  fontWeight={800}
                  fill="var(--fog-100)"
                >
                  {n.id === 'S' ? 'A' : 'B'}
                </text>
              )}
            </g>
          )
        })}
      </g>
    </>
  )
}

/**
 * Cảnh bùng nổ tổ hợp: pool 8 path tái sử dụng + counter tăng tốc
 * (1 đường/s → hàng chục mỗi frame). MỘT vòng rAF, không setState —
 * counter ghi thẳng ref.textContent.
 */
export function ExplosionScene({
  running,
  settled,
  onDone,
}: {
  /** đang chạy đếm (beat explosion, đi xuôi) */
  running: boolean
  /** đã xong / tới từ chiều lùi — hiện trạng thái lắng */
  settled: boolean
  onDone?: () => void
}) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const slotRefs = useRef<(SVGPathElement | null)[]>([])
  const state = useRef({
    count: 0,
    rate: 1.2, // đường/giây — sẽ nhân dần
    done: false,
    slots: Array.from({ length: POOL_SIZE }, (_, i) => ({
      pathIndex: i,
      startT: 0,
      len: 0,
      dur: 1100,
    })),
  })

  const pathDs = useMemo(
    () => allBigPaths.map((p) => routeToPathD(p.nodes.map((id) => bigLayout[id]))),
    [],
  )

  // reset khi bắt đầu chạy lại HOẶC khi rời về trạng thái "chưa vào cuộc"
  // (lùi giữa lúc đếm không được để counter/vệt màu đông cứng dở dang)
  useEffect(() => {
    if (settled) return
    const s = state.current
    s.count = 0
    s.rate = 1.2
    s.done = false
    s.slots.forEach((sl, i) => {
      sl.pathIndex = i
      sl.startT = 0
      sl.len = 0
      sl.dur = 1100
    })
    if (counterRef.current) counterRef.current.textContent = '0'
    if (!running) {
      for (const el of slotRefs.current) el?.setAttribute('stroke-opacity', '0')
    }
  }, [running, settled])

  // trạng thái lắng: số cuối, pool ẩn
  useEffect(() => {
    if (settled && counterRef.current) {
      counterRef.current.textContent = BIG_TOTAL.toLocaleString('vi-VN')
      for (const el of slotRefs.current) el?.setAttribute('stroke-opacity', '0')
    }
  }, [settled])

  useRafLoop(running && !settled && !state.current.done, (dt, t) => {
    const s = state.current
    if (s.done) return

    // counter tăng tốc — nhân rate theo thời gian, trần 2000/s
    s.rate = Math.min(2000, s.rate * (1 + dt * 0.0011))
    s.count += (s.rate * dt) / 1000
    if (s.count >= BIG_TOTAL) {
      s.count = BIG_TOTAL
      s.done = true
      onDone?.()
    }
    if (counterRef.current) {
      counterRef.current.textContent = Math.floor(s.count).toLocaleString('vi-VN')
    }

    // pool path: mỗi slot vẽ nhanh một tuyến rồi nhảy tuyến khác
    const slotDur = Math.max(120, 1100 - t * 0.18)
    for (let i = 0; i < POOL_SIZE; i++) {
      const slot = s.slots[i]
      const el = slotRefs.current[i]
      if (!el) continue
      if (slot.startT === 0 || t - slot.startT > slot.dur) {
        // sang tuyến tiếp theo của làn này
        if (slot.startT !== 0) slot.pathIndex = (slot.pathIndex + POOL_SIZE) % allBigPaths.length
        slot.startT = t
        slot.dur = slotDur
        el.setAttribute('d', pathDs[slot.pathIndex])
        slot.len = el.getTotalLength()
        el.setAttribute('stroke-dasharray', `${slot.len} ${slot.len}`)
      }
      const p = Math.min(1, (t - slot.startT) / slot.dur)
      el.setAttribute('stroke-dashoffset', String(slot.len * (1 - p)))
      el.setAttribute('stroke-opacity', String(p < 0.85 ? 0.75 : 0.75 * (1 - (p - 0.85) / 0.15)))
    }
    if (s.done) {
      for (const el of slotRefs.current) el?.setAttribute('stroke-opacity', '0')
    }
  })

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* nền đồ thị 12 ngã tư — pool đường chạy kẹp giữa cạnh và đỉnh */}
        <g>
          {bigGraph.edges.map((e) => {
            const a = bigLayout[e.from]
            const b = bigLayout[e.to]
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--line-soft)"
                strokeWidth={2.5}
              />
            )
          })}
        </g>

        {/* pool 8 đường chạy */}
        {Array.from({ length: POOL_SIZE }, (_, i) => (
          <path
            key={i}
            ref={(el) => {
              slotRefs.current[i] = el
            }}
            fill="none"
            stroke={POOL_COLORS[i]}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeOpacity={0}
          />
        ))}

        {/* đỉnh */}
        <g>
          {bigGraph.nodes.map((n) => {
            const p = bigLayout[n.id]
            const isEnd = n.id === 'S' || n.id === 'T'
            return (
              <g key={n.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isEnd ? 30 : 17}
                  fill={isEnd ? '#0f2733' : 'var(--ink-3)'}
                  stroke={isEnd ? 'var(--cyan)' : 'var(--line)'}
                  strokeWidth={isEnd ? 3 : 2}
                />
                {isEnd && (
                  <text
                    x={p.x}
                    y={p.y + 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={26}
                    fontWeight={800}
                    fill="var(--fog-100)"
                  >
                    {n.id === 'S' ? 'A' : 'B'}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* counter lớn — ẩn hẳn khi chưa vào cuộc đếm */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: 20,
          zIndex: 10,
          opacity: running || settled ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        <span
          ref={counterRef}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 96,
            fontWeight: 700,
            color: 'var(--fog-100)',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 50px rgba(79, 216, 235, 0.3)',
          }}
        >
          0
        </span>
        <span style={{ fontSize: 30, color: 'var(--fog-300)' }}>tuyến đã thử</span>
      </div>
    </div>
  )
}
