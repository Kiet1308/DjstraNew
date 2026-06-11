import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { sceneBase, type GraphSceneState } from '../../graph/types'
import { TravelerDot } from '../../graph/TravelerDot'
import { CityDecorLayer } from '../../graph/mapDecor'
import { allBigPaths, BIG_TOTAL } from '../../explosion/ExplosionScene'
import { simulatePruning } from '../../explosion/enumeratePaths'
import { useRafLoop } from '../../explosion/useRafLoop'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

const PRUNE = simulatePruning(allBigPaths)

type Beat = {
  scene: GraphSceneState
  callout?: CalloutDef
  frozen?: boolean // traveler đứng khựng ở D với đồng hồ 18 đỏ
  counters?: boolean // màn đếm Đã xét / Cắt sớm
}

const mapScene = sceneBase({ variant: 'map' })

const BEATS = defineBeats<Beat>([
  // b0 — HỎI trước khi phát kiến thức
  {
    scene: mapScene,
    frozen: true,
    callout: {
      tone: 'need',
      text: (
        <>
          Đang thử tuyến mới, đi tới đây thì đồng hồ chỉ <Em color="var(--red)">18</Em> — mà kỷ
          lục đang là <Em>16</Em>. Câu hỏi: tuyến này còn <Em>đáng đi tiếp</Em> không?
        </>
      ),
    },
  },
  // b1 — CẮT
  {
    scene: sceneBase({
      variant: 'map',
      edgeStates: { ED: 'pruned', DB: 'pruned' },
      nodeStates: { D: 'current' },
    }),
    frozen: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          <Em color="var(--red)">Dừng!</Em> Mới nửa đường đã đắt hơn kỷ lục — đi nốt kiểu gì
          cũng chỉ tốn thêm. <Em>CẮT NHÁNH</Em> ngay tại đây, khỏi đi tiếp.
        </>
      ),
    },
  },
  // b2 — Áp dụng đại trà: 2 counter thật
  {
    scene: mapScene,
    counters: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Áp dụng cho thành phố 12 ngã tư: trong{' '}
          <Em>{BIG_TOTAL.toLocaleString('vi-VN')}</Em> tuyến, có{' '}
          <Em color="var(--red)">{PRUNE.cutEarly.toLocaleString('vi-VN')}</Em> tuyến bị cắt
          giữa chừng. Nhanh hơn hẳn!
        </>
      ),
    },
  },
  // b3 — Gài cho S2StillSlow
  {
    scene: mapScene,
    counters: true,
    callout: {
      tone: 'warn',
      text: (
        <>
          Nhưng để ý kỹ: muốn biết chỗ nào đáng cắt, ta vẫn phải{' '}
          <Em>lần theo từng nhánh một</Em> rồi mới biết. Số nhánh phải lần… vẫn là{' '}
          <Em color="var(--red)">{BIG_TOTAL.toLocaleString('vi-VN')}</Em>.
        </>
      ),
    },
  },
])

/**
 * Đồng hồ chi phí cộng dồn của lữ khách: NHẢY SỐ DẦN cùng nhịp chấm chạy,
 * vượt mốc 16 thì lật đỏ — để khán giả TỰ bật ra "dừng lại đi!" trước khi
 * presenter hỏi. animate=false (lùi/beat sau) → hiện thẳng trạng thái lắng.
 */
