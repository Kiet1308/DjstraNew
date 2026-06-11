import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import { sceneBase, type GraphSceneState } from '../../graph/types'
import { CalloutSlot, Em, type CalloutDef } from './common'

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

const BEATS = defineBeats<Beat>([
  // 1. Nhắc lại: B cần D/E/F
  {
    scene: sceneBase({
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
      depArrows: {
        arrows: [
          { from: 'B', to: 'D' },
          { from: 'B', to: 'E' },
          { from: 'B', to: 'F' },
        ],
      },
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
  // 2. Lan một tầng: D lại cần A, C, E… và lòi ra vòng lặp D↔B
  {
    scene: sceneBase({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        B: 'frontier',
        D: 'current',
        E: 'frontier',
        F: 'frontier',
        A: 'idle',
        C: 'idle',
        G: 'fogged',
        H: 'fogged',
      },
      depArrows: {
        arrows: [
          { from: 'B', to: 'D' },
          { from: 'B', to: 'E' },
          { from: 'B', to: 'F' },
          { from: 'D', to: 'A' },
          { from: 'D', to: 'C' },
          { from: 'D', to: 'E' },
          { from: 'D', to: 'B', flip: true },
        ],
      },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Mà muốn tốt nhất đến D? Lại cần tốt nhất đến các điểm nối quanh nó — A, C, E… và
          khoan, <Em color="var(--red)">cả B nữa?!</Em> B cần D, mà D lại cần B — câu hỏi{' '}
          <Em>quay vòng</Em>. Càng thấy rõ: phải tìm một đầu mối <Em>chắc chắn</Em> mà đứng.
        </>
      ),
    },
  },
  // 3. Lan kín — quy luật lộ ra
  {
    scene: sceneBase({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: { B: 'frontier', D: 'frontier', E: 'frontier', F: 'frontier', H: 'fogged' },
      depArrows: {
        arrows: [
          { from: 'B', to: 'D' },
          { from: 'B', to: 'E' },
          { from: 'B', to: 'F' },
          { from: 'D', to: 'A' },
          { from: 'D', to: 'C' },
          { from: 'D', to: 'E' },
          { from: 'E', to: 'C' },
          { from: 'F', to: 'G' },
          { from: 'C', to: 'A' },
          { from: 'G', to: 'A' },
        ],
      },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Quy luật lộ ra: đường ngắn nhất đến <Em>MỘT</Em> điểm luôn phụ thuộc đường ngắn nhất
          đến <Em>các điểm ngay trước nó</Em>.
        </>
      ),
    },
  },
  // 4. Mọi câu hỏi dồn về A — giữ mạng nhện cũ mờ phía sau để THẤY dòng chảy
  {
    scene: sceneBase({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        A: 'current',
        B: 'dimmed',
        D: 'dimmed',
        E: 'dimmed',
        F: 'dimmed',
        H: 'fogged',
      },
      depArrows: {
        arrows: [
          { from: 'B', to: 'D', dim: true },
          { from: 'B', to: 'E', dim: true },
          { from: 'B', to: 'F', dim: true },
          { from: 'D', to: 'E', dim: true },
          { from: 'D', to: 'B', flip: true, dim: true },
          { from: 'E', to: 'C', dim: true },
          { from: 'F', to: 'G', dim: true },
          { from: 'D', to: 'A' },
          { from: 'C', to: 'A' },
          { from: 'G', to: 'A' },
        ],
      },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Để ý: hỏi mãi, hỏi mãi… mọi câu hỏi đều dồn về đúng một điểm — <Em>A</Em>. Mà "đường
          ngắn nhất từ A đến A"? <Em>Bằng 0. Khỏi nghĩ.</Em> Đây là điểm DUY NHẤT ta chắc chắn
          100% ngay từ đầu.
        </>
      ),
    },
  },
  // 5. Đảo chiều: XÂY từ A đi lên
  {
    scene: sceneBase({
      edgeStates: { ...allEdgesDimmed },
      nodeStates: {
        A: 'current',
        C: 'idle',
        G: 'idle',
        D: 'idle',
        B: 'dimmed',
        E: 'dimmed',
        F: 'dimmed',
        H: 'fogged',
      },
      depArrows: {
        arrows: [
          { from: 'A', to: 'C' },
          { from: 'A', to: 'G' },
          { from: 'A', to: 'D' },
        ],
        reversed: true,
      },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Vậy lật ngược ván cờ: đứng ở B hỏi xuống thì câu hỏi đẻ ra câu hỏi, quay vòng cả tấm
          bản đồ — trong khi chỉ có đúng MỘT chỗ cho sẵn câu trả lời: A. Đứng ở A,{' '}
          <Em>XÂY câu trả lời đi lên</Em>. Mũi tên cũng lật theo, giờ đọc xuôi:{' '}
          <Em color="var(--violet)">"A đã chắc — lan sang điểm bên cạnh"</Em>. Điểm nào chắc
          chắn <Em>TIẾP</Em>?
        </>
      ),
    },
  },
  // 6. Chuyển cảnh: sương phủ — vào vai người đứng ở A
  {
    scene: sceneBase({
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

function S3DependenciesSlide({ beat }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GraphView graph={cityGraph} scene={def.scene} />
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
