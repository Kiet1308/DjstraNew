import { AnimatePresence, motion } from 'motion/react'
import { useCallback } from 'react'
import { Stage } from '../components/Stage'
import { useDeckDispatch, useDeckState } from './DeckProvider'
import { slides } from './deck'
import { gateKey } from './types'
import { ProgressHUD } from './ProgressHUD'
import { OverviewMenu } from './OverviewMenu'
import { useKeyboardNav } from './useKeyboardNav'
import { RoomHUD } from '../room/RoomHUD'

/**
 * Vỏ trình chiếu: Stage 1920×1080 + slide hiện tại (chuyển cảnh trượt ngang
 * theo hướng) + HUD + Overview. AnimatePresence chỉ key theo SLIDE — beat chỉ
 * đổi props của cây phần tử bền vững, không remount.
 */
export function DeckShell() {
  useKeyboardNav()
  const state = useDeckState()
  const dispatch = useDeckDispatch()

  const { slideIndex, beat, direction, resolvedGates, nudge } = state
  const slide = slides[slideIndex]
  const SlideComponent = slide.component
  const isGateBeat = slide.gateBeats?.includes(beat) ?? false
  const gateResolved = !isGateBeat || !!resolvedGates[gateKey(slide.id, beat)]

  const resolveGate = useCallback(() => dispatch({ type: 'RESOLVE_GATE' }), [dispatch])

  return (
    <Stage>
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={{
            enter: (dir: 1 | -1) => ({ x: dir * 110, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: 1 | -1) => ({ x: dir * -110, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0.24, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <SlideComponent
            beat={beat}
            direction={direction}
            gateResolved={gateResolved}
            resolveGate={resolveGate}
            nudge={nudge}
          />
        </motion.div>
      </AnimatePresence>
      <ProgressHUD />
      <RoomHUD />
      <OverviewMenu />
    </Stage>
  )
}
