import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Callout } from '../../components/Callout'
import { CodePanel, PseudoPin } from '../../codepanel/CodePanel'
import type { CodeState } from '../../codepanel/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import { AsidePanel } from './AsidePanel'

/**
 * Bố cục Phần 4 — visualizer cũng là nhân vật chính, không chỉ code.
 * MÁY QUAY THEO MÀN, KHÔNG THEO BEAT: state.focus DÍNH (sticky trong kịch bản)
 * nên trong một màn không gì đổi kích thước — hết cảnh bơm phồng/xẹp mỗi click.
 * Đổi focus ở ranh giới màn là một cú chuyển cảnh có chủ đích (0.7s):
 * - màn VISUAL: đồ thị nở 1188×668 (430 khi màn có thẻ phụ), code thu 600px
 *   (chữ GIỮ nguyên cỡ, cắt + fade đuôi dòng — không scale nhỏ chữ)
 * - màn CODE: code nở full 1010px đọc trọn dòng, đồ thị về 778×432
 * Mode suy thuần túy từ beat (fold sticky) → tiến/lùi/GOTO đều đúng.
 * Thẻ aside được kịch bản gom LIỀN MẠCH trong màn — chiều cao đồ thị
 * không nhún khi thẻ vào/ra giữa chừng.
 *
 * Mini graph: crop-trước-scale — nội dung đồ thị chỉ chiếm ~x:180→1760,
 * y:160→1020 trên mặt phẳng 1920×1080; cắt lề trống trước rồi mới scale
 * để cùng một khung hiển thị được hình to hơn ~22%.
 */
const CROP_X = 180
const CROP_Y = 160
const EASE = [0.3, 0.8, 0.3, 1] as const
/** Chuyển cảnh giữa hai màn — hiếm nên được phép thong thả, mượt như chuyển cảnh phim. */
export const CAMERA = { duration: 0.7, ease: EASE }

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
  const visual = state.focus === 'visual'
  const codeW = visual ? 600 : 1010
  const colLeft = codeW + 50 + 32 // mép trái cột phải = code + lề + khe
  const colW = 1920 - 50 - colLeft
  const graphW = colW
  // có aside thì đồ thị nhường chỗ — cột chỉ cao 980px, aside KHÔNG được bị nghiền
  const graphH = visual ? (state.aside ? 430 : 668) : 432
  const scale = visual ? (state.aside ? 0.49 : 0.75) : 0.485
  // vùng crop rộng 1580 — scale nhỏ (màn có thẻ) thì căn giữa, khỏi thừa mép phải
  const graphX = Math.max(0, (graphW - (1760 - CROP_X) * scale) / 2)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CodePanel state={state} direction={direction} suppressFresh={suppressFresh} width={codeW} />

      <motion.div
        animate={{ left: colLeft, width: colW }}
        transition={CAMERA}
        style={{
          position: 'absolute',
          left: colLeft,
          width: colW,
          top: 44,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {showPseudoPin && <PseudoPin active={state.pseudoStep} compact={visual} />}

        {/* mini đồ thị — GraphView 1920×1080 crop + thu nhỏ */}
        {state.graphScene && (
          <motion.div
            animate={{ width: graphW, height: graphH }}
            transition={CAMERA}
            style={{
              position: 'relative',
              width: graphW,
              height: graphH,
              overflow: 'hidden',
              borderRadius: 16,
              border: '1.5px solid var(--line-soft)',
              background: 'var(--ink-0)',
              flexShrink: 0,
            }}
          >
            <motion.div
              animate={{ scale, x: graphX }}
              transition={CAMERA}
              style={{ position: 'absolute', scale, x: graphX, transformOrigin: 'top left' }}
            >
              <div
                style={{
                  width: 1920,
                  height: 1080,
                  transform: `translate(${-CROP_X}px, ${-CROP_Y}px)`,
                }}
              >
                <GraphView graph={cityGraph} scene={state.graphScene} />
              </div>
            </motion.div>
          </motion.div>
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
              <Callout key={state.calloutKey} tone={state.callout.tone} style={{ fontSize: 29 }}>
                {state.callout.text}
              </Callout>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
