import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { sceneBase, type NodeId } from '../../graph/types'
import { TravelerDot } from '../../graph/TravelerDot'
import { CityDecorLayer, MapPin } from '../../graph/mapDecor'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

/**
 * Thử từng tuyến — KHÔNG hiện trọng số cạnh, chỉ hiện TỔNG mỗi tuyến
 * (giữ thông tin cho Phần 3 khám phá). Tổng = đúng theo trọng số thật:
 * A→D→B=24, A→C→D→B=22, A→G→H = ngõ cụt, A→C→E→B=16.
 */
type Try = {
  id: string
  route: NodeId[]
  label: string
  total: number | null // null = ngõ cụt
  holdAt?: { t: number; ms: number }
}

const TRIES: Try[] = [
  { id: 't1', route: ['A', 'D', 'B'], label: 'A → D → B', total: 24 },
  { id: 't2', route: ['A', 'C', 'D', 'B'], label: 'A → C → D → B', total: 22 },
  {
    id: 't3',
    route: ['A', 'G', 'H', 'G'],
    label: 'A → G → H …',
    total: null,
    // tới H (≈2/3 quãng polyline đi-và-về) thì khựng 650ms: "ơ, hết đường"
    holdAt: { t: 0.667, ms: 650 },
  },
  { id: 't4', route: ['A', 'C', 'E', 'B'], label: 'A → C → E → B', total: 16 },
]

type Beat = {
  running: number // chỉ số TRIES đang chạy, -1 = không
  done: number[]
  best: number | null
  callout?: CalloutDef
}

const BEATS = defineBeats<Beat>([
  {
    running: -1,
    done: [],
    best: null,
    callout: {
      tone: 'need',
      text: (
        <>
          Cách nghĩ đơn giản nhất: cứ <Em>THỬ TẤT CẢ</Em> các tuyến, đo tổng chi phí từng tuyến,
          giữ lại tuyến bé nhất.
        </>
      ),
    },
  },
  {
    running: 0,
    done: [],
    best: 24,
    callout: {
      tone: 'neutral',
      text: (
        <>
          Tuyến thứ nhất: A → D → B — tổng <Em>24</Em>. Ghi sổ: tốt nhất hiện tại = 24.
        </>
      ),
    },
  },
  {
    running: 1,
    done: [0],
    best: 22,
    callout: {
      tone: 'neutral',
      text: (
        <>
          Tuyến nữa: A → C → D → B — tổng <Em>22</Em>. Tốt hơn! Kỷ lục mới.
        </>
      ),
    },
  },
  {
    running: 2,
    done: [0, 1],
    best: 22,
    callout: {
      tone: 'warn',
      text: (
        <>
          Tuyến này thì… đi mãi tới H là <Em color="var(--red)">hết đường</Em> — không dẫn đến
          đích. Quay đầu. Tuyến A → G → H bị loại.
        </>
      ),
    },
  },
  {
    running: 3,
    done: [0, 1, 2],
    best: 16,
    callout: {
      tone: 'insight',
      text: (
        <>
          A → C → E → B — tổng <Em>16</Em>. Kỷ lục mới! Nhưng muốn <Em>chắc chắn</Em> nó là bé
          nhất… vẫn phải thử nốt những tuyến còn lại.
        </>
      ),
    },
  },
  {
    running: -1,
    done: [0, 1, 2, 3],
    best: 16,
    callout: {
      tone: 'need',
      text: (
        <>
          Bản đồ nhỏ này có cả thảy <Em>8</Em> tuyến tới đích. Đi 4 chuyến mới đo xong{' '}
          <Em>3</Em> — còn tốn nguyên một chuyến đâm ngõ cụt. Thành phố <Em>thật</Em> thì
          sao?
        </>
      ),
    },
  },
])

const scene = sceneBase({ variant: 'map' })

function S2TryAllSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const running = def.running >= 0 ? TRIES[def.running] : null

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} />
      <GraphView graph={cityGraph} scene={scene} />
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <MapPin x={mapLayout.A.x} y={mapLayout.A.y - 18} color="var(--cyan)" label="XUẤT PHÁT" />
        <MapPin
          x={mapLayout.B.x}
          y={mapLayout.B.y - 18}
          color="var(--amber)"
          label="ĐÍCH"
          labelSide="left"
        />
      </svg>

      {running && (
        <TravelerDot
          route={running.route}
          layout={mapLayout}
          runId={running.id}
          duration={running.total === null ? 3400 : 2400}
          pinToEnd={direction === -1}
          color={running.total === null ? 'var(--red)' : 'var(--cyan)'}
          holdAt={running.holdAt}
        />
      )}

      <CalloutSlot callout={def.callout} beatKey={beat} w={860} />

      {/* sổ ghi các tuyến đã thử + kỷ lục */}
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 15,
          alignItems: 'flex-end',
        }}
      >
        {/* Sổ kỷ lục: KHÔNG được biến mất lúc traveler chạy — Minh cần mốc để so.
            Trong lúc chạy hiện kỷ lục CŨ; chấm về đích mới nhảy số. */}
        {(() => {
          const prevBest = beat > 0 ? BEATS.at(beat - 1).best : null
          const runningNow = !!running && direction === 1
          const numberSwaps = runningNow && def.best !== prevBest
          if (def.best === null) return null
          return (
            <motion.div
              initial={
                numberSwaps && prevBest === null ? { opacity: 0, scale: 1.2 } : false
              }
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.3, duration: 0.5, ease: 'backOut' }}
              style={{
                fontSize: 27,
                fontWeight: 800,
                color: '#1a1206',
                background: 'var(--amber)',
                borderRadius: 14,
                padding: '12px 24px',
              }}
            >
              Tốt nhất hiện tại:{' '}
              {numberSwaps && prevBest !== null ? (
                <span style={{ position: 'relative', display: 'inline-block', minWidth: 34 }}>
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 2.35, duration: 0.2 }}
                  >
                    {prevBest}
                  </motion.span>
                  <motion.span
                    style={{ position: 'absolute', left: 0, display: 'inline-block' }}
                    initial={{ opacity: 0, scale: 1.35 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.35, duration: 0.45, ease: 'backOut' }}
                  >
                    {def.best}
                  </motion.span>
                </span>
              ) : (
                def.best
              )}
            </motion.div>
          )
        })()}
        <AnimatePresence>
          {[...def.done, ...(running ? [def.running] : [])].map((i) => {
            const t = TRIES[i]
            const isRunning = i === def.running
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  delay: isRunning && direction === 1 ? (t.total === null ? 3.0 : 2.2) : 0.1,
                }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: t.total === null ? 'var(--red)' : 'var(--fog-200)',
                  background: 'rgba(13, 21, 38, 0.9)',
                  border: `1.5px solid ${t.total === null ? 'var(--red-dim)' : 'var(--line)'}`,
                  borderRadius: 11,
                  padding: '9px 18px',
                }}
              >
                {t.label} {t.total === null ? '✗ ngõ cụt' : `= ${t.total}`}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const S2TryAll: SlideDef = {
  id: 's2-thu-het',
  title: 'Thử mọi con đường',
  section: 2,
  beats: BEATS.count,
  component: S2TryAllSlide,
}
