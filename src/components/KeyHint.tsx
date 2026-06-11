import type { ReactNode } from 'react'

/** Chip phím bấm nhỏ, ví dụ: <KeyHint>→</KeyHint> để bắt đầu */
export function KeyHint({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        display: 'inline-block',
        minWidth: 34,
        padding: '4px 10px',
        borderRadius: 8,
        border: '1.5px solid var(--line)',
        borderBottomWidth: 3,
        background: 'var(--ink-2)',
        color: 'var(--fog-200)',
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 1.4,
      }}
    >
      {children}
    </kbd>
  )
}
