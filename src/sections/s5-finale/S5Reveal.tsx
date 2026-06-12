import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import { finalScene } from '../s3-reverse/scenes'

/**
 * FINALE — nơi DUY NHẤT trong toàn bộ ứng dụng cái tên được phép xuất hiện.
 */
type Beat = { stage: 0 | 1 | 2 | 3 }

const BEATS = defineBeats<Beat>([{ stage: 0 }, { stage: 1 }, { stage: 2 }, { stage: 3 }])

const JOURNEY = [
  'đặt ra vấn đề',
  'tư duy phản biện',
  'hình thành ý tưởng',
  'triển khai ý tưởng',
  'tối ưu giải pháp',
]

function S5RevealSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const dly = (d: number) => (direction === 1 ? d : 0)

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* nền: thành quả mờ phía sau */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.14 }}>
        <GraphView graph={cityGraph} scene={finalScene} />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 38,
          textAlign: 'center',
          padding: '0 200px',
        }}
      >
        {/* hành trình 5 chặng */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {JOURNEY.map((j, i) => (
            <motion.span
              key={j}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dly(0.15 + i * 0.28) }}
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
            >
              {i > 0 && <span style={{ color: 'var(--fog-500)', fontSize: 20 }}>→</span>}
              <span
                style={{
                  fontSize: 20,
                  color: 'var(--fog-300)',
                  border: '1.5px solid var(--line-soft)',
                  background: 'var(--ink-2)',
                  borderRadius: 999,
                  padding: '8px 18px',
                }}
              >
                {j}
              </span>
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dly(1.6) }}
          style={{ fontSize: 36, color: 'var(--fog-100)', margin: 0, lineHeight: 1.5 }}
        >
          Từ đầu đến giờ, mọi người vừa <strong style={{ color: 'var(--amber)' }}>TỰ suy luận</strong>{' '}
          ra một thuật toán hoàn chỉnh.
        </motion.p>

        <AnimatePresence>
          {def.stage >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: dly(0.2) }}
                style={{ fontSize: 28, color: 'var(--fog-300)', margin: 0 }}
              >
                Thuật toán ấy chính là thuật toán tìm đường nổi tiếng nhất thế giới:
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.82, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: dly(0.7), duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 150,
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(100deg, var(--path-a), var(--path-b))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 0 60px rgba(255, 201, 77, 0.25))',
                }}
              >
                DIJKSTRA
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {def.stage >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: dly(0.2) }}
              style={{ fontSize: 28, color: 'var(--fog-200)', margin: 0, lineHeight: 1.6, maxWidth: 1280 }}
            >
              — phát biểu lần đầu cách đây khoảng <strong style={{ color: 'var(--fog-100)' }}>70 năm</strong>{' '}
              (1956), bởi Edsger W. Dijkstra. Ông ấy chỉ là người{' '}
              <strong style={{ color: 'var(--fog-100)' }}>tìm ra đầu tiên</strong> — còn suy luận
              thì, như mọi người vừa thấy,{' '}
              <strong style={{ color: 'var(--amber)' }}>nó không hề khó</strong>.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {def.stage >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: dly(0.4), duration: 0.8 }}
              style={{ fontSize: 30, color: 'var(--fog-300)', margin: '18px 0 0' }}
            >
              Cảm ơn mọi người đã theo dõi.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export const S5Reveal: SlideDef = {
  id: 's5-lo-dien',
  title: 'Lộ diện',
  section: 5,
  beats: BEATS.count,
  component: S5RevealSlide,
}
