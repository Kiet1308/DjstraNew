import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { bigLayout } from './bigGraph'
import { allBigPaths, BigGraphBase } from './ExplosionScene'
import { computeSnipEvents } from './enumeratePaths'
import { useRafLoop } from './useRafLoop'
import { routeToPathD } from '../graph/usePointAlongPath'

/** Số liệu THẬT từ mô phỏng cắt nhánh trên bigGraph (deterministic). */
export const SNIP = computeSnipEvents(allBigPaths)
export const BIGGEST_SNIP = SNIP.biggest

const PREFIX_D = routeToPathD(BIGGEST_SNIP.prefix.map((id) => bigLayout[id]))
const SUFFIX_DS = BIGGEST_SNIP.suffixes.map((s) => routeToPathD(s.map((id) => bigLayout[id])))
const CUT_AT = bigLayout[BIGGEST_SNIP.prefix[BIGGEST_SNIP.prefix.length - 1]]
const KILLED = BIGGEST_SNIP.suffixes.length

export type SnipPhase = 'fanout' | 'snipped'

/**
 * Cảnh "soi MỘT nhát kéo" trên bản đồ 12 ngã tư: tiền tố đỏ đi vào (đã đắt
 * hơn kỷ lục) → cả chùm tuyến tương lai chưa thử tỏa ra từ điểm cắt →
 * nhát kéo đóng: cả chùm rụng cùng lúc, không tốn thêm bước chân nào.
 * Render THUẦN từ `phase`; animate=false (đến từ chiều lùi) = trạng thái lắng.
 */
export function SnipScene({ phase, animate }: { phase: SnipPhase; animate: boolean }) {
  const snipped = phase === 'snipped'
  const countRef = useRef<HTMLSpanElement>(null)

  // counter "…tuyến chưa thử" đếm dần theo nhịp ghost mọc (chỉ khi đi xuôi)
  useEffect(() => {
    if (!countRef.current) return
    if (!animate || snipped) countRef.current.textContent = String(KILLED)
    else countRef.current.textContent = '0'
  }, [animate, snipped])
  useRafLoop(animate && !snipped, (_dt, t) => {
    // ghost i mọc tại 1.4s + i*0.07 — counter bám đúng nhịp đó
    const grown = Math.max(0, Math.min(KILLED, Math.floor((t / 1000 - 1.4) / 0.07) + 1))
    if (countRef.current) countRef.current.textContent = String(grown)
  })

  const ghostDelay = (i: number) => (animate && !snipped ? 1.4 + i * 0.07 : 0)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0 }}
      >
        <BigGraphBase />

        {/* chùm tuyến tương lai chưa thử — tỏa từ điểm cắt */}
        <g>
          {SUFFIX_DS.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke={snipped ? 'var(--red-dim)' : 'var(--cyan)'}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="10 9"
              initial={animate && !snipped ? { pathLength: 0, opacity: 0 } : false}
              animate={{
                pathLength: 1,
                // nhát kéo: flash đỏ một nhịp rồi rụng đồng loạt theo sóng
                opacity: snipped ? (animate ? [0.45, 0.6, 0.07] : 0.07) : 0.32,
              }}
              transition={
                snipped
                  ? { duration: 0.8, delay: animate ? i * 0.02 : 0 }
                  : {
                      pathLength: { duration: 0.6, ease: 'easeOut', delay: ghostDelay(i) },
                      opacity: { duration: 0.3, delay: ghostDelay(i) },
                    }
              }
            />
          ))}
        </g>

        {/* tiền tố đắt đỏ đi vào */}
        <motion.path
          d={PREFIX_D}
          fill="none"
          stroke="var(--red)"
          strokeWidth={6}
          strokeLinecap="round"
          initial={animate && !snipped ? { pathLength: 0 } : false}
          animate={{ pathLength: 1, opacity: snipped ? 0.8 : 1 }}
          transition={{ pathLength: { duration: 1.2, ease: 'easeInOut' } }}
        />

        {/* dấu ✕ đóng tại điểm cắt */}
        {snipped && (
          <motion.text
            x={CUT_AT.x}
            y={CUT_AT.y - 38}
            textAnchor="middle"
            fontSize={54}
            fontWeight={800}
            fill="var(--red)"
            initial={animate ? { opacity: 0, scale: 1.6 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            ✕
          </motion.text>
        )}
      </svg>

      {/* chip đồng hồ tại điểm cắt + counter chùm — lớp HTML */}
      <motion.div
        initial={animate && !snipped ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animate && !snipped ? 0.9 : 0 }}
        style={{
          position: 'absolute',
          left: CUT_AT.x + 46,
          top: CUT_AT.y - 130,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 12,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--red)',
            background: 'rgba(42, 21, 18, 0.94)',
            border: '2.5px solid var(--red)',
            borderRadius: 14,
            padding: '8px 18px',
            whiteSpace: 'nowrap',
          }}
        >
          đã đi: {BIGGEST_SNIP.prefixCost} &gt; kỷ lục {BIGGEST_SNIP.bestAtTime}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 26,
            fontWeight: 700,
            color: snipped ? 'var(--red)' : 'var(--cyan)',
            background: 'rgba(13, 21, 38, 0.94)',
            border: `2px solid ${snipped ? 'var(--red)' : 'var(--cyan)'}`,
            borderRadius: 14,
            padding: '8px 18px',
            whiteSpace: 'nowrap',
          }}
        >
          {snipped ? (
            <>−{KILLED} tuyến — 0 bước chân</>
          ) : (
            <>
              <span ref={countRef}>0</span> tuyến chưa thử
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
