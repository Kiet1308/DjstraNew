import { AnimatePresence, motion } from 'motion/react'
import { CHAR_MS, CodeLineRow } from './CodeLineRow'
import type { CodeState } from './types'

/**
 * Khung code bên trái (55%): các dòng là phần tử bền vững theo id.
 * Dòng mới ở beat hiện tại (đi xuôi) gõ máy chữ lần lượt theo thứ tự dòng.
 */
export function CodePanel({
  state,
  direction,
  suppressFresh = false,
  width = 1010,
}: {
  state: CodeState
  direction: 1 | -1
  suppressFresh?: boolean
  /** layout động Phần 4: thu hẹp ở beat visual — chữ GIỮ NGUYÊN cỡ, cắt + fade đuôi */
  width?: number
}) {
  const narrow = width < 1010
  const showTyping = direction === 1 && !suppressFresh
  // gõ lần lượt: dòng fresh thứ k bắt đầu sau khi các dòng fresh trước gõ xong
  // (chừa 0.35s cho cú chuyển cảnh 0.7s khi màn visual giao máy quay cho màn code)
  let cumDelay = 0.35
  const delays = new Map<string, number>()
  let lastFreshId: string | null = null
  for (const l of state.lines) {
    if (showTyping && state.freshIds.has(l.id)) {
      delays.set(l.id, cumDelay)
      cumDelay += (l.text.length * CHAR_MS) / 1000 + 0.12
      lastFreshId = l.id
    }
  }

  return (
    <motion.div
      animate={{ width, opacity: narrow ? 0.88 : 1 }}
      transition={{ duration: 0.7, ease: [0.3, 0.8, 0.3, 1] }}
      style={{
        position: 'absolute',
        left: 50,
        top: 44,
        bottom: 56,
        width,
        background: 'var(--ink-2)',
        border: '1.5px solid var(--line-soft)',
        borderRadius: 'var(--radius-panel)',
        boxShadow: 'var(--shadow-panel)',
        padding: '14px 18px',
        overflow: 'hidden',
      }}
    >
      {/* thanh tiêu đề giả cửa sổ editor */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '0 12px 10px',
          borderBottom: '1px solid var(--line-soft)',
          marginBottom: 10,
        }}
      >
        <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff6b63' }} />
        <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#ffc94d' }} />
        <span style={{ width: 13, height: 13, borderRadius: '50%', background: '#39d98a' }} />
        <span
          style={{
            marginLeft: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            color: 'var(--fog-400)',
          }}
        >
          tim-duong.js
        </span>
      </div>

      <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <AnimatePresence initial={false}>
          {state.lines.map((l, i) => (
            <CodeLineRow
              key={l.id}
              line={l}
              num={i + 1}
              highlighted={state.highlight.has(l.id)}
              highlightTone={state.highlightTone}
              fresh={showTyping && state.freshIds.has(l.id)}
              morphed={state.morphedIds.has(l.id)}
              typeDelay={delays.get(l.id) ?? 0}
              showCaret={l.id === lastFreshId}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* dải fade mép phải khi panel hẹp — đuôi dòng dài lặn êm, không vỡ chữ */}
      <motion.div
        animate={{ opacity: narrow ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 90,
          background: 'linear-gradient(to right, rgba(16, 26, 46, 0), var(--ink-2))',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  )
}

/** Checklist 3 câu pseudocode PIN góc — ngoại hóa trí nhớ suốt Phần 4.
    compact = dải ngang 1 hàng (màn visual: nhường chỗ cho đồ thị lớn).
    'all' thắp cả ba — chỉ dùng ở màn code (hàng dọc, đủ chỗ cho 3 câu). */
export function PseudoPin({
  active,
  compact = false,
}: {
  active: 1 | 2 | 3 | 'all' | null
  compact?: boolean
}) {
  const items: { n: 1 | 2 | 3; text: string }[] = [
    { n: 1, text: 'Chọn điểm đang mở có cost bé nhất để chốt' },
    { n: 2, text: 'Chốt xong, mở các điểm nối với nó — ghi cost tốt nhất đã biết' },
    { n: 3, text: 'Lặp — đến khi chốt hết hoặc gặp đích' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: 10,
      }}
    >
      {items.map((it) => {
        const on = active === 'all' || active === it.n
        const showText = !compact || on
        return (
          <motion.div
            key={it.n}
            layout
            animate={{
              opacity: on ? 1 : 0.45,
              scale: on ? 1.02 : 1,
            }}
            transition={{ duration: 0.35, layout: { duration: 0.4, ease: [0.3, 0.8, 0.3, 1] } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: compact ? 19 : 21,
              lineHeight: 1.35,
              color: on ? 'var(--fog-100)' : 'var(--fog-300)',
              background: on ? 'rgba(255, 201, 77, 0.10)' : 'var(--ink-2)',
              border: on ? '1.5px solid var(--amber-deep)' : '1.5px solid var(--line-soft)',
              borderRadius: 12,
              padding: compact ? '8px 14px' : '12px 18px',
              whiteSpace: compact ? 'nowrap' : undefined,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: on ? 'var(--amber)' : 'var(--fog-400)',
                fontSize: compact ? 21 : 24,
                flexShrink: 0,
              }}
            >
              {['①', '②', '③'][it.n - 1]}
            </span>
            {showText && it.text}
          </motion.div>
        )
      })}
    </div>
  )
}
