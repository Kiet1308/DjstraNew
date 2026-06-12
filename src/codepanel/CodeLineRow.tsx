import { motion } from 'motion/react'
import { tokenize, TOKEN_COLORS } from './tokenize'
import type { CodeLine } from './types'

/** Tốc độ gõ máy chữ — CodePanel dùng chung hằng này để tính delay nối tiếp. */
export const CHAR_MS = 26

/**
 * Một dòng code. Motion layout lo trượt dọc/thụt ngang (wrap op).
 * Dòng mới (đi xuôi) gõ máy chữ bằng width 0ch→Nch — KHÔNG đụng layout dọc.
 */
export function CodeLineRow({
  line,
  num,
  highlighted,
  highlightTone,
  fresh,
  morphed,
  typeDelay = 0,
  showCaret = false,
}: {
  line: CodeLine
  num: number
  highlighted: boolean
  /** 'danger' = dòng đang gây họa — nền đỏ thay nền cyan */
  highlightTone?: 'danger'
  fresh: boolean
  morphed: boolean
  typeDelay?: number
  /** chỉ MỘT dòng (dòng fresh cuối) được con trỏ — một máy chữ, một con trỏ */
  showCaret?: boolean
}) {
  const chars = line.text.length
  const typeDur = (chars * CHAR_MS) / 1000

  const content =
    line.kind === 'placeholder' ? (
      <span style={{ color: 'var(--amber)', fontStyle: 'italic', opacity: 0.95 }}>
        {line.text}
      </span>
    ) : (
      tokenize(line.text).map((t, i) => (
        <span
          key={i}
          style={{
            color: TOKEN_COLORS[t.kind],
            fontStyle: t.kind === 'comment' ? 'italic' : undefined,
          }}
        >
          {t.text}
        </span>
      ))
    )

  return (
    <motion.div
      layout="position"
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ layout: { duration: 0.45, ease: [0.3, 0.8, 0.3, 1] }, opacity: { duration: 0.2 } }}
      style={{
        display: 'flex',
        alignItems: 'baseline',
        minHeight: 32,
        background: highlighted
          ? highlightTone === 'danger'
            ? 'rgba(255, 122, 110, 0.12)'
            : 'rgba(79, 216, 235, 0.09)'
          : 'transparent',
        boxShadow: highlighted
          ? `inset 3px 0 0 ${highlightTone === 'danger' ? 'var(--red)' : 'var(--cyan)'}`
          : 'none',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: 56,
          flexShrink: 0,
          textAlign: 'right',
          paddingRight: 22,
          fontSize: 17,
          color: 'var(--fog-500)',
          fontFamily: 'var(--font-mono)',
          userSelect: 'none',
        }}
      >
        {num}
      </span>
      <motion.div
        layout="position"
        style={{
          paddingLeft: line.indent * 30,
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-code)',
          whiteSpace: 'pre',
          display: 'flex',
          alignItems: 'baseline',
        }}
        transition={{ layout: { duration: 0.45, ease: [0.3, 0.8, 0.3, 1] } }}
      >
        {fresh ? (
          <>
            <motion.span
              key={`type-${line.id}-${line.text}`}
              initial={{ width: '0ch' }}
              animate={{ width: `${chars}ch` }}
              transition={{ duration: typeDur, ease: 'linear', delay: typeDelay }}
              style={{ overflow: 'hidden', whiteSpace: 'pre', display: 'inline-block' }}
            >
              {content}
            </motion.span>
            {showCaret && (
              <span
                style={{
                  display: 'inline-block',
                  width: 11,
                  height: 24,
                  marginLeft: 2,
                  background: 'var(--cyan)',
                  animation: 'caret-blink 0.9s step-end infinite',
                  alignSelf: 'center',
                }}
              />
            )}
          </>
        ) : morphed ? (
          <motion.span
            key={`morph-${line.text}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {content}
          </motion.span>
        ) : (
          <span>{content}</span>
        )}
      </motion.div>
    </motion.div>
  )
}
