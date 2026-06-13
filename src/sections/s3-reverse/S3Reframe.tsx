import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { CityDecorLayer } from '../../graph/mapDecor'
import type { GraphSceneState, NodeVisualState } from '../../graph/types'
import { CalloutSlot, Em, mapScene, type CalloutDef } from './common'

/* ============================================================
   ĐỔI BÀI TOÁN — bản lề giữa "chuỗi phụ thuộc đổ về A" (S3Dependencies)
   và "bước đi trong sương" (S3FogWalk).

   Chuỗi phụ thuộc vừa cho thấy: hỏi A→B lại đẻ ra A→D, A→E, A→F… toàn
   CÙNG MỘT kiểu câu hỏi, và đáy của mọi nhánh là A (A→A = 0). Cú "aha"
   tự nhiên: thôi đừng nhắm riêng B — ĐỔI bài toán thành tìm đường ngắn
   nhất từ A đến MỌI điểm. Lúc khởi đầu chỉ có đúng một ô chắc chắn:
   A = 0, còn lại toàn "?". Rồi sương xuống, bắc cầu sang màn sương.
   (Beat sương xuống vốn là b8 cuối S3Dependencies — dời về đây để cảnh
   "góc nhìn thượng đế" của bảng đáp án đứng TRƯỚC khi bịt mắt.) */

// Cạnh để mờ làm nền địa lý — không đo đếm gì ở màn này (weights tắt).
const dimmedEdges: GraphSceneState['edgeStates'] = {
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
}

// Bảng đáp án lúc khởi đầu: riêng A đã chắc (=0), còn lại toàn dấu hỏi.
const boardNodes: Record<string, NodeVisualState> = {
  A: 'locked',
  B: 'idle',
  C: 'idle',
  D: 'idle',
  E: 'idle',
  F: 'idle',
  G: 'idle',
  H: 'idle',
}
const boardCosts: GraphSceneState['costs'] = {
  A: 0,
  B: '?',
  C: '?',
  D: '?',
  E: '?',
  F: '?',
  G: '?',
  H: '?',
}

const boardScene = mapScene({
  nodeStates: boardNodes,
  edgeStates: dimmedEdges,
  costs: boardCosts,
})

// r1: bám A=0 mà lan ra — 3 đỉnh kề A sáng lên như "những ô sắp điền tiếp".
const boardSceneNext = mapScene({
  nodeStates: { ...boardNodes, C: 'frontier', G: 'frontier', D: 'frontier' },
  edgeStates: { ...dimmedEdges, AC: 'idle', AG: 'idle', AD: 'idle' },
  costs: boardCosts,
})

type Beat = {
  scene: GraphSceneState
  callout: CalloutDef
  /** băng-rôn "bài toán mới" ở đỉnh màn */
  banner?: boolean
  /** chú thích trỏ vào B: đích cũ giờ chỉ là một ô */
  pointB?: boolean
}

const BEATS = defineBeats<Beat>([
  // r0 — ĐỔI BÀI TOÁN: bảng đáp án hiện ra, A=0 còn lại "?"
  {
    scene: boardScene,
    banner: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Xây từ A lan ra — nhưng xây ra cái gì? Là ngắn nhất từ A tới <Em>TỪNG điểm</Em>. Vậy{' '}
          <Em>đổi luôn bài toán</Em>: điền đáp số cho <Em color="var(--cyan)">mọi điểm</Em>,
          không riêng B. Mới chắc mỗi <Em>A = 0</Em>.
        </>
      ),
    },
  },
  // r1 — TO HƠN MÀ DỄ HƠN: B chỉ là một ô; A=0 là chỗ bám
  {
    scene: boardSceneNext,
    banner: true,
    pointB: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Tưởng nhiều việc hơn, hóa ra <Em>nhẹ đầu hơn</Em>: mỗi bước chỉ cần biến{' '}
          <Em>một "?" thành số thật</Em>, bắt đầu từ <Em>A = 0</Em>. Đích B giờ chỉ là{' '}
          <Em color="var(--cyan)">một ô</Em> trong bảng — điền tới đó là xong.
        </>
      ),
    },
  },
  // r2 — SƯƠNG XUỐNG: vào vai người đứng ở A (vốn là b8 cuối S3Dependencies)
  {
    scene: mapScene({
      fog: { revealed: ['A'] },
      nodeStates: { A: 'current' },
      edgeStates: {},
      costs: { A: 0 },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Bảng to toàn dấu hỏi, trong tay đúng một con số. Giờ vào vai người đứng ở A —{' '}
          <Em>chỉ biết những gì mắt thấy</Em>. Sương xuống.
        </>
      ),
    },
  },
])

function S3ReframeSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const dly = (d: number) => (direction === 1 ? d : 0)
  const foggy = !!def.scene.fog
  const b = mapLayout.B

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* phố xá làm nền rất mờ; sương xuống thì tắt hẳn */}
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={foggy ? 0 : 0.18} />
      <GraphView graph={cityGraph} scene={def.scene} />

      {/* Băng-rôn "bài toán mới" — slim, canh dưới-giữa (lower-third) để không
          chen với lời dẫn trên-trái, mà vẫn chừa trống các đỉnh ở đáy bản đồ */}
      <AnimatePresence>
        {def.banner && (
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 34,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'var(--ink-2)',
                border: '1.5px solid var(--line)',
                borderRadius: 14,
                padding: '12px 28px',
                boxShadow: 'var(--shadow-panel)',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--cyan)',
                  whiteSpace: 'nowrap',
                }}
              >
                Bài toán mới
              </span>
              <span style={{ width: 1, height: 30, background: 'var(--line)' }} />
              <span style={{ fontSize: 30, color: 'var(--fog-100)', whiteSpace: 'nowrap' }}>
                ngắn nhất từ <b style={{ color: 'var(--amber)' }}>A</b> đến{' '}
                <b style={{ color: 'var(--cyan)' }}>mọi điểm</b>{' '}
                <span style={{ fontSize: 20, color: 'var(--fog-400)' }}>
                  (không chỉ <span style={{ textDecoration: 'line-through' }}>A→B</span>)
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lời dẫn — góc trên-trái như cả Phần 3, ngắn gọn ≤3 dòng để chừa đỉnh C */}
      <CalloutSlot callout={def.callout} beatKey={beat} />

      {/* Chú thích trỏ vào B: đích cũ giờ chỉ là một ô trong bảng */}
      <AnimatePresence>
        {def.pointB && (
          <motion.div
            key="pointB"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: dly(0.35), duration: 0.45 }}
            style={{
              position: 'absolute',
              left: b.x - 150,
              top: b.y - 172,
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              zIndex: 19,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: 19,
                color: 'var(--cyan)',
                background: 'var(--ink-2)',
                border: '1.5px solid var(--cyan-dim)',
                borderRadius: 10,
                padding: '8px 14px',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              đích ban đầu — giờ chỉ là <b>một ô</b>
            </span>
            <span style={{ fontSize: 26, color: 'var(--cyan)', lineHeight: 1 }}>↓</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S3Reframe: SlideDef = {
  id: 's3-doi-bai-toan',
  title: 'Đổi bài toán',
  section: 3,
  beats: BEATS.count,
  component: S3ReframeSlide,
}
