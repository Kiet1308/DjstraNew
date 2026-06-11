import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import type { GraphSceneState } from '../../graph/types'
import { Callout } from '../../components/Callout'
import { Em, type CalloutDef } from './common'
import { cutScene, finalScene } from './scenes'

type Beat = { graphOpacity: number; scene: GraphSceneState; panel?: CalloutDef; focusB?: boolean }

const BEATS = defineBeats<Beat>([
  {
    graphOpacity: 0.22,
    scene: finalScene,
    panel: {
      tone: 'need',
      text: (
        <>
          Năm lần chốt vừa rồi — có để ý ta <Em>luôn chọn theo kiểu gì</Em> không? Nhìn dãy số
          phía trên.
        </>
      ),
    },
  },
  {
    graphOpacity: 0.22,
    scene: finalScene,
    panel: {
      tone: 'insight',
      text: (
        <>
          Dãy số chỉ có <Em>tăng dần</Em> — vì ở mỗi bước, ta luôn chốt được điểm{' '}
          <Em>ĐANG MỞ có cost nhỏ nhất</Em> hiện tại.
        </>
      ),
    },
  },
  {
    graphOpacity: 1,
    scene: cutScene,
    panel: {
      tone: 'insight',
      text: (
        <>
          Vì sao luôn chốt được? Nhớ đường "lẻn": mọi ngả khác đều phải chui qua một điểm đang
          mở có cost <Em>không nhỏ hơn</Em> — rồi từ đó đi tiếp chỉ dài thêm.
        </>
      ),
    },
  },
  {
    graphOpacity: 0.22,
    scene: finalScene,
    focusB: true,
    panel: {
      tone: 'need',
      text: (
        <>
          Vậy muốn tìm đường ngắn nhất đến đâu — cứ <Em>chốt liên tiếp</Em> cho đến khi gặp nó.
          Gặp <Em>B</Em> là xong việc.
        </>
      ),
    },
  },
])

const CHIPS = [
  { label: 'C=4', id: 'C' },
  { label: 'G=6', id: 'G' },
  { label: 'E=10', id: 'E' },
  { label: 'D=14', id: 'D' },
  { label: 'B=16', id: 'B' },
]

function S3InvariantSlide({ beat }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <motion.div
        animate={{ opacity: def.graphOpacity }}
        transition={{ duration: 0.8 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <GraphView graph={cityGraph} scene={def.scene} />
      </motion.div>

      {/* Dãy chip thứ tự chốt */}
      <div
        style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          zIndex: 15,
        }}
      >
        <span
          style={{
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'var(--fog-400)',
            marginRight: 12,
          }}
        >
          Thứ tự chốt
        </span>
        {CHIPS.map((c, i) => {
          const highlight = !def.focusB || c.id === 'B'
          return (
            <motion.span
              key={c.id}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: highlight ? 1 : 0.45, y: 0, scale: def.focusB && c.id === 'B' ? 1.18 : 1 }}
              transition={{ delay: beat === 0 ? 0.4 + i * 0.3 : 0, duration: 0.45, ease: 'backOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                fontFamily: 'var(--font-mono)',
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              {i > 0 && <span style={{ color: 'var(--fog-400)', fontSize: 24 }}>→</span>}
              <span
                style={{
                  background: 'var(--amber)',
                  color: '#1a1206',
                  borderRadius: 14,
                  padding: '10px 22px',
                  boxShadow: def.focusB && c.id === 'B' ? '0 0 34px rgba(255, 201, 77, 0.55)' : 'none',
                }}
              >
                {c.label} ✓
              </span>
            </motion.span>
          )
        })}
      </div>

      {/* Panel phát biểu */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 110,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
        }}
      >
        <AnimatePresence mode="wait">
          {def.panel && (
            <Callout key={beat} tone={def.panel.tone} style={{ maxWidth: 1240 }}>
              {def.panel.text}
            </Callout>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const S3Invariant: SlideDef = {
  id: 's3-quy-luat',
  title: 'Quy luật lộ ra',
  section: 3,
  beats: BEATS.count,
  component: S3InvariantSlide,
}
