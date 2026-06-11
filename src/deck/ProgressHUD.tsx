import { AnimatePresence, motion } from 'motion/react'
import { useDeckState } from './DeckProvider'
import { SECTION_LABELS, slides } from './deck'
import { gateKey } from './types'

/**
 * HUD kín đáo dưới đáy sân khấu: nhãn phần (trung tính), gợi ý gate khi
 * presenter bấm NEXT mà gate còn khóa, và tiến độ beat của slide hiện tại.
 */
export function ProgressHUD() {
  const { slideIndex, beat, nudge, resolvedGates } = useDeckState()
  const slide = slides[slideIndex]
  const atLockedGate =
    (slide.gateBeats?.includes(beat) ?? false) && !resolvedGates[gateKey(slide.id, beat)]
  const showHint = atLockedGate && nudge > 0

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        gap: 24,
        background: 'linear-gradient(to top, rgba(7, 13, 24, 0.85), rgba(7, 13, 24, 0))',
        zIndex: 40,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--fog-400)',
          whiteSpace: 'nowrap',
        }}
      >
        {SECTION_LABELS[slide.section]}
      </span>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence>
          {showHint && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{ fontSize: 19, color: 'var(--fog-200)', whiteSpace: 'nowrap' }}
            >
              <span
                style={{
                  color: 'var(--cyan)',
                  animation: 'hud-dot-pulse 1.4s ease-in-out infinite',
                }}
              >
                ●
              </span>{' '}
              {slide.gateHint ?? 'click một điểm trên hình'} · Enter để bỏ qua
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {Array.from({ length: slide.beats }, (_, i) => (
            <span
              key={i}
              style={{
                width: i === beat ? 8 : 5,
                height: i === beat ? 8 : 5,
                borderRadius: '50%',
                background:
                  i < beat ? 'var(--fog-400)' : i === beat ? 'var(--cyan)' : 'var(--fog-500)',
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 18, color: 'var(--fog-400)', fontVariantNumeric: 'tabular-nums' }}>
          {slideIndex + 1} / {slides.length}
        </span>
      </div>
    </div>
  )
}
