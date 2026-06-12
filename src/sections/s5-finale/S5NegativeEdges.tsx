import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { negGraph } from '../../graph/data'
import { negLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { sceneBase, type GraphSceneState } from '../../graph/types'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

/**
 * Giới hạn của thuật toán: cạnh âm. Demo X→Y=2, X→Z=3, Z→Y=−4:
 * chốt Y=2 sớm → lộ ra X→Z→Y=−1 < 2 nhưng Y đã chốt → vỡ trận.
 */
type Beat = { scene: GraphSceneState; callout?: CalloutDef; verdict?: boolean }

const negLayouts = { map: negLayout, abstract: negLayout }

const BEATS = defineBeats<Beat>([
  // b0 — (a) giới thiệu mũi tên: đường một chiều
  {
    scene: sceneBase({
      weights: true,
      nodeStates: {},
      edgeStates: { ZY: 'dimmed' },
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          Trước khi kết thúc thì còn 1 đặc điểm cần lưu ý về thuật toán này là nó chỉ được áp dụng với đồ thì mà <Em>trọng số các cạnh là dương</Em>.
        </>
      ),
    },
  },
  // b1 — (b) chi phí là TIỀN, có đoạn trợ giá −4
  {
    scene: sceneBase({
      weights: true,
      nodeStates: {},
      edgeStates: { ZY: 'active' },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Giả sử trọng số ở đây không phải là khoảng cách mà là <Em>lượng PIN tiêu thụ</Em> khi đi qua. Có đoạn không tốn PIN mà được <Em color="var(--green)">SẠC thêm</Em>
          <Em color="var(--green)">4</Em> trên đoạn Z→Y. Bài toán bây giờ sẽ là :{' '}
          <Em>tìm đường X→Y sao cho còn nhiều PIN nhất</Em>.
        </>
      ),
    },
  },
  // b2 — cho cỗ máy chạy: nó chốt Y=2 rất sớm
  {
    scene: sceneBase({
      weights: true,
      nodeStates: { X: 'locked', Y: 'locked', Z: 'frontier' },
      edgeStates: { XY: 'active', ZY: 'dimmed' },
      costs: { X: 0, Y: 2, Z: 3 },
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          Bản chất thuật toán này là nếu 1 đỉnh <Em>đang mở</Em> và có <Em>cost tạm thời ít nhất </Em>thì ta có thể chốt được <Em color="var(--green)">đường đi tốt nhất</Em> tới đỉnh này.
        </>
      ),
    },
  },
  // b3 — vỡ trận: X→Z→Y = −1 < 2 nhưng Y đã chốt
  {
    scene: sceneBase({
      weights: true,
      nodeStates: { X: 'locked', Y: 'locked', Z: 'frontier' },
      edgeStates: { XZ: 'relaxing', ZY: 'relaxing', XY: 'dimmed' },
      costs: { X: 0, Y: 2, Z: 3 },
      mathOverlays: [
        { at: 'Y', text: '3 + (−4) = −1 < 2 ?!', tone: 'worse', dy: -130 },
      ],
    }),
    callout: {
      tone: 'warn',
      text: (
        <>
          Nhưng trong trường hợp hiện tại ,ta lại có đường đi ngắn nhất là <Em color="var(--green)">X-Z-Y</Em>  với khoảng cách là <Em color="var(--red)">-1</Em> . <br></br>Nhưng ta đã chốt đường đi ngắn nhất là <Em color="var(--red)">2</Em> và không xét nhánh <Em color="var(--green)">X-Z</Em> .
        </>
      ),
    },
  },
  // b4 — chẩn bệnh + điều kiện tiên quyết
  {
    scene: sceneBase({
      weights: true,
      nodeStates: { X: 'locked', Y: 'locked', Z: 'frontier' },
      edgeStates: { XZ: 'idle', ZY: 'pruned', XY: 'idle' },
      costs: { X: 0, Y: 2, Z: 3 },
    }),
    verdict: true,
    callout: {
      tone: 'insight',
      text: (
        <>
           Như vậy với cạnh có trọng số <Em color="var(--red)">ÂM</Em> thì thuật toán này <Em color="var(--red)">không còn đúng nữa</Em>
        </>
      ),
    },
  },
])

function S5NegativeEdgesSlide({ beat }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GraphView graph={negGraph} scene={def.scene} layouts={negLayouts} nodeSize={40} />
      <CalloutSlot callout={def.callout} beatKey={beat} w={980} />
    </div>
  )
}

export const S5NegativeEdges: SlideDef = {
  id: 's5-canh-am',
  title: 'Một giới hạn',
  section: 5,
  beats: BEATS.count,
  component: S5NegativeEdgesSlide,
}
