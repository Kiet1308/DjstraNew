import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import {
  sceneBase,
  type EdgeVisualState,
  type GhostEdge,
  type GraphSceneState,
  type NodeId,
  type NodeVisualState,
} from '../../graph/types'
import { Callout } from '../../components/Callout'
import { CalloutSlot, Em, mergeScene, type CalloutDef, type ScenePatch } from './common'
import { cutScene, finalScene } from './scenes'

/* ============ Tiến trình khám phá (đã verify chạy tay) ============
   chốt C=4 → G=6 → E=10 → D=14 → B=16; relax D: 18→16→14;
   khi chốt D: 14+6=20 > 16 → B giữ nguyên; đường cuối A→C→E→B=16. */

// suy từ dữ liệu thật — không chép tay, typo id sẽ không lọt được
const ALL_EDGES = cityGraph.edges.map((e) => e.id)

/** Cạnh "đã biết" = đã mở từ một đỉnh chốt. Còn lại ẩn — kể cả khi 2 đầu đã lộ
    (gặp C và D trong sương chưa có nghĩa là biết có đường nối thẳng C–D!). */
function es(known: string[], overrides: Record<string, EdgeVisualState> = {}) {
  const r: Record<string, EdgeVisualState> = {}
  for (const e of ALL_EDGES) r[e] = known.includes(e) ? 'idle' : 'hidden'
  return { ...r, ...overrides }
}

function ns(
  locked: NodeId[],
  frontier: NodeId[],
  overrides: Record<string, NodeVisualState> = {},
) {
  const r: Record<string, NodeVisualState> = {}
  for (const id of locked) r[id] = 'locked'
  for (const id of frontier) r[id] = 'frontier'
  return { ...r, ...overrides }
}

const R_START = ['A']
const R_A = ['A', 'C', 'G', 'D']
const R_C = [...R_A, 'E']
const R_G = [...R_C, 'F', 'H']
const R_E = [...R_G, 'B']

const K_A = ['AC', 'AG', 'AD']
const K_C = [...K_A, 'CD', 'CE']
const K_G = [...K_C, 'GF', 'GH']
const K_E = [...K_G, 'EB', 'ED']

const COSTS_SHOW = { A: 0, C: 4, G: 6, D: 18 }
const COSTS_C = { A: 0, C: 4, G: 6, D: 16, E: 10 }
const COSTS_G = { ...COSTS_C, F: 18, H: 20 }
const COSTS_E = { ...COSTS_G, D: 14, B: 16 }

type GateDef = {
  candidates: NodeId[]
  correct: NodeId
  counters: Record<string, { ghost?: GhostEdge; text: ReactNode }>
  answer: CalloutDef
  patch: ScenePatch
}

type Beat = {
  scene: GraphSceneState
  callout?: CalloutDef
  gate?: GateDef
  strip?: boolean
}

