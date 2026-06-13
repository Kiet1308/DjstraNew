import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { GraphView } from '../../graph/GraphView'
import {
  type EdgeVisualState,
  type GhostEdge,
  type GraphSceneState,
  type NodeId,
  type NodeVisualState,
} from '../../graph/types'
import { Callout } from '../../components/Callout'
import { useRoom, useRoomEvent } from '../../room/RoomProvider'
import { CalloutSlot, Em, mapScene, mergeScene, type CalloutDef, type ScenePatch } from './common'
import { cutScene, finalScene } from './scenes'

/* ============ Tiến trình khám phá (đã verify chạy tay) ============
   chốt C=4 → G=6 → E=10 → D=14 → B=16; relax D: 18→16→14;
   khi chốt D: 14+6=20 > 16 → B giữ nguyên; đường cuối A→C→E→B=16.

   Kịch bản sư phạm: 2 lần chốt đầu (C, G) làm BẰNG TAY — không badge.
   Badge cost ra đời ở beat "ghi ra cho đỡ phải nhớ" (sau khi mở từ G,
   7 điểm + D đã đổi giá khiến trí nhớ quá tải). Quy luật "rẻ nhất là
   chốt được" KHÔNG được tuyên bố — nó vỡ ra sau 3 lần thử-phá tại gate. */

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

// badge chỉ tồn tại TỪ beat show-cost trở đi
const COSTS_G = { A: 0, C: 4, G: 6, E: 10, D: 16, F: 18, H: 20 }
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
  /** thu hẹp callout (beat có hành động quanh C ở góc trên-trái — không che node) */
  calloutW?: number
  gate?: GateDef
  /** dải chip thứ tự chốt — nội dung tùy beat */
  strip?: string[]
  /** beat đường cuối sáng dậy ngược về A */
  finalReveal?: boolean
}

