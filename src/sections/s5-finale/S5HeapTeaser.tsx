import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { Em } from '../s3-reverse/common'

/**
 * Gợi mở tối ưu — SỐ CỤ THỂ thay ký hiệu: 1.000.000 bước → ~20 bước.
 * (log₂ 10⁶ ≈ 20 — con số thật.) KHÔNG đi sâu heap.
 * Beat 0 CHỈ hỏi — khán giả vừa dựng vòng quét min xong, đủ sức tự trả lời.
 */
type Beat = { stage: 0 | 1 | 2 | 3 }

const BEATS = defineBeats<Beat>([{ stage: 0 }, { stage: 1 }, { stage: 2 }, { stage: 3 }])

function Bar({ width, color, label, value, delay }: { width: number; color: string; label: string; value: string; delay: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontSize: 24, color: 'var(--fog-300)' }}>{label}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 40,
            fontWeight: 700,
            color,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 22, color: 'var(--fog-400)' }}>bước</span>
      </div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width }}
        transition={{ duration: 1.1, delay, ease: 'easeOut' }}
        style={{
          height: 26,
          minWidth: 4,
          borderRadius: 8,
          background: color,
          boxShadow: `0 0 30px ${color === 'var(--red)' ? 'rgba(255,122,110,0.3)' : 'rgba(126,232,162,0.35)'}`,
        }}
      />
    </div>
  )
}

function S5HeapTeaserSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const dly = (d: number) => (direction === 1 ? d : 0)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 240px',
        gap: 46,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 46, fontWeight: 800, margin: 0 }}
      >
        Bước nào đang <span style={{ color: 'var(--red)' }}>tốn nhất</span>?
        <AnimatePresence>
          {def.stage === 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: dly(0.6) }}
              style={{ display: 'block', fontSize: 26, fontWeight: 400, color: 'var(--fog-400)', marginTop: 18 }}
            >
              (nhìn lại trang code vừa dựng — đoạn nào phải cày nhiều nhất?)
            </motion.span>
          )}
        </AnimatePresence>
      </motion.h2>

      <AnimatePresence>
        {def.stage >= 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 30, color: 'var(--fog-200)', margin: 0, lineHeight: 1.55 }}
          >
            Chính là cú <Em color="var(--red)">quét tìm min</Em> — bản đồ{' '}
            <Em>1.000.000 điểm</Em> thì MỖI LẦN chốt phải quét 1.000.000 bước.
          </motion.p>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: 10 }}>
        {def.stage >= 1 && (
          <Bar
            width={1380}
            color="var(--red)"
            label="quét trơn:"
            value="1.000.000"
            delay={dly(0.4)}
          />
        )}
        <AnimatePresence>
          {def.stage >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontSize: 30, color: 'var(--fog-200)', margin: '0 0 26px', lineHeight: 1.55 }}>
                Nhưng nếu <Em>sắp xếp dữ liệu khéo léo</Em> — xếp các điểm đang mở thành một
                cấu trúc luôn đẩy sẵn điểm bé nhất lên đầu — thì mỗi lần lấy min chỉ mất
                chừng…
              </p>
              <Bar width={28} color="var(--green)" label="lấy khéo:" value="~20" delay={dly(0.7)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {def.stage >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}
          >
            <p style={{ fontSize: 25, color: 'var(--fog-300)', margin: 0 }}>
              Con số ~20 kỳ diệu ấy, dân toán gọi là <Em>log n</Em> (log₂ 1.000.000 ≈ 20).
            </p>
            <p style={{ fontSize: 21, color: 'var(--fog-400)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              cho ai tò mò tra cứu thêm: độ phức tạp khi đó ≈ O((n + E) log n)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S5HeapTeaser: SlideDef = {
  id: 's5-lay-kheo',
  title: 'Lấy min cho khéo',
  section: 5,
  beats: BEATS.count,
  component: S5HeapTeaserSlide,
}
