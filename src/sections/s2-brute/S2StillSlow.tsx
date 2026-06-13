import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { Em } from '../s3-reverse/common'

/**
 * Khoảng lặng chuyển hồi: cắt nhánh đã giúp, nhưng CÂU HỎI đang đặt
 * ("tuyến nào ngắn nhất?") bắt ta xét từng tuyến → cần cách NGHĨ khác.
 */
type Beat = { stage: 0 | 1 | 2 }

const BEATS = defineBeats<Beat>([{ stage: 0 }, { stage: 1 }, { stage: 2 }])

const LINES = [
  {
    key: 'l0',
    body: (
      <>
        Cắt nhánh là một bước tiến thật — mỗi chuyến đi <Em>ngắn hẳn</Em>. Nhưng vẫn phải{' '}
        <Em color="var(--red)">mò đến tận nơi</Em> mới biết chỗ cắt — bản đồ càng to, số lần
        mò càng <Em color="var(--red)">bùng nổ</Em>.
      </>
    ),
  },
  {
    key: 'l1',
    body: (
      <>
        Vấn đề không nằm ở nhanh hay chậm — nó nằm ở <Em>câu hỏi</Em>. Hỏi{' '}
        <span style={{ fontStyle: 'italic', color: 'var(--fog-100)', marginRight: 6 }}>
          "tuyến nào ngắn nhất?"
        </span>{' '}
        là tự buộc mình xét <Em color="var(--red)">từng tuyến một</Em>.
      </>
    ),
  },
  {
    key: 'l2',
    body: (
      <>
        Muốn thoát, phải <Em color="var(--cyan)">đổi cách nghĩ</Em> — không xét từng tuyến hoàn
        chỉnh.
      </>
    ),
  },
]

function S2StillSlowSlide({ beat }: SlideProps) {
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
        gap: 44,
        padding: '0 300px',
        textAlign: 'center',
      }}
    >
      {LINES.map((l, i) => (
        <AnimatePresence key={l.key}>
          {def.stage >= i && (
            <motion.p
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: def.stage === i ? 1 : 0.42, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: i === 2 ? 52 : 38,
                fontWeight: i === 2 ? 800 : 400,
                lineHeight: 1.5,
                margin: 0,
                color: 'var(--fog-200)',
              }}
            >
              {l.body}
            </motion.p>
          )}
        </AnimatePresence>
      ))}

      <AnimatePresence>
        {def.stage === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={{ fontSize: 25, color: 'var(--fog-400)', marginTop: 30 }}
          >
            (phần tiếp theo: thử quay ống kính lại…)
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S2StillSlow: SlideDef = {
  id: 's2-van-cham',
  title: 'Vẫn chậm',
  section: 2,
  beats: BEATS.count,
  component: S2StillSlowSlide,
}