const BEATS = defineBeats<Beat>([
  // b0 — Lý do bịt mắt: fog là công cụ tư duy
  {
    scene: mapScene({
      fog: { revealed: R_START },
      nodeStates: { A: 'current' },
      edgeStates: es([]),
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Nếu nhìn toàn bộ bản đồ, ta dễ thấy đáp án nhưng khó thấy quy tắc. Vì vậy ta che phần
          chưa khám phá lại và chỉ dùng những gì đã biết.
        </>
      ),
    },
  },
  // b1 — Luật chơi: "chắc chắn" nghĩa là gì, và vì sao khó tính vậy
  {
    scene: mapScene({
      fog: { revealed: R_START },
      nodeStates: { A: 'current' },
      edgeStates: es([]),
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Với mỗi điểm, ta chỉ ghi số khi <Em>CHẮC CHẮN</Em> số đó sẽ không phải sửa. Nếu mỗi
          bước chốt hẳn một điểm, ta không phải quay lại làm lại.
        </>
      ),
    },
  },
  // b2 — Mở mắt tại A: thấy 3 đoạn nối
  {
    scene: mapScene({
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
    scene: mapScene({
      fog: { revealed: R_A },
      nodeStates: ns([], ['C', 'G', 'D'], { A: 'current' }),
      edgeStates: es(K_A),
      weights: true,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Ta <Em>CHẮC CHẮN</Em> được đường ngắn nhất đến điểm nào?{' '}
          <Em color="var(--cyan)">Click thử từng ứng viên.</Em>
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
              Chưa chắc được — biết đâu trong sương có đường C–D ngắn hơn? Chỉ cần C–D = 10 là
              4+10 = <Em>14 &lt; 18</Em>. Chỗ này lát nữa sẽ kiểm tra lại.
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
    scene: mapScene({
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
  // b5 — Mở từ C + đặt tên MỞ + relax D — BẰNG MIỆNG, chưa có giấy bút
  {
    scene: mapScene({
      fog: { revealed: R_C },
      nodeStates: ns(['A', 'C'], ['G', 'D', 'E']),
      edgeStates: es(K_C, { AC: 'relaxing', CD: 'relaxing', CE: 'active' }),
      weights: true,
      mathOverlays: [
        // chip nằm BÊN PHẢI E — góc trên-trái là đất của callout dài
        { at: 'E', text: '4+6=10', tone: 'info', dx: 120, dy: -64 },
        { at: 'D', text: '4+12=16 < 18', tone: 'better', dx: -240, dy: 40 },
      ],
    }),
    calloutW: 520,
    callout: {
      tone: 'insight',
      text: (
        <>
          Từ C nhìn tiếp: thấy điểm mới <Em>E</Em>, với chi phí 4+6=<Em>10</Em>. Điểm thấy rồi
          mà chưa chắc, gọi là <Em>ĐANG MỞ</Em>. Đồng thời D được cải thiện: 4+12=16 &lt; 18.
          Tạm nhớ: E=10, D=16.
        </>
      ),
    },
  },
  // b6 — GATE 2: thử phá TỪNG ứng viên — kể cả kẻ sẽ thắng
  {
    scene: mapScene({
      fog: { revealed: R_C },
      nodeStates: ns(['A', 'C'], ['G', 'D', 'E']),
      edgeStates: es(K_C),
      weights: true,
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Ba điểm đang mở. Nhẩm lại nào: G… <Em>6</Em>, E… <Em>10</Em>, D… <Em>16</Em>{' '}
          <Em color="var(--cyan)">(vừa đổi từ 18 đấy)</Em>. Chắc chắn <Em>tiếp</Em> được điểm
          nào? Thử phá từng ứng viên như màn trước — click thử.
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
              <Em>15 &lt; 16</Em>. Chỗ này cũng sẽ kiểm tra lại.
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
            Còn lại <Em>G=6</Em>. Ta cũng thử phá G như các điểm khác: biết đâu trong sương có
            đường nào đó đến G rẻ hơn 6?
          </>
        ),
      },
      // G đang BỊ XÉT — chưa được khóa; nó chỉ ✓ sau khi sống sót đòn phá ở beat sau
      patch: { nodeStates: { G: 'current' } },
    },
  },
  // b7 — Đường lẻn THỬ PHÁ G → phá hụt → chốt (cut property nằm TRONG suy luận chọn)
  {
    scene: cutScene,
    callout: {
      tone: 'insight',
      text: (
        <>
          Giả sử có đường khác đến G. Đường đó muốn đi vào vùng chưa biết thì trước hết phải qua
          một điểm đang mở: E=10 hoặc D=16. Vừa tới đó đã lớn hơn 6, nên không thể tốt hơn G.{' '}
          <Em>Chốt G ✓.</Em>
        </>
      ),
    },
  },
  // b8 — Mở từ G
  {
    scene: mapScene({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G'], ['D', 'E', 'F', 'H']),
      edgeStates: es(K_G, { GF: 'active', GH: 'active' }),
      weights: true,
      mathOverlays: [
        { at: 'F', text: '6+12=18', tone: 'info', dx: -110 },
        { at: 'H', text: '6+14=20', tone: 'info', dx: -120 },
      ],
    }),
    callout: {
      tone: 'neutral',
      text: (
        <>
          G nhận dấu ✓, từ G nhìn tiếp: thấy thêm <Em>F</Em> (6+12=18) và <Em>H</Em> (6+14=20).
          B vẫn chưa xuất hiện.
        </>
      ),
    },
  },
  // b9 — TRÍ NHỚ QUÁ TẢI (nhu cầu ghi chú xuất hiện THẬT)
  {
    scene: mapScene({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G'], ['D', 'E', 'F', 'H']),
      edgeStates: es(K_G),
      weights: true,
      mathOverlays: [
        { at: 'D', text: '18 hay 16?', tone: 'worse', dx: -10, dy: -110 },
        // chip nằm BÊN PHẢI E — né callout dài góc trên-trái
        { at: 'E', text: '10… nhỉ?', tone: 'worse', dx: 130, dy: -60 },
        { at: 'F', text: '?', tone: 'worse', dx: -90, dy: -60 },
        { at: 'H', text: '?', tone: 'worse', dx: 60, dy: -100 },
      ],
    }),
    calloutW: 520,
    callout: {
      tone: 'need',
      text: (
        <>
          Có nhiều số phải nhớ: <Em>D là 18 hay 16?</Em> E, F, H là bao nhiêu? Muốn máy làm
          theo thì các số này phải được <Em>ghi rõ</Em>.
        </>
      ),
    },
  },
  // b10 — SHOW-COST: ghi ra cho đỡ phải nhớ → đặt tên cost
  {
    scene: mapScene({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G'], ['D', 'E', 'F', 'H']),
      edgeStates: es(K_G),
      weights: true,
      costs: COSTS_G,
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Ghi vào góc mỗi điểm con số <Em>tốt nhất ĐÃ BIẾT</Em> — <Em>cho đỡ phải nhớ</Em>.
          Điểm đã chốt thì số ấy là vĩnh viễn; điểm đang mở thì mới là "tạm thời tốt nhất". Dân
          lập trình gọi gọn con số này là <Em>cost</Em> — lát viết code cũng dùng đúng tên này.
        </>
      ),
    },
  },
  // b11 — GATE 3: lần đầu được ghi chú phục vụ
  {
    scene: mapScene({
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
          Bốn điểm đang mở: E=10, D=16, F=18, H=20 — <Em>lần đầu con số nằm sẵn trên bản đồ</Em>.
          Chắc chắn tiếp điểm nào? Click thử.
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
            <Em>E=10</Em> rẻ nhất. Muốn tìm đường khác đến E, trước hết phải qua D, F hoặc H,
            mà các điểm đó đều đã lớn hơn 10. Vậy E không thể bị phá. <Em>Chốt E ✓.</Em>
          </>
        ),
      },
      patch: { nodeStates: { E: 'locked' } },
    },
  },
  // b12 — VỠ RA QUY LUẬT — ngay tại trận, không đợi slide sau
  {
    scene: mapScene({
      fog: { revealed: R_G },
      nodeStates: ns(['A', 'C', 'G', 'E'], ['D', 'F', 'H']),
      edgeStates: es(K_G),
      weights: true,
      costs: COSTS_G,
    }),
    strip: ['C=4', 'G=6', 'E=10'],
    callout: {
      tone: 'insight',
      text: (
        <>
          Sau ba lần thử, ta thấy cùng một quy tắc: điểm đang mở <Em>rẻ nhất</Em> luôn chốt
          được. Từ giờ không cần thử từng ứng viên nữa — cứ chọn điểm đang mở rẻ nhất để{' '}
          <Em>chốt</Em>.
        </>
      ),
    },
  },
  // b13 — Mở từ E: THẤY ĐÍCH + relax D lần 2 (badge D tự sửa 16→14 — phần thưởng của việc ghi)
  {
    scene: mapScene({
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
          Mở từ E: thấy <Em>đích B</Em> với cost 10+6=16. Đồng thời D được cập nhật từ 16 xuống{' '}
          <Em color="var(--green)">14</Em>. Đây là lý do ta phải ghi cost rõ ràng.
        </>
      ),
    },
  },
  // b14 — Thấy đích mà CHƯA ĐƯỢC DỪNG — suy thẳng từ luật vừa đúc
  {
    scene: mapScene({
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
          Thấy B=16 nhưng chưa dừng: <Em>D=14</Em> còn rẻ hơn, nên B vẫn có thể bị cải thiện.
          Chỉ dừng khi <Em>B được chốt</Em>.
        </>
      ),
    },
  },
  // b15 — Áp luật: chốt D, kiểm tra B — nhánh KHÔNG đổi cũng phải hiện phép tính
  {
    scene: mapScene({
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
          D=14 rẻ nhất → <Em>CHỐT D</Em>. Kiểm tra D–B: 14+6=20 &gt; 16, nên{' '}
          <Em>B giữ nguyên</Em>.
        </>
      ),
    },
  },
  // b16 — Chốt B = đích → GIỜ mới dừng; đường sáng dậy NGƯỢC từ B về A
  {
    scene: finalScene,
    finalReveal: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Rẻ nhất bây giờ là chính <Em>B=16</Em> → <Em>CHỐT B</Em>. B là đích — GIỜ mới được
          dừng. Đường ngắn nhất: <Em>A → C → E → B = 16</Em>.
        </>
      ),
    },
  },
  // b17 — Beat nghỉ: toàn cảnh
  {
    scene: finalScene,
    strip: ['C=4', 'G=6', 'E=10', 'D=14', 'B=16'],
  },
])

const GATE_BEATS = BEATS.table
  .map((b, i) => (b.gate ? i : -1))
  .filter((i) => i >= 0)

// đường cuối sáng dậy NGƯỢC từ đích: EB trước, rồi CE, rồi AC
const FINAL_EDGE_DELAYS = { EB: 0, CE: 0.4, AC: 0.8 }
const FINAL_BEAT = BEATS.table.findIndex((b) => b.finalReveal)

function S3FogWalkSlide({ beat, direction, gateResolved, resolveGate, nudge }: SlideProps) {
  const def = BEATS.at(beat)
  const gate = def.gate
  const [attempt, setAttempt] = useState<{ beat: number; node: NodeId } | null>(null)

  // Phản ví dụ không lọt vào deck state, nhưng lan ra cả phòng qua kênh
  // event — người khác click sai thì màn hình ai cũng thấy "chưa chắc!".
  const { emitEvent } = useRoom()
  useRoomEvent<{ beat: number; node: NodeId }>('s3-attempt', (p) => {
    if (p && typeof p.beat === 'number' && typeof p.node === 'string') setAttempt(p)
  })

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
      emitEvent('s3-attempt', { beat, node: id })
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
      <CalloutSlot
        callout={callout}
        beatKey={`${beat}-${gateResolved ? 'ok' : 'q'}`}
        w={def.calloutW ?? 900}
      />

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

      {/* Dải chip thứ tự chốt — beat "vỡ ra quy luật" (canh phải, né callout)
          và beat nghỉ cuối (canh giữa) */}
      <AnimatePresence>
        {def.strip && (
          <motion.div
            key={def.strip.join('|')}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: direction === 1 ? 0.3 : 0 }}
            style={{
              position: 'absolute',
              top: 70,
              left: 0,
              right: def.callout ? 80 : 0,
              display: 'flex',
              justifyContent: def.callout ? 'flex-end' : 'center',
              gap: 18,
              zIndex: 15,
              fontSize: 26,
            }}
          >
            {def.strip.map((t, i) => (
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
  gateHint: 'click điểm trên bản đồ',
  component: S3FogWalkSlide,
}
