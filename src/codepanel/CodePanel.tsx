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
}: {
  state: CodeState
  direction: 1 | -1
  suppressFresh?: boolean
}) {
  const showTyping = direction === 1 && !suppressFresh
  // gõ lần lượt: dòng fresh thứ k bắt đầu sau khi các dòng fresh trước gõ xong
  let cumDelay = 0
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
    <div
      style={{
        position: 'absolute',
        left: 50,
        top: 44,
        bottom: 56,
        width: 1010,
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
              fresh={showTyping && state.freshIds.has(l.id)}
              morphed={state.morphedIds.has(l.id)}
              typeDelay={delays.get(l.id) ?? 0}
              showCaret={l.id === lastFreshId}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/** Checklist 3 câu pseudocode PIN góc — ngoại hóa trí nhớ suốt Phần 4. */
export function PseudoPin({ active }: { active: 1 | 2 | 3 | null }) {
  const items: { n: 1 | 2 | 3; text: string }[] = [
    { n: 1, text: 'Chọn điểm đang mở có cost bé nhất để chốt' },
    { n: 2, text: 'Chốt xong, mở các điểm nối với nó — ghi cost tốt nhất đã biết' },
    { n: 3, text: 'Lặp — đến khi chốt hết hoặc gặp đích' },
  ]
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {items.map((it) => {
        const on = active === it.n
        return (
          <motion.div
            key={it.n}
            animate={{
              opacity: on ? 1 : 0.45,
              scale: on ? 1.02 : 1,
            }}
            transition={{ duration: 0.35 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 21,
              lineHeight: 1.35,
              color: on ? 'var(--fog-100)' : 'var(--fog-300)',
              background: on ? 'rgba(255, 201, 77, 0.10)' : 'var(--ink-2)',
              border: on ? '1.5px solid var(--amber-deep)' : '1.5px solid var(--line-soft)',
              borderRadius: 12,
              padding: '12px 18px',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                color: on ? 'var(--amber)' : 'var(--fog-400)',
                fontSize: 24,
                flexShrink: 0,
              }}
            >
              {['①', '②', '③'][it.n - 1]}
            </span>
            {it.text}
          </motion.div>
        )
      })}
    </div>
  )
}
