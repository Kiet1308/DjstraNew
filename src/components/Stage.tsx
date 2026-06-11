import { useEffect, useState, type ReactNode } from 'react'

const DESIGN_W = 1920
const DESIGN_H = 1080

function computeScale() {
  return Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
}

/**
 * Mặt phẳng thiết kế cố định 1920×1080, scale bằng transform.
 * Mọi layout bên trong dùng pixel tuyệt đối — không responsive.
 */
export function Stage({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(computeScale)

  useEffect(() => {
    const onResize = () => setScale(computeScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="stage-viewport">
      <div
        className="stage-plane"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
