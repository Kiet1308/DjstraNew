import { AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'
import { Callout } from '../../components/Callout'
import { CodePanel, PseudoPin } from '../../codepanel/CodePanel'
import type { CodeState } from '../../codepanel/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import { AsidePanel } from './AsidePanel'

/**
 * Bố cục chung Phần 4: 55% code trái / 45% phải gồm
 * checklist pseudocode pin (ngoại hóa trí nhớ) + mini đồ thị + lời dẫn.
 */
export function S4Layout({
  state,
  direction,
  suppressFresh = false,
  showPseudoPin = true,
  extraRight,
}: {
  state: CodeState
  direction: 1 | -1
  suppressFresh?: boolean
  showPseudoPin?: boolean
  extraRight?: ReactNode
}) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CodePanel state={state} direction={direction} suppressFresh={suppressFresh} />

      <div
        style={{
          position: 'absolute',
          left: 1102,
          right: 50,
          top: 44,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {showPseudoPin && <PseudoPin active={state.pseudoStep} />}

        {/* mini đồ thị — GraphView 1920×1080 thu nhỏ */}
        {state.graphScene && (
          <div
            style={{
              position: 'relative',
              width: 768,
              height: 432,
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
                transform: 'scale(0.4)',
                transformOrigin: 'top left',
              }}
            >
              <GraphView graph={cityGraph} scene={state.graphScene} />
            </div>
          </div>
        )}

        {/* hình phụ theo beat: bảng map / Path thừa / chuỗi Prev */}
        <AnimatePresence mode="wait">
          {state.aside && <AsidePanel key={state.aside} kind={state.aside} />}
        </AnimatePresence>

        {extraRight}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {/* key theo calloutKey: cặp beat need→ops dùng chung lời, KHÔNG nháy lại */}
          <AnimatePresence mode="wait">
            {state.callout && (
              <Callout key={state.calloutKey} tone={state.callout.tone} style={{ fontSize: 28 }}>
                {state.callout.text}
              </Callout>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
