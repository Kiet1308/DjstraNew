import { AnimatePresence, motion } from 'motion/react'
import type { LayoutMap } from './layouts'
import type { GraphEdgeDef, NodeId } from './types'
import { useSvgIds } from './svgIds'

/**
 * Nội dung <mask> cho chế độ sương: rect đen phủ kín + vùng trắng quanh các
 * đỉnh đã lộ (gradient mềm) + "hành lang" dọc các cạnh ĐÃ BIẾT (3 lớp stroke
 * chồng nhau giả soft-edge — KHÔNG feGaussianBlur vì hiệu năng).
 * AnimatePresence phải nằm Ở ĐÂY (bọc trực tiếp danh sách) thì exit mới chạy.
 */
export function FogMaskContent({
  revealed,
  layout,
  litEdges,
  radius = 235,
}: {
  revealed: NodeId[]
  layout: LayoutMap
  /** CHỈ các cạnh đã biết (đã mở từ đỉnh chốt) — không phải mọi cặp đỉnh lộ */
  litEdges: GraphEdgeDef[]
  radius?: number
}) {
  return (
    <>
      <rect x={-100} y={-100} width={2120} height={1280} fill="black" />
      <AnimatePresence>
        {litEdges.map((e) => {
          const a = layout[e.from]
          const b = layout[e.to]
          const d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`
          return (
            <motion.g
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <path d={d} stroke="white" strokeOpacity={0.22} strokeWidth={170} strokeLinecap="round" fill="none" />
              <path d={d} stroke="white" strokeOpacity={0.45} strokeWidth={120} strokeLinecap="round" fill="none" />
              <path d={d} stroke="white" strokeWidth={70} strokeLinecap="round" fill="none" />
            </motion.g>
          )
        })}
      </AnimatePresence>
      <AnimatePresence>
        {revealed.map((id) => {
          const p = layout[id]
          if (!p) return null
          return <FogCircle key={id} x={p.x} y={p.y} r={radius} />
        })}
      </AnimatePresence>
    </>
  )
}

function FogCircle({ x, y, r }: { x: number; y: number; r: number }) {
  const ids = useSvgIds()
  return (
    <motion.circle
      cx={x}
      cy={y}
      fill={`url(#${ids.fogSoft})`}
      initial={{ r: 0 }}
      animate={{ r }}
      exit={{ r: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  )
}

/**
 * Khí quyển sương: các vệt sáng mờ lớn trôi chậm bằng CSS keyframes,
 * lớp HTML phía trên SVG, không chặn chuột.
 */
export function FogAtmosphere({ opacity = 1 }: { opacity?: number }) {
  const blob = (
    background: string,
    w: number,
    h: number,
    left: number,
    top: number,
    anim: string,
  ) => (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        left,
        top,
        background,
        borderRadius: '50%',
        animation: anim,
        willChange: 'transform',
      }}
    />
  )

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        transition: 'opacity 1.2s ease',
        overflow: 'hidden',
      }}
    >
      {blob(
        'radial-gradient(ellipse at center, rgba(147, 163, 196, 0.10), transparent 65%)',
        1100,
        520,
        100,
        80,
        'fog-drift 26s ease-in-out infinite',
      )}
      {blob(
        'radial-gradient(ellipse at center, rgba(94, 111, 147, 0.12), transparent 65%)',
        900,
        460,
        850,
        450,
        'fog-drift-2 31s ease-in-out infinite',
      )}
      {blob(
        'radial-gradient(ellipse at center, rgba(147, 163, 196, 0.07), transparent 60%)',
        1300,
        600,
        500,
        550,
        'fog-drift 39s ease-in-out infinite reverse',
      )}
    </div>
  )
}
