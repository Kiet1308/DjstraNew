import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

export type CalloutTone = 'need' | 'insight' | 'warn' | 'neutral'

const TONE_COLOR: Record<CalloutTone, string> = {
  need: 'var(--cyan)',
  insight: 'var(--amber)',
  warn: 'var(--red)',
  neutral: 'var(--fog-300)',
}

/**
 * Khối lời dẫn lớn (≥28px) ở lớp HTML phía trên đồ thị.
 * Bọc trong AnimatePresence ở phía slide nếu cần exit animation.
 */
export function Callout({
  tone = 'neutral',
  children,
  style,
}: {
  tone?: CalloutTone
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        fontSize: 'var(--fs-callout)',
        lineHeight: 1.45,
        color: 'var(--fog-100)',
        background: 'rgba(13, 21, 38, 0.88)',
        border: '1.5px solid var(--line-soft)',
        borderLeft: `5px solid ${TONE_COLOR[tone]}`,
        borderRadius: 14,
        padding: '22px 30px',
        boxShadow: 'var(--shadow-panel)',
        backdropFilter: 'blur(6px)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}
