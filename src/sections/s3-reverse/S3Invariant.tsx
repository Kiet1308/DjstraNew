import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import type { GraphSceneState } from '../../graph/types'
import { Callout } from '../../components/Callout'
import { Em, type CalloutDef } from './common'
import { finalScene } from './scenes'

/* Quy luật ĐÃ vỡ ra ngay trong màn sương (FogWalk b12) — slide này chỉ
   NHÌN LẠI: gói hành trình thành một động tác, rồi bắc cầu sang pseudocode.
   Không suy diễn gì mới, không replay bài giảng. */

type Beat = { scene: GraphSceneState; panel?: CalloutDef; focusB?: boolean }

const BEATS = defineBeats<Beat>([
  // b0 — recap MỘT động tác
  {
    scene: finalScene,
    panel: {
      tone: 'insight',
      text: (
        <>
          Cả màn sương vừa rồi, gói lại chỉ còn <Em>MỘT động tác</Em> lặp đi lặp lại:{' '}
          <Em>chốt điểm đang mở rẻ nhất</Em> → <Em>mở các điểm nối từ nó</Em> → lặp.
        </>
      ),
    },
  },
  // b1 — bằng chứng "không một bước lãng phí" (trả nợ lời hứa đầu màn sương)
  {
    scene: finalScene,
    panel: {
      tone: 'insight',
      text: (
        <>
          Và để ý món quà: dãy số chốt <Em>4 → 6 → 10 → 14 → 16</Em> chỉ có đi lên — không số
          nào phải quay lại sửa. Đúng <Em>lời hứa đầu màn sương</Em>: mỗi bước xong hẳn một
          điểm — <Em>không một bước lãng phí</Em>.
        </>
      ),
    },
  },
  // b2 — điểm dừng → bắc cầu sang 3 câu pseudocode
  {
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
        animate={{ opacity: 0.22 }}
        initial={{ opacity: 0.22 }}
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
  title: 'Nhìn lại hành trình',
  section: 3,
  beats: BEATS.count,
  component: S3InvariantSlide,
}