const BEATS = defineBeats<Beat>([
  // b0 — Lý do bịt mắt: fog là công cụ tư duy
  {
    scene: sceneBase({
      fog: { revealed: R_START },
      nodeStates: { A: 'current' },
      edgeStates: es([]),
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Nhìn từ trên cao, mắt ta tự mò ra đáp án mà <Em>không biết VÌ SAO</Em>. Muốn tìm ra
          QUY TẮC mà máy móc làm theo được, ta phải tự bịt bớt mắt — chỉ cho phép biết những gì
          đã khám phá.
        </>
      ),
    },
  },
  // b1 — Luật chơi: "chắc chắn" nghĩa là gì, và vì sao khó tính vậy
  {
    scene: sceneBase({
      fog: { revealed: R_START },
      nodeStates: { A: 'current' },
      edgeStates: es([]),
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Với mỗi điểm, ta muốn điền một con số — độ dài đường ngắn nhất từ A đến nó. Nhưng{' '}
          <Em>CHỈ điền khi CHẮC CHẮN</Em>: dù sau này khám phá thêm bao nhiêu, con số đó không
          bao giờ phải sửa. Vì sao khó tính vậy? Cách thử-tất-cả chậm vì làm đi làm lại. Nếu
          mỗi bước ta <Em>XONG HẲN một điểm, không bao giờ quay lại</Em> — không lãng phí một
          bước nào.
        </>
      ),
    },
  },
  // b2 — Mở mắt tại A: thấy 3 đoạn nối
  {
    scene: sceneBase({
      fog: { revealed: R_A },
      nodeStates: ns([], ['C', 'G', 'D'], { A: 'current' }),
      edgeStates: es(K_A),
      weights: true,
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          Đứng ở A, nhìn quanh: thấy 3 đoạn nối rời A — đến C dài <Em>4</Em>, đến G dài{' '}
          <Em>6</Em>, đến D dài <Em>18</Em>. Ngoài kia, sương mù.
        </>
      ),
    },
  },
  // b3 — GATE 1
  {
    scene: sceneBase({
      fog: { revealed: R_A },
      nodeStates: ns([], ['C', 'G', 'D'], { A: 'current' }),
      edgeStates: es(K_A),
      weights: true,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Ta <Em>CHẮC CHẮN</Em> được đường ngắn nhất đến điểm nào? —{' '}
          <Em color="var(--cyan)">click điểm đó trên hình</Em>. (Cứ thử từng ứng viên — loại
          trừ cũng là suy luận!)
        </>
      ),
    },
    gate: {
      candidates: ['C', 'G', 'D'],
      correct: 'C',
      counters: {
        D: {
          ghost: { id: 'ghost-cd', from: 'C', to: 'D', label: '10?' },
          text: (
            <>
              Chưa chắc được — biết đâu trong sương có đường C–D? Chỉ cần C–D = 10 là 4+10 ={' '}
              <Em>14 &lt; 18</Em> rồi. <Em>(Giữ lấy nghi ngờ này — lát nữa có bất ngờ.)</Em>
            </>
          ),
        },
        G: {
          ghost: { id: 'ghost-cg', from: 'C', to: 'G', label: '1?' },
          text: (
            <>
              Chưa chắc được — biết đâu có đường C–G = 1? Khi đó 4+1 = <Em>5 &lt; 6</Em>.
            </>
          ),
        },
      },
      answer: {
        tone: 'insight',
        text: (
          <>
            <Em>C!</Em> Mọi đường khác rời A đều mở màn bằng đoạn ≥ 6, mà{' '}
            <Em>đi tiếp thì chỉ dài thêm chứ không ngắn lại</Em> — nên không gì phá nổi con số
            4.
          </>
        ),
      },
      patch: { nodeStates: { C: 'locked' } },
    },
  },
  // b4 — Đặt tên CHỐT (A và C cùng nhận dấu, đúng lúc cái tên ra đời)
  {
    scene: sceneBase({
      fog: { revealed: R_A },
      nodeStates: ns(['A', 'C'], ['G', 'D']),
      edgeStates: es(K_A),
      weights: true,
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          C xong hẳn — đóng dấu <Em>✓</Em>. A cũng đóng luôn: nó vốn chắc từ đầu. Những điểm
          xong hẳn như vậy, từ giờ gọi là <Em>ĐÃ CHỐT</Em>.
        </>
      ),
    },
  },
  // b5 — Show-cost: bắc cầu chi phí → cost
  {
    scene: sceneBase({
      fog: { revealed: R_A },
      nodeStates: ns(['A', 'C'], ['G', 'D']),
      edgeStates: es(K_A),
      weights: true,
      costs: COSTS_SHOW,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Đầu óc bắt đầu phải nhớ nhiều rồi — đánh dấu vào góc mỗi điểm{' '}
          <Em>chi phí tốt nhất ĐÃ BIẾT</Em> tính đến giờ. Dân code lười viết dài, gọi tắt là{' '}
          <Em>cost</Em> — lát viết code cũng dùng tên này.
        </>
      ),
    },
  },
  // b6 — Mở từ C + đặt tên MỞ + relax D lần 1
  {
    scene: sceneBase({
      fog: { revealed: R_C },
      nodeStates: ns(['A', 'C'], ['G', 'D', 'E']),
      edgeStates: es(K_C, { AC: 'relaxing', CD: 'relaxing', CE: 'active' }),
      weights: true,
      costs: COSTS_C,
      mathOverlays: [
        { at: 'E', text: '4+6=10', tone: 'info', dx: -130, dy: -110 },
        { at: 'D', text: '4+12=16 < 18', tone: 'better', dx: -240, dy: 40 },
      ],
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Chốt C rồi thì từ C nhìn tiếp: thấy điểm mới <Em>E</Em> — ghi tạm cost tốt nhất đã
          biết (4+6=10): gọi là <Em>ĐANG MỞ</Em>. Và kìa — có đường C–D thật: 4+12=16 &lt; 18.{' '}
          <Em>Nghi ngờ lúc nãy là SỰ THẬT</Em> — đến D qua C ngắn hơn!
        </>
      ),
    },
  },
  // b7 — GATE 2
  {
    scene: sceneBase({
      fog: { revealed: R_C },
      nodeStates: ns(['A', 'C'], ['G', 'D', 'E']),
      edgeStates: es(K_C),
      weights: true,
      costs: COSTS_C,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Ba điểm đang mở: G=6, E=10, D=16. Chắc chắn <Em>tiếp</Em> được điểm nào? Click thử.
        </>
      ),
    },
    gate: {
      candidates: ['G', 'E', 'D'],
      correct: 'G',
      counters: {
        D: {
          ghost: { id: 'ghost-ed', from: 'E', to: 'D', label: '5?' },
          text: (
            <>
              Chưa chắc được — biết đâu từ E có đường sang D? Chỉ cần E–D = 5 là 10+5 ={' '}
              <Em>15 &lt; 16</Em>. <Em>(Nghi ngờ này lát nữa cũng thành SỰ THẬT.)</Em>
            </>
          ),
        },
        E: {
          ghost: { id: 'ghost-ge', from: 'G', to: 'E', label: '2?', labelT: 0.35 },
          text: (
            <>
              Chưa chắc được — biết đâu có đường G–E = 2? Khi đó 6+2 = <Em>8 &lt; 10</Em>.
            </>
          ),
        },
      },
      answer: {
        tone: 'insight',
        text: (
          <>
            <Em>G</Em>, cost 6 — nhỏ nhất trong các điểm đang mở. Nhưng lần này đừng tin ngay —
            thử <Em>phá</Em> nó xem có đứng vững không →
          </>
        ),
      },
      patch: { nodeStates: { G: 'locked' } },
    },
  },
  // b8 — Cut property: đường lẻn phải CHUI QUA CỬA rồi mới vào được vùng tối
  {
    scene: cutScene,
    callout: {
      tone: 'insight',
      text: (
        <>
          Cho một đường <Em color="var(--red)">"lẻn"</Em> từ A đến G xem. Muốn lang thang trong
          vùng tối thì trước hết phải <Em>chui được vào</Em> — mà vùng tối{' '}
          <Em>không có cửa sau</Em>: lối vào duy nhất là bước qua một điểm sáng đang mở (E=10
          hoặc D=16). Mới đặt chân đến cửa đã tốn ≥ 10 &gt; 6 rồi, đi tiếp chỉ dài thêm — nên
          G=6 <Em>không thể bị soán ngôi</Em>.
        </>
      ),
    },
  },
  // b9 — Mở từ G
  {
    scene: sceneBase({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G'], ['D', 'E', 'F', 'H']),
      edgeStates: es(K_G, { GF: 'active', GH: 'active' }),
      weights: true,
      costs: COSTS_G,
      mathOverlays: [
        { at: 'F', text: '6+12=18', tone: 'info', dx: -110 },
        { at: 'H', text: '6+14=20', tone: 'info', dx: -120 },
      ],
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          Mở từ G: thấy thêm <Em>F</Em> (6+12=18) và <Em>H</Em> (6+14=20). Sương lùi dần —
          nhưng B vẫn bặt tăm.
        </>
      ),
    },
  },
  // b10 — GATE 3
  {
    scene: sceneBase({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G'], ['D', 'E', 'F', 'H']),
      edgeStates: es(K_G),
      weights: true,
      costs: COSTS_G,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Bốn điểm đang mở: E=10, D=16, F=18, H=20. Chắc chắn tiếp điểm nào? Click thử.
        </>
      ),
    },
    gate: {
      candidates: ['E', 'D', 'F', 'H'],
      correct: 'E',
      counters: {
        D: {
          ghost: { id: 'ghost-ed3', from: 'E', to: 'D', label: '5?' },
          text: (
            <>
              Chưa chắc được — vẫn nghi ngờ cũ: chỉ cần từ E có đường sang D = 5 là 10+5 ={' '}
              <Em>15 &lt; 16</Em>. <Em>(Sắp thấy ngay!)</Em>
            </>
          ),
        },
        F: {
          ghost: { id: 'ghost-ef', from: 'E', to: 'F', label: '3?', labelT: 0.72 },
          text: (
            <>
              Chưa chắc được — biết đâu có đường E–F = 3? Khi đó 10+3 = <Em>13 &lt; 18</Em>.
            </>
          ),
        },
        H: {
          ghost: { id: 'ghost-eh', from: 'E', to: 'H', label: '5?' },
          text: (
            <>
              Chưa chắc được — biết đâu có đường E–H = 5? Khi đó 10+5 = <Em>15 &lt; 20</Em>.
            </>
          ),
        },
      },
      answer: {
        tone: 'insight',
        text: (
          <>
            <Em>E</Em> — cost 10, nhỏ nhất trong 4. Lập luận y màn trước: mọi ngả khác đều phải
            chui qua một cửa <Em>đắt hơn 10</Em>.
          </>
        ),
      },
      patch: { nodeStates: { E: 'locked' } },
    },
  },
  // b11 — Mở từ E: THẤY ĐÍCH + relax D lần 2
  {
    scene: sceneBase({
      fog: { revealed: R_E },
      nodeStates: ns(['A', 'C', 'G', 'E'], ['D', 'F', 'H', 'B']),
      edgeStates: es(K_E, { AC: 'relaxing', CE: 'relaxing', ED: 'relaxing', EB: 'active' }),
      weights: true,
      costs: COSTS_E,
      mathOverlays: [
        { at: 'B', text: '10+6=16', tone: 'info' },
        { at: 'D', text: '10+4=14 < 16', tone: 'better', dx: -240, dy: 40 },
      ],
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Mở từ E: <Em>THẤY ĐÍCH B!</Em> 10+6=16. Và đường E–D <Em>có thật</Em>: 10+4=14 &lt;
          16 — D rẻ thêm lần nữa, đúng như đã nghi ngờ ở hai màn trước.
        </>
      ),
    },
  },
  // b12 — Thấy đích mà CHƯA ĐƯỢC DỪNG
  {
    scene: sceneBase({
      fog: { revealed: R_E },
      nodeStates: ns(['A', 'C', 'G', 'E'], ['D', 'F', 'H'], { B: 'current' }),
      edgeStates: es(K_E),
      weights: true,
      costs: COSTS_E,
    }),
    callout: {
      tone: 'warn',
      text: (
        <>
          Khoan — thấy đích rồi! B=16. Dừng được chưa? <Em color="var(--red)">…Chưa.</Em> 16
          mới là "tốt nhất ĐÃ BIẾT". D=14 còn đang mở kia — biết đâu vòng qua D lại rẻ hơn?
          Luật của ta: <Em>chỉ tin con số khi đã CHỐT</Em>.
        </>
      ),
    },
  },
  // b13 — Chốt D: kiểm tra B, nhánh KHÔNG đổi cũng phải hiện phép tính
  {
    scene: sceneBase({
      fog: { revealed: R_E },
      nodeStates: ns(['A', 'C', 'G', 'E', 'D'], ['F', 'H', 'B']),
      edgeStates: es([...K_E, 'DB'], { DB: 'active' }),
      weights: true,
      costs: COSTS_E,
      mathOverlays: [{ at: 'B', text: '14+6=20 > 16 → giữ nguyên', tone: 'worse' }],
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          D=14 nhỏ nhất → chốt D. Kiểm tra ngả từ D sang B: 14+6=20 &gt; 16 →{' '}
          <Em>B giữ nguyên</Em>. Vòng qua D không rẻ hơn.
        </>
      ),
    },
  },
  // b14 — Chốt B = đích → GIỜ mới dừng; đường sáng dậy NGƯỢC từ B về A
  {
    scene: finalScene,
    callout: {
      tone: 'insight',
      text: (
        <>
          B=16 giờ là nhỏ nhất trong các điểm đang mở → <Em>CHỐT B</Em>. B là đích — GIỜ mới
          được dừng. Đường ngắn nhất: <Em>A → C → E → B = 16</Em>.
        </>
      ),
    },
  },
  // b15 — Beat nghỉ: toàn cảnh
  {
    scene: finalScene,
    strip: true,
  },
])

