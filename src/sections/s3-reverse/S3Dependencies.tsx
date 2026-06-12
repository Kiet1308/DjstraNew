import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { CityDecorLayer } from '../../graph/mapDecor'
import type { DepArrowDef, GraphSceneState } from '../../graph/types'
import { CalloutSlot, Em, mapScene, stripDepDelays, type CalloutDef } from './common'

type Beat = { scene: GraphSceneState; callout?: CalloutDef }

const allEdgesDimmed = {
  AC: 'dimmed',
  AG: 'dimmed',
  AD: 'dimmed',
  CD: 'dimmed',
  CE: 'dimmed',
  ED: 'dimmed',
  EB: 'dimmed',
  DB: 'dimmed',
  GF: 'dimmed',
  GH: 'dimmed',
  FB: 'dimmed',
} as const

/* Các tầng mũi tên — MỘT CHIỀU theo nghĩa đen của hình học: mọi mũi tên đều
   chĩa về phía A (bên trái). Không bao giờ có cặp ngược chiều → không "quay vòng". */
const T1 = (soft = false): DepArrowDef[] => [
  { from: 'B', to: 'D', soft },
  { from: 'B', to: 'E', soft },
  { from: 'B', to: 'F', soft },
]
const T2d = (soft = false): DepArrowDef[] => [
  { from: 'D', to: 'A', soft, delay: soft ? 0 : 0 },
  { from: 'D', to: 'C', soft, delay: soft ? 0 : 0.15 },
  { from: 'D', to: 'E', soft, delay: soft ? 0 : 0.3 },
]
const T2f = (soft = false): DepArrowDef[] => [{ from: 'F', to: 'G', soft }]
const T3g = (soft = false): DepArrowDef[] => [{ from: 'G', to: 'A', soft }]
const T4 = (soft = false): DepArrowDef[] => [
  { from: 'E', to: 'C', soft },
  { from: 'C', to: 'A', soft, delay: soft ? 0 : 0.7 },
]

const dimAll = (arrows: DepArrowDef[], except: (a: DepArrowDef) => boolean = () => false) =>
  arrows.map((a) => ({ ...a, soft: false, delay: 0, dim: !except(a) }))

const FULL_WEB = [...T1(true), ...T2d(true), ...T2f(true), ...T3g(true), ...T4(true)]

