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
          Trước khi chia tay, thử đặt cỗ máy vào một đồ thị lạ. Đồ thị này có một thứ ta quen
          trên bản đồ thật: <Em>đường MỘT CHIỀU</Em> — mũi tên chỉ được đi theo chiều đó, như
          phố một chiều.
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
          Và nếu "chi phí" không phải mét đường mà là <Em>TIỀN</Em>? Có đoạn được trợ giá — đi
          qua còn được <Em color="var(--green)">NHẬN thêm</Em>: chi phí{' '}
          <Em color="var(--green)">−4</Em> trên đoạn Z→Y. Đề bài cho cỗ máy:{' '}
          <Em>tìm đường rẻ nhất X→Y</Em>.
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
          Cho cỗ máy chạy: mở Y=2, Z=3 → quét min → Y bé nhất → <Em>CHỐT Y</Em>. Mà Y là
          đích — đúng dòng <Em color="var(--cyan)">if min == end break</Em>: máy dừng, dõng
          dạc trả lời <Em>2</Em>. Đúng từng chữ luật ta đặt ra.
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
          Nhưng nhìn này: đi X→Z→Y tốn 3 + (−4) = <Em color="var(--red)">−1</Em> — rẻ hơn hẳn
          2! Mà máy đã <Em>chốt-và-trả-lời mất rồi</Em>. Cả buổi ta tin "đã chốt thì không
          bao giờ phải sửa" — lần này chính niềm tin ấy phản bội ta: cỗ máy trả lời{' '}
          <Em color="var(--red)">sai</Em> — vỡ trận.
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
          Vì sao gãy? Nhớ câu lập luận trong sương: <Em>"đi tiếp thì chỉ dài thêm chứ không
          ngắn lại"</Em> — mọi lần CHỐT đều đứng trên câu đó. Cạnh âm phá đúng câu đó: đi
          tiếp lại RẺ ĐI. Vậy điều kiện tiên quyết của thuật toán:{' '}
          <Em color="var(--red)">không có cạnh âm</Em>.
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