const FREEZE_MS = 1800
function FrozenMeter({ animate }: { animate: boolean }) {
  const p = mapLayout.D
  const numRef = useRef<HTMLSpanElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const overRef = useRef(false)

  const paintOver = (el: HTMLDivElement | null) => {
    if (!el) return
    el.style.color = 'var(--red)'
    el.style.borderColor = 'var(--red)'
    el.style.background = 'rgba(42, 21, 18, 0.92)'
  }

  useEffect(() => {
    overRef.current = false
    if (!animate) {
      if (numRef.current) numRef.current.textContent = '18 > 16'
      paintOver(boxRef.current)
    } else if (boxRef.current) {
      // bắt đầu trắng/lạnh — chưa có gì đáng ngại
      boxRef.current.style.color = 'var(--fog-100)'
      boxRef.current.style.borderColor = 'var(--line)'
      boxRef.current.style.background = 'rgba(13, 21, 38, 0.92)'
      if (numRef.current) numRef.current.textContent = '0'
    }
  }, [animate])

  useRafLoop(animate, (_dt, t) => {
    const v = Math.min(18, (t / FREEZE_MS) * 18)
    const shown = Math.round(v)
    if (numRef.current) {
      numRef.current.textContent = shown > 16 ? `${shown} > 16` : String(shown)
    }
    if (v > 16 && !overRef.current) {
      overRef.current = true
      paintOver(boxRef.current)
    }
  })

  return (
    <motion.div
      ref={boxRef}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'absolute',
        left: p.x + 50,
        top: p.y - 120,
        fontFamily: 'var(--font-mono)',
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--fog-100)',
        background: 'rgba(13, 21, 38, 0.92)',
        border: '2.5px solid var(--line)',
        borderRadius: 14,
        padding: '10px 22px',
        zIndex: 12,
        transition: 'color 0.25s, border-color 0.25s, background 0.25s',
      }}
    >
      đã đi: <span ref={numRef}>0</span>
    </motion.div>
  )
}

/** Hai counter Đã xét / Cắt sớm — đếm bằng rAF, ghi thẳng textContent. */
function PruneCounters({ active }: { active: boolean }) {
  const triedRef = useRef<HTMLSpanElement>(null)
  const cutRef = useRef<HTMLSpanElement>(null)
  const state = useRef({ v: 0 })

  // useLayoutEffect: ghi số TRƯỚC paint đầu — không lóe "0/0" khi đến từ chiều lùi
  useLayoutEffect(() => {
    if (!active) {
      state.current.v = BIG_TOTAL
      if (triedRef.current) triedRef.current.textContent = BIG_TOTAL.toLocaleString('vi-VN')
      if (cutRef.current) cutRef.current.textContent = PRUNE.cutEarly.toLocaleString('vi-VN')
    } else {
      state.current.v = 0
    }
  }, [active])

  useRafLoop(active, (dt) => {
    const s = state.current
    if (s.v >= BIG_TOTAL) return
    s.v = Math.min(BIG_TOTAL, s.v + dt * 0.45)
    const tried = Math.floor(s.v)
    const cut = Math.floor((PRUNE.cutEarly / BIG_TOTAL) * s.v)
    if (triedRef.current) triedRef.current.textContent = tried.toLocaleString('vi-VN')
    if (cutRef.current) cutRef.current.textContent = cut.toLocaleString('vi-VN')
  })

  const box = (label: string, ref: React.RefObject<HTMLSpanElement | null>, color: string) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(13, 21, 38, 0.92)',
        border: `2px solid ${color}`,
        borderRadius: 16,
        padding: '18px 40px',
      }}
    >
      <span
        ref={ref}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 64,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        0
      </span>
      <span style={{ fontSize: 22, color: 'var(--fog-300)' }}>{label}</span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 40,
        zIndex: 12,
      }}
    >
      {box('tuyến đã xét', triedRef, 'var(--cyan)')}
      {box('bị cắt giữa chừng', cutRef, 'var(--red)')}
    </motion.div>
  )
}

function S2PruningSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={def.counters ? 0.3 : 1} />
      <motion.div
        animate={{ opacity: def.counters ? 0.3 : 1 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <GraphView graph={cityGraph} scene={def.scene} />
        {def.frozen && (
          <TravelerDot
            route={['A', 'D']}
            layout={mapLayout}
            runId="freeze"
            duration={1800}
            pinToEnd={beat > 0 || direction === -1}
            color="var(--red)"
          />
        )}
      </motion.div>

      <AnimatePresence>
        {def.frozen && <FrozenMeter animate={beat === 0 && direction === 1} />}
      </AnimatePresence>
      <AnimatePresence>
        {def.counters && <PruneCounters active={beat === 2 && direction === 1} />}
      </AnimatePresence>

      <CalloutSlot callout={def.callout} beatKey={beat} y={def.counters ? 840 : 54} x={def.counters ? 410 : 70} w={def.counters ? 1100 : 900} />
    </div>
  )
}

export const S2Pruning: SlideDef = {
  id: 's2-cat-nhanh',
  title: 'Cắt nhánh sớm',
  section: 2,
  beats: BEATS.count,
  component: S2PruningSlide,
}