const BEATS = defineBeats<Beat>([
  // b0 — Nhắc lại: B cần D/E/F
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        B: 'current',
        D: 'frontier',
        E: 'frontier',
        F: 'frontier',
        A: 'fogged',
        C: 'fogged',
        G: 'fogged',
        H: 'fogged',
      },
      depArrows: { arrows: T1() },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Mũi tên tím đọc là <Em>"cần biết trước"</Em>: muốn tốt nhất đến B — cần tốt nhất đến
          D, E, F trước đã.
        </>
      ),
    },
  },
  // b1 — Hỏi sâu MỘT cửa: D cần A, C, E
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        D: 'current',
        B: 'frontier',
        E: 'frontier',
        F: 'frontier',
        A: 'idle',
        C: 'idle',
        G: 'fogged',
        H: 'fogged',
      },
      depArrows: { arrows: [...T1(true), ...T2d()] },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Thử hỏi sâu một cửa — <Em>D</Em>. Tốt nhất đến D? Câu hỏi y hệt lúc ở B: bước cuối
          cùng VÀO D — từ <Em>A</Em>, từ <Em>C</Em>, hay từ <Em>E</Em>? Vậy lại cần tốt nhất
          đến A, C, E trước đã.
        </>
      ),
    },
  },
  // b2 — Cửa khác: F cần G
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        F: 'current',
        B: 'frontier',
        D: 'frontier',
        E: 'frontier',
        A: 'idle',
        C: 'idle',
        G: 'idle',
        H: 'fogged',
      },
      depArrows: { arrows: [...T1(true), ...T2d(true), ...T2f()] },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Sang cửa khác — <Em>F</Em>. Bước cuối vào F? Từ <Em>G</Em>. Vậy lại cần tốt nhất đến
          G.
        </>
      ),
    },
  },
  // b3 — G cần A: nhánh đầu tiên CHẠM ĐÁY
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        G: 'current',
        B: 'frontier',
        D: 'frontier',
        E: 'frontier',
        F: 'frontier',
        A: 'idle',
        C: 'idle',
        H: 'fogged',
      },
      depArrows: { arrows: [...T1(true), ...T2d(true), ...T2f(true), ...T3g()] },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Mà tốt nhất đến G? Bước cuối vào G — từ <Em>A</Em>. Nhánh này lùi hai bước là về tới{' '}
          <Em>A</Em>.
        </>
      ),
    },
  },
  // b4 — Hai điểm còn lại y hệt → QUY LUẬT
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        E: 'current',
        B: 'frontier',
        D: 'frontier',
        F: 'frontier',
        G: 'frontier',
        C: 'frontier',
        A: 'idle',
        H: 'fogged',
      },
      depArrows: { arrows: [...T1(true), ...T2d(true), ...T2f(true), ...T3g(true), ...T4()] },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Hai điểm còn lại cũng không khác: E cần C, C cần A. Quy luật lộ ra: tốt nhất đến{' '}
          <Em>MỘT</Em> điểm luôn cần tốt nhất đến <Em>các điểm ngay trước nó</Em>.
        </>
      ),
    },
  },
  // b5 — Quan sát HƯỚNG: mọi mũi tên chĩa về một phía
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        A: 'current',
        B: 'frontier',
        C: 'frontier',
        D: 'frontier',
        E: 'frontier',
        F: 'frontier',
        G: 'frontier',
        H: 'fogged',
      },
      depArrows: {
        arrows: dimAll(FULL_WEB, (a) => a.to === 'A'),
      },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Giờ lùi ra nhìn cả tấm bản đồ: câu hỏi đẻ ra câu hỏi — nhưng mũi tên nào cũng chĩa về{' '}
          <Em>cùng một phía</Em>. Chuỗi câu hỏi nào, lần ngược mãi, cũng đổ về đúng một điểm:{' '}
          <Em>A</Em>.
        </>
      ),
    },
  },
  // b6 — A là đáy: cả bản đồ "nợ câu trả lời", riêng A có sẵn
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        A: 'current',
        B: 'frontier',
        C: 'frontier',
        D: 'frontier',
        E: 'frontier',
        F: 'frontier',
        G: 'frontier',
        H: 'fogged',
      },
      depArrows: { arrows: dimAll(FULL_WEB) },
      costs: { A: 0 },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Mà riêng A — "đường ngắn nhất từ A đến A"? <Em>Bằng 0. Có sẵn, khỏi nghĩ.</Em> Cả bản
          đồ đang nợ câu trả lời — chỉ duy nhất A là trả lời được ngay từ đầu.
        </>
      ),
    },
  },
  // b7 — Lật ngược: xây từ A đi lên
  {
    scene: mapScene({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        A: 'current',
        C: 'frontier',
        G: 'frontier',
        D: 'frontier',
        B: 'dimmed',
        E: 'dimmed',
        F: 'dimmed',
        H: 'fogged',
      },
      depArrows: {
        arrows: [
          { from: 'A', to: 'C' },
          { from: 'A', to: 'G', delay: 0.15 },
          { from: 'A', to: 'D', delay: 0.3 },
        ],
        reversed: true,
      },
      costs: { A: 0 },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Vậy lật ngược lại: phía B toàn câu hỏi nợ nhau — phía A có sẵn câu trả lời. Đứng ở A,{' '}
          <Em>XÂY câu trả lời lan dần ra</Em>. Mũi tên lật theo, giờ đọc xuôi:{' '}
          <Em color="var(--violet)">"A đã chắc — lan sang các điểm nối với nó"</Em>. Điểm nào
          chắc chắn <Em>TIẾP</Em>?
        </>
      ),
    },
  },
  // b8 — Chuyển cảnh: sương phủ — vào vai người đứng ở A
  {
    scene: mapScene({
      fog: { revealed: ['A'] },
      nodeStates: { A: 'current' },
      edgeStates: {},
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Để trả lời cho công bằng, tự đặt mình vào vai người đứng ở A —{' '}
          <Em>chỉ biết những gì mắt mình thấy</Em>. Sương xuống.
        </>
      ),
    },
  },
])

function S3DependenciesSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  // lùi beat = trạng thái lắng: mũi tên không replay stagger
  const scene = direction === 1 ? def.scene : stripDepDelays(def.scene)
  const lastBeat = beat === BEATS.count - 1
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* phố xá chỉ là nền rất mờ — câu chuyện do mũi tên kể; sương xuống thì tắt hẳn */}
      <CityDecorLayer
        layout={mapLayout}
        edges={cityGraph.edges}
        opacity={lastBeat ? 0 : 0.22}
      />
      <GraphView graph={cityGraph} scene={scene} />
      <CalloutSlot callout={def.callout} beatKey={beat} />
    </div>
  )
}

export const S3Dependencies: SlideDef = {
  id: 's3-phu-thuoc',
  title: 'Chuỗi phụ thuộc',
  section: 3,
  beats: BEATS.count,
  component: S3DependenciesSlide,
}
