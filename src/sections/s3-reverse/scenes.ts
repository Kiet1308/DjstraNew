import { abstractLayout } from '../../graph/layouts'
import { sceneBase, type GraphSceneState } from '../../graph/types'

const P = (id: string): [number, number] => [abstractLayout[id].x, abstractLayout[id].y]

/**
 * Đường "lẻn" của cut property — kể ĐÚNG câu chuyện của lập luận:
 * rời A bằng đường đã biết (A→C→E, trong vùng sáng), bước qua CỬA đang mở
 * tại E, RỒI mới lặn vào vùng tối vòng về G. Vùng tối không có cửa sau.
 */
export const cutPhantom: GraphSceneState['phantom'] = {
  points: [P('A'), P('C'), P('E'), [1480, 430], [1330, 800], [950, 940], P('G')],
  crossAt: P('E'),
}

export const cutOverlay = {
  at: 'E',
  text: 'bước qua cửa này → đã tốn ≥ 10',
  tone: 'worse' as const,
  dx: 185,
  dy: 58,
}

/** Khoảnh khắc gate 2 + đường lẻn — dùng ở FogWalk b8 và replay ở Invariant. */
export const cutScene: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'locked', E: 'current', D: 'current' },
  edgeStates: {
    AC: 'idle',
    AG: 'idle',
    AD: 'idle',
    CD: 'idle',
    CE: 'idle',
    ED: 'hidden',
    EB: 'hidden',
    DB: 'hidden',
    GF: 'hidden',
    GH: 'hidden',
    FB: 'hidden',
  },
  weights: true,
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  phantom: cutPhantom,
  mathOverlays: [cutOverlay],
})

/** Toàn cảnh kết thúc màn sương — đường A→C→E→B sáng, F/H mờ, F–B chưa từng biết. */
export const finalScene: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E', 'F', 'H', 'B'] },
  nodeStates: {
    A: 'onPath',
    C: 'onPath',
    E: 'onPath',
    B: 'onPath',
    G: 'locked',
    D: 'locked',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: {
    AC: 'onPath',
    CE: 'onPath',
    EB: 'onPath',
    AG: 'dimmed',
    AD: 'dimmed',
    CD: 'dimmed',
    ED: 'dimmed',
    DB: 'dimmed',
    GF: 'dimmed',
    GH: 'dimmed',
    FB: 'hidden',
  },
  weights: true,
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, B: 16 },
})
