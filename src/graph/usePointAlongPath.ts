import { useCallback, useRef } from 'react'

/**
 * Đo điểm dọc theo một path SVG ẩn.
 * Path đo phải render với opacity 0 — KHÔNG display:none
 * (getTotalLength trả 0 khi phần tử không được layout).
 */
export function usePointAlongPath() {
  const pathRef = useRef<SVGPathElement | null>(null)

  const sample = useCallback((t: number): { x: number; y: number } | null => {
    const el = pathRef.current
    if (!el) return null
    const total = el.getTotalLength()
    if (!total) return null
    const p = el.getPointAtLength(Math.max(0, Math.min(1, t)) * total)
    return { x: p.x, y: p.y }
  }, [])

  return { pathRef, sample }
}

/** Chuỗi đỉnh → path data polyline. */
export function routeToPathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}
