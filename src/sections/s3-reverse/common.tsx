import { AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'
import { Callout, type CalloutTone } from '../../components/Callout'
import { sceneBase, type GraphSceneState } from '../../graph/types'

export type CalloutDef = { tone: CalloutTone; text: ReactNode }

export type ScenePatch = Partial<GraphSceneState>

/** Phần 3 giữ BẢN ĐỒ xuyên suốt — morph sang đồ thị dời sang đầu Phần 4. */
export function mapScene(over: Partial<GraphSceneState> = {}): GraphSceneState {
  return sceneBase({ ...over, variant: 'map' })
}

/** Lùi beat = trạng thái lắng: bỏ stagger delay của mũi tên phụ thuộc. */
export function stripDepDelays(scene: GraphSceneState): GraphSceneState {
  if (!scene.depArrows) return scene
  return {
    ...scene,
    depArrows: {
      ...scene.depArrows,
      arrows: scene.depArrows.arrows.map((a) => ({ ...a, delay: 0 })),
    },
  }
}

/** Gộp patch vào scene gốc — các record node/edge/cost merge theo key. */
export function mergeScene(base: GraphSceneState, patch?: ScenePatch): GraphSceneState {
  if (!patch) return base
  return {
    ...base,
    ...patch,
    nodeStates: { ...base.nodeStates, ...(patch.nodeStates ?? {}) },
    edgeStates: { ...base.edgeStates, ...(patch.edgeStates ?? {}) },
    costs: patch.costs ? { ...(base.costs ?? {}), ...patch.costs } : base.costs,
  }
}

/**
 * Khe lời dẫn cố định góc trên-trái: đổi nội dung theo beat với
 * AnimatePresence mode="wait" (cũ bay ra rồi mới vào).
 */
export function CalloutSlot({
  callout,
  beatKey,
  x = 70,
  y = 54,
  w = 900,
}: {
  callout?: CalloutDef
  beatKey: string | number
  x?: number
  y?: number
  w?: number
}) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, zIndex: 20 }}>
      <AnimatePresence mode="wait">
        {callout && (
          <Callout key={beatKey} tone={callout.tone}>
            {callout.text}
          </Callout>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Nhấn mạnh chữ trong lời dẫn. */
export function Em({ children, color = 'var(--amber)' }: { children: ReactNode; color?: string }) {
  return <strong style={{ color, fontWeight: 800 }}>{children}</strong>
}