const GATE_BEATS = BEATS.table
  .map((b, i) => (b.gate ? i : -1))
  .filter((i) => i >= 0)

// đường cuối sáng dậy NGƯỢC từ đích: EB trước, rồi CE, rồi AC
const FINAL_EDGE_DELAYS = { EB: 0, CE: 0.4, AC: 0.8 }
const FINAL_BEAT = 14

function S3FogWalkSlide({ beat, direction, gateResolved, resolveGate, nudge }: SlideProps) {
  const def = BEATS.at(beat)
  const gate = def.gate
  const [attempt, setAttempt] = useState<{ beat: number; node: NodeId } | null>(null)

  // Phản ví dụ là state cục bộ: tự xóa, không lọt vào deck state
  useEffect(() => setAttempt(null), [beat])
  useEffect(() => {
    if (!attempt) return
    const t = setTimeout(() => setAttempt(null), 7000)
    return () => clearTimeout(t)
  }, [attempt])

  const activeAttempt = attempt && attempt.beat === beat && gate && !gateResolved ? attempt : null
  const counter = activeAttempt && gate ? gate.counters[activeAttempt.node] : null

  let scene = def.scene
  if (gate && gateResolved) scene = mergeScene(scene, gate.patch)
  if (counter?.ghost) {
    scene = { ...scene, ghostEdges: [...(scene.ghostEdges ?? []), counter.ghost] }
  }

  const interactive = !!gate && !gateResolved
  const callout: CalloutDef | undefined = gate && gateResolved ? gate.answer : def.callout

  const onNodeClick = (id: NodeId) => {
    if (!gate || gateResolved) return
    if (id === gate.correct) {
      setAttempt(null)
      resolveGate()
    } else if (gate.counters[id]) {
      setAttempt({ beat, node: id })
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <GraphView
        graph={cityGraph}
        scene={scene}
        clickable={interactive && gate ? gate.candidates : []}
        onNodeClick={onNodeClick}
        hintNodes={interactive && gate && nudge > 0 ? gate.candidates : []}
        edgeDelays={beat === FINAL_BEAT && direction === 1 ? FINAL_EDGE_DELAYS : undefined}
      />
      <CalloutSlot callout={callout} beatKey={`${beat}-${gateResolved ? 'ok' : 'q'}`} />

      {/* Overlay phản ví dụ "chưa chắc được" — chỉ để đọc, KHÔNG nhận chuột
          (kẻo nuốt cú click vào H nằm thấp dưới đáy đồ thị) */}
      <div
        style={{
          position: 'absolute',
          left: 360,
          right: 360,
          bottom: 86,
          zIndex: 25,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {counter && activeAttempt && (
            <Callout key={activeAttempt.node} tone="warn" style={{ maxWidth: 1100 }}>
              {counter.text}
            </Callout>
          )}
        </AnimatePresence>
      </div>

      {/* Beat nghỉ: dải tổng kết thứ tự chốt */}
      <AnimatePresence>
        {def.strip && (
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: direction === 1 ? 0.3 : 0 }}
            style={{
              position: 'absolute',
              top: 70,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
              zIndex: 15,
              fontSize: 26,
            }}
          >
            {['C=4', 'G=6', 'E=10', 'D=14', 'B=16'].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: direction === 1 ? 0.5 + i * 0.22 : 0,
                  ease: 'backOut',
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {i > 0 && <span style={{ color: 'var(--fog-400)' }}>→</span>}
                <span
                  style={{
                    background: 'var(--amber)',
                    color: '#1a1206',
                    borderRadius: 12,
                    padding: '8px 18px',
                  }}
                >
                  {t} ✓
                </span>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S3FogWalk: SlideDef = {
  id: 's3-trong-suong',
  title: 'Bước đi trong sương',
  section: 3,
  beats: BEATS.count,
  gateBeats: GATE_BEATS,
  // các gate đều SAU beat morph nên được phép dùng "đỉnh/đồ thị"
  gateHint: 'click đỉnh trên đồ thị',
  component: S3FogWalkSlide,
}
