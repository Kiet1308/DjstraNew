import { useEffect, useRef } from 'react'

/**
 * Vòng rAF an toàn với StrictMode: cleanup hủy frame, callback luôn là bản mới.
 * dt/t tính bằng ms; t = thời gian từ lúc active.
 */
export function useRafLoop(active: boolean, cb: (dt: number, t: number) => void) {
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = -1
    let t0 = -1
    const tick = (now: number) => {
      if (t0 < 0) {
        t0 = now
        last = now
      }
      cbRef.current(now - last, now - t0)
      last = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
}
