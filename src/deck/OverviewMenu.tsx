import { AnimatePresence, motion } from 'motion/react'
import { useDeckDispatch, useDeckState } from './DeckProvider'
import { SECTION_LABELS, slides } from './deck'
import type { SectionId } from './types'

const SECTIONS: SectionId[] = [1, 2, 3, 4, 5]

/** Overlay tổng quan (phím O): lưới slide theo phần, click để nhảy. */
export function OverviewMenu() {
  const { overviewOpen, slideIndex } = useDeckState()
  const dispatch = useDeckDispatch()

  return (
    <AnimatePresence>
      {overviewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            background: 'rgba(7, 13, 24, 0.92)',
            padding: '70px 90px',
            display: 'flex',
            flexDirection: 'column',
            gap: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <h2 style={{ fontSize: 44, fontWeight: 800, margin: 0 }}>Tổng quan</h2>
            <span style={{ fontSize: 20, color: 'var(--fog-400)' }}>O / Esc để đóng</span>
          </div>

          <div style={{ display: 'flex', gap: 28, flex: 1 }}>
            {SECTIONS.map((sec) => (
              <div key={sec} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--fog-300)',
                    margin: 0,
                    paddingBottom: 10,
                    borderBottom: '1px solid var(--line-soft)',
                  }}
                >
                  {SECTION_LABELS[sec]}
                </h3>
                {slides.map((s, i) =>
                  s.section !== sec ? null : (
                    <motion.button
                      key={s.id}
                      onClick={(e) => {
                        dispatch({ type: 'GOTO', slideIndex: i })
                        e.currentTarget.blur()
                      }}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        textAlign: 'left',
                        padding: '16px 18px',
                        borderRadius: 12,
                        fontSize: 21,
                        fontWeight: i === slideIndex ? 600 : 400,
                        background: i === slideIndex ? 'var(--ink-3)' : 'var(--ink-2)',
                        border:
                          i === slideIndex
                            ? '1.5px solid var(--amber)'
                            : '1.5px solid var(--line-soft)',
                        color: i === slideIndex ? 'var(--fog-100)' : 'var(--fog-200)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ color: 'var(--fog-400)', marginRight: 10 }}>{i + 1}</span>
                      {s.title}
                    </motion.button>
                  ),
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
