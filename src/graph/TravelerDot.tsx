import { motion, useAnimationFrame, useMotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { LayoutMap } from './layouts'
import type { NodeId } from './types'
import { routeToPathD, usePointAlongPath } from './usePointAlongPath'

/**
 * Chấm lữ khách chạy dọc một tuyến đường (chuỗi đỉnh).
 * - Path đo ẩn bằng opacity 0 (KHÔNG display:none).
 * - runId đổi → chạy lại từ đầu; pinToEnd=true (lùi beat) → đậu sẵn ở cuối.
 * - onArrive gọi đúng một lần khi tới đích.
 */
export function TravelerDot({
  route,
  layout,
  runId,
  duration = 3000,
  pinToEnd = false,
  color = 'var(--cyan)',
  trail = true,
  size = 13,
  holdAt,
  onArrive,
}: {
  route: NodeId[]
  layout: LayoutMap
  runId: string
  duration?: number
  pinToEnd?: boolean
  color?: string
  trail?: boolean
  size?: number
  /** khựng lại tại tiến độ t (0..1) trong ms mili-giây — cú "ơ, hết đường" ở ngõ cụt */
  holdAt?: { t: number; ms: number }
  onArrive?: () => void
}) {
  const d = routeToPathD(route.map((id) => layout[id]).filter(Boolean))
  const { pathRef, sample } = usePointAlongPath()
  const cx = useMotionValue(-100)
  const cy = useMotionValue(-100)
  const trailLen = useMotionValue(0)
  const startRef = useRef<number | null>(null)
  const doneRef = useRef(false)

  // Đổi tuyến/run → reset đồng hồ (StrictMode-safe: chỉ reset ref)
  useEffect(() => {
    startRef.current = null
    doneRef.current = false
  }, [runId, d, pinToEnd])

  useAnimationFrame((t) => {
    if (pinToEnd) {
      const p = sample(1)
      if (p) {
        cx.set(p.x)
        cy.set(p.y)
        trailLen.set(1)
      }
      return
    }
    if (startRef.current === null) startRef.current = t
    const elapsed = t - startRef.current
    let progress: number
    if (holdAt) {
      const tHold = holdAt.t * duration
      if (elapsed < tHold) progress = elapsed / duration
      else if (elapsed < tHold + holdAt.ms) progress = holdAt.t // chững lại
      else progress = Math.min(1, (elapsed - holdAt.ms) / duration)
    } else {
      progress = Math.min(1, elapsed / duration)
    }
    const p = sample(progress)
    if (p) {
      cx.set(p.x)
      cy.set(p.y)
      trailLen.set(progress)
    }
    if (progress >= 1 && !doneRef.current) {
      doneRef.current = true
      onArrive?.()
    }
  })

  if (!d) return null

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* path đo — ẩn nhưng vẫn được layout */}
      <path ref={pathRef} d={d} fill="none" stroke="none" style={{ opacity: 0 }} />
      {trail && (
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ pathLength: trailLen, opacity: 0.35 }}
        />
      )}
      <motion.circle r={size + 9} style={{ cx, cy }} fill={color} opacity={0.18} />
      <motion.circle
        r={size}
        style={{ cx, cy }}
        fill={color}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={2.5}
      />
    </svg>
  )
}
