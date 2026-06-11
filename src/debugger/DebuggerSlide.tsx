import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { SlideDef, SlideProps } from '../deck/types'
import { useDeckDispatch, useDeckState } from '../deck/DeckProvider'
import { buildCodeState } from '../codepanel/buildCodeState'
import { PREV_SCRIPT } from '../codepanel/codeScript'
import { CodePanel } from '../codepanel/CodePanel'
import { Callout } from '../components/Callout'
import { KeyHint } from '../components/KeyHint'
import { cityGraph } from '../graph/data'
import { GraphView } from '../graph/GraphView'
import { TRACE } from './trace'
import { VarsPanel } from './VarsPanel'

// trang code hoàn chỉnh (sau S4Prev) — debugger chỉ rọi từng dòng
const FINAL_CODE = buildCodeState(PREV_SCRIPT, PREV_SCRIPT.length - 1)

// Dev-assert: mọi lineId trong trace phải tồn tại trên trang code —
// gõ nhầm id sẽ chỉ "lặng lẽ không highlight", đúng loại lỗi lên sóng mới lộ.
if (import.meta.env.DEV) {
  const ids = new Set(FINAL_CODE.lines.map((l) => l.id))
  for (const f of TRACE) {
    if (!ids.has(f.lineId)) throw new Error(`trace: lineId lạ "${f.lineId}"`)
  }
}

function DebuggerSlideComponent({ beat, direction }: SlideProps) {
  const dispatch = useDeckDispatch()
  const clamped = Math.max(0, Math.min(TRACE.length - 1, beat))
  const frame = TRACE[clamped]
  // lùi: so với frame VỪA RỜI (k+1) để ô lóe đúng giá trị vừa đổi trên màn
  const prevFrame =
    direction === -1
      ? TRACE[Math.min(TRACE.length - 1, clamped + 1)]
      : clamped > 0
        ? TRACE[clamped - 1]
        : undefined

  const codeState = useMemo(
    () => ({
      ...FINAL_CODE,
      highlight: new Set([frame.lineId]),
      freshIds: new Set<string>(),
      morphedIds: new Set<string>(),
      callout: undefined,
    }),
    [frame.lineId],
  )

  // Autoplay: P bật/tắt, 800ms/frame; bấm phím khác là dừng (presenter cầm lái)
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(playing)
  playingRef.current = playing
  const overviewOpen = useDeckState().overviewOpen
  useEffect(() => {
    if (overviewOpen) setPlaying(false)
  }, [overviewOpen])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overviewOpen) return
      if (e.key === 'p' || e.key === 'P') setPlaying((p) => !p)
      else if (playingRef.current) setPlaying(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overviewOpen])
  useEffect(() => {
    if (!playing) return
    if (beat >= TRACE.length - 1) {
      setPlaying(false)
      return
    }
    const t = setInterval(() => dispatch({ type: 'NEXT' }), 800)
    return () => clearInterval(t)
  }, [playing, beat, dispatch])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CodePanel state={codeState} direction={1} suppressFresh />

      <div
        style={{
          position: 'absolute',
          left: 1102,
          right: 50,
          top: 44,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* mini đồ thị */}
        <div
          style={{
            position: 'relative',
            width: 768,
            height: 400,
            overflow: 'hidden',
            borderRadius: 16,
            border: '1.5px solid var(--line-soft)',
            background: 'var(--ink-0)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 1920,
              height: 1080,
              transform: 'scale(0.4) translateY(-60px)',
              transformOrigin: 'top left',
            }}
          >
            <GraphView graph={cityGraph} scene={frame.scene} />
          </div>
        </div>

        <VarsPanel vars={frame.vars} prevVars={prevFrame?.vars} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10 }}>
          <AnimatePresence mode="wait">
            {frame.note && (
              <Callout key={beat} tone="neutral" style={{ fontSize: 28, padding: '16px 22px' }}>
                {frame.note}
              </Callout>
            )}
          </AnimatePresence>
          <motion.div
            initial={false}
            animate={{ opacity: playing ? 1 : 0.55 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 19,
              color: playing ? 'var(--green)' : 'var(--fog-400)',
            }}
          >
            <KeyHint>P</KeyHint>
            {playing ? 'đang tự chạy — bấm phím bất kỳ để dừng' : 'tự chạy từng nhịp'}
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 18 }}>
              nhịp {beat + 1}/{TRACE.length}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export const S4Debugger: SlideDef = {
  id: 's4-chay-thu',
  title: 'Cho máy chạy thật',
  section: 4,
  beats: TRACE.length,
  component: DebuggerSlideComponent,
}
