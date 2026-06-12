import { mapLayout } from '../../graph/layouts'
import { sceneBase, type GraphSceneState } from '../../graph/types'

const P = (id: string): [number, number] => [mapLayout[id].x, mapLayout[id].y]

/**
 * Đường "lẻn" của cut property — kể ĐÚNG câu chuyện của lập luận:
 * rời A bằng đường đã biết (A→C→E, trong vùng sáng), bước qua CỬA đang mở
 * tại E, RỒI mới lặn vào vùng tối vòng về G. Vùng tối không có cửa sau.
 * (Tọa độ neo theo mapLayout — Phần 3 giữ bản đồ xuyên suốt.)
 */
export const cutPhantom: GraphSceneState['phantom'] = {
  points: [P('A'), P('C'), P('E'), [1500, 410], [1350, 790], [930, 920], P('G')],
  crossAt: P('E'),
}

export const cutOverlay = {
  at: 'E',
  text: 'bước qua cửa này → đã tốn ≥ 10',
  tone: 'worse' as const,
  dx: 185,
  dy: 58,
}

/**
 * Khoảnh khắc gate 2: G đang BỊ THỬ PHÁ (current, chưa khóa) — đường lẻn là
 * nhát phá hụt. KHÔNG có costs: badge chỉ ra đời ở beat show-cost phía sau.
 */
export const cutScene: GraphSceneState = sceneBase({
  variant: 'map',
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'current', E: 'frontier', D: 'frontier' },
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
  phantom: cutPhantom,
  mathOverlays: [cutOverlay],
})

/** Toàn cảnh kết thúc màn sương — đường A→C→E→B sáng, F/H mờ, F–B chưa từng biết. */
export const finalScene: GraphSceneState = sceneBase({
  variant: 'map',
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
  // F/H vẫn đang mở với cost 18/20 — badge mờ theo node dimmed, không rơi mất
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, B: 16, F: 18, H: 20 },
})
