import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { Em } from './common'

/**
 * Phát biểu 3 câu — dùng "điểm / đoạn nối / các điểm nối với nó",
 * CHƯA dùng "đỉnh kề" (tên đó chỉ đến khi viết code, Phần 4).
 */
const STATEMENTS = [
  {
    num: '①',
    text: (
      <>
        Chọn điểm <Em color="var(--cyan)">đang mở</Em> có cost <Em>bé nhất</Em> để{' '}
        <Em>chốt</Em>.
      </>
    ),
  },
  {
    num: '②',
    text: (
      <>
        Chốt xong, <Em color="var(--cyan)">mở</Em> các điểm nối với nó — ghi cost{' '}
        <Em>tốt nhất đã biết</Em>.
      </>
    ),
  },
  {
    num: '③',
    text: (
      <>
        Lặp — đến khi <Em>chốt hết</Em> hoặc <Em>gặp đích</Em>.
      </>
    ),
  },
]

type Beat = { shown: number; closing?: boolean }

const BEATS = defineBeats<Beat>([
  { shown: 0 },
  { shown: 1 },
  { shown: 2 },
  { shown: 3 },
  { shown: 3, closing: true },
])

function S3PseudocodeSlide({ beat }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
        padding: '0 220px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 24 }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--fog-400)',
            marginBottom: 14,
          }}
        >
          Ý tưởng đã tròn
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, margin: 0 }}>
          Phát biểu thành lời — đúng 3 câu
        </h1>
      </motion.div>

      {STATEMENTS.map((s, i) => (
        <AnimatePresence key={s.num}>
          {def.shown > i && (
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{
                opacity: 1,
                x: 0,
                boxShadow: def.closing
                  ? '0 0 44px rgba(255, 201, 77, 0.18)'
                  : '0 18px 50px rgba(2, 6, 14, 0.55)',
              }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.55, ease: [0.22, 0.9, 0.3, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                width: 1180,
                background: 'var(--ink-2)',
                border: def.closing ? '1.5px solid var(--amber-deep)' : '1.5px solid var(--line-soft)',
                borderRadius: 18,
                padding: '30px 40px',
                fontSize: 36,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  fontSize: 44,
                  color: 'var(--amber)',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {s.num}
              </span>
              <span>{s.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      <AnimatePresence>
        {def.closing && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 27, color: 'var(--fog-300)', margin: '26px 0 0' }}
          >
            Ba câu này là <strong style={{ color: 'var(--fog-100)' }}>toàn bộ phương pháp</strong>.
            Việc còn lại: dịch chúng thành code chạy được →
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S3Pseudocode: SlideDef = {
  id: 's3-ba-cau',
  title: 'Ba câu chốt hạ',
  section: 3,
  beats: BEATS.count,
  component: S3PseudocodeSlide,
}
