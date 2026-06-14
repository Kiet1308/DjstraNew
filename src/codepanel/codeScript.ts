import { createElement as h, Fragment, type ReactNode } from 'react'
import { sceneBase, type GraphSceneState } from '../graph/types'
import { L, type CodeBeat, type CodeLine } from './types'

/* ============================ Lời nhấn mạnh ============================ */

function em(text: string, color = 'var(--amber)'): ReactNode {
  return h('strong', { style: { color, fontWeight: 800 } }, text)
}
function t(...parts: ReactNode[]): ReactNode {
  return h(Fragment, null, ...parts)
}

/* ===================== Cảnh đồ thị mini (cột phải) ===================== */

const K_C_HIDDEN = { ED: 'hidden', EB: 'hidden', DB: 'hidden', GF: 'hidden', GH: 'hidden', FB: 'hidden' } as const

const R_ALL = ['A', 'C', 'G', 'D', 'E', 'F', 'H', 'B']
const ALL_DIM = {
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
  FB: 'hidden',
} as const
const COSTS_FINAL = { A: 0, C: 4, G: 6, E: 10, D: 14, F: 18, H: 20, B: 16 }

/** Ba trạng thái sương cùng lúc: chưa thấy / đang mở / đã chốt. */
const scThreeStates: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
})

const scStart: GraphSceneState = sceneBase({
  fog: { revealed: ['A'] },
  nodeStates: { A: 'locked' },
  edgeStates: {},
  costs: { A: 0 },
})

/** Vùng biên: A đã chốt (0), C/G/D đang mở (4,6,18) — đúng các ngả của A. */
const scFrontier: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D'] },
  nodeStates: { A: 'locked', C: 'frontier', G: 'frontier', D: 'frontier' },
  edgeStates: { AC: 'active', AG: 'active', AD: 'active', CD: 'hidden' },
  costs: { A: 0, C: 4, G: 6, D: 18 },
  weights: true,
})

/** Quét tìm min kiểu ngây thơ (chỉ so số): probe chạy A→C→G→D, A=0 vẫn thắng. */
const scMinScan: GraphSceneState = {
  ...scFrontier,
  probe: { route: ['A', 'C', 'G', 'D'], runId: 'min-scan' },
  minHolder: { node: 'A', value: 0, tone: 'keep' },
}

/** Lộ bug: A chốt từ lâu mà vẫn được chọn lại — kẹt vòng.
    GIỮ dấu ✓ của A (vẫn 'locked') — chính nghịch lý "đã đóng dấu mà vẫn bị chọn"
    mới là cái cần thấy; probe đi một vòng C→G→D rồi QUAY LẠI A để lộ "duyệt hết
    vẫn lòi về A". */
const scMinBug: GraphSceneState = {
  ...scFrontier,
  nodeStates: { A: 'locked', C: 'frontier', G: 'frontier', D: 'frontier' },
  probe: { route: ['A', 'C', 'G', 'D', 'A'], runId: 'min-bug' },
  minHolder: { node: 'A', value: 0, tone: 'warn', note: 'A đã chốt rồi?!' },
}

/** Vá xong: probe BỎ QUA A → C = 4 mới là nhỏ nhất. */
const scMinFixed: GraphSceneState = {
  ...scFrontier,
  nodeStates: { A: 'locked', C: 'current', G: 'frontier', D: 'frontier' },
  probe: { route: ['C', 'G', 'D'], runId: 'min-fixed' },
  minHolder: { node: 'C', value: 4, tone: 'keep', note: 'bỏ A · C = 4 nhỏ nhất' },
}

/** Thấy B=16 nhưng D=14 còn mở — đúng cảnh "chưa được dừng". */
const scSeeGoal: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E', 'F', 'H', 'B'] },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'frontier',
    F: 'frontier',
    H: 'frontier',
    B: 'current',
  },
  edgeStates: { DB: 'hidden', FB: 'hidden' },
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, F: 18, H: 20, B: 16 },
})

/** "map là gì": đứng ở C thấy đúng 3 ngả — khớp bảng map[C] = {A:4, D:12, E:6}. */
const scMapC: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'current', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN, AC: 'active', CD: 'active', CE: 'active' },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
})

/** Chốt C: dấu ✓ đóng vào C, probe đổi sang amber. */
const scLockC: GraphSceneState = {
  ...scFrontier,
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier' },
  probe: { route: ['C'], runId: 'lock-c', tone: 'lock' },
}

/** Mở kề C: gói chi phí trượt C→D (4+12=16) và C→E (4+6=10) — gán THÔ. */
const scOpenC: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: {
    AC: 'active',
    CD: 'relaxing',
    CE: 'relaxing',
    AG: 'dimmed',
    AD: 'dimmed',
    ED: 'hidden',
  },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
  packets: [
    { id: 'pk-cd', from: 'C', to: 'D', label: '4+12=16', tone: 'better' },
    { id: 'pk-ce', from: 'C', to: 'E', label: '4+6=10', tone: 'better' },
  ],
})

/** Hết ứng viên: quét cả lượt không ai lọt → min = null (đã chốt hết). */
const scExhausted: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'dimmed',
    C: 'dimmed',
    G: 'dimmed',
    E: 'dimmed',
    D: 'dimmed',
    B: 'dimmed',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM },
  costs: COSTS_FINAL,
  mathOverlays: [{ at: 'D', text: 'quét cả lượt — chẳng ai lọt → min = null', tone: 'info', dy: -120 }],
})

/** Nhánh KHÔNG đổi: 14+6=20 > 16 → giữ nguyên. */
const scKeepBetter: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E', 'F', 'H', 'B'] },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    F: 'frontier',
    H: 'frontier',
    B: 'frontier',
  },
  edgeStates: { FB: 'hidden', DB: 'active' },
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, F: 18, H: 20, B: 16 },
  weights: true,
  mathOverlays: [{ at: 'B', text: '14+6=20 > 16 → giữ nguyên', tone: 'worse', dx: -60 }],
})

/** "Mở ngược" về A: 4+4=8 > 0 → if lo hết. */
const scBackToA: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN, AC: 'relaxing' },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
  mathOverlays: [{ at: 'A', text: '4+4=8 > 0 → giữ nguyên', tone: 'worse', dx: 60, dy: -110 }],
})

/** Toàn cảnh kết quả — đường sáng. CHỈ dùng sau màn truy ngược Prev
    (trước đó máy chỉ biết CON SỐ, thắp sẵn đường là spoil chính câu hỏi). */
const scFull: GraphSceneState = sceneBase({
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
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, B: 16, F: 18, H: 20 },
})

/** Kết thúc thuật toán: biết GIÁ mọi điểm — KHÔNG cạnh nào sáng. Đường chưa tồn tại. */
const scCostsNoPath: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'locked',
    F: 'frontier',
    H: 'frontier',
  },
  edgeStates: { ...ALL_DIM },
  costs: COSTS_FINAL,
})

/* ===== Cảnh "chỉ ghi khi rẻ hơn" — bảng quyết định Cost[B] (gadget) =====
   B nhận 16 qua E, rồi D đề xuất 20: ô đã có số → phải so trước khi ghi.
   Bảng quyết định tự diễn câu chuyện; đồ thị chỉ làm nền chỉ ra "ở đâu". */

const DEC_NODES: GraphSceneState['nodeStates'] = {
  A: 'locked',
  C: 'locked',
  G: 'locked',
  E: 'locked',
  D: 'locked',
  B: 'current',
  F: 'dimmed',
  H: 'dimmed',
}

/** Ô B còn TRỐNG — zoom vào đúng lúc sắp ghi Cost[B]. */
const scDecEmpty: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: { ...DEC_NODES },
  edgeStates: { ...ALL_DIM },
  costs: { ...COSTS_FINAL, B: null },
  decision: { at: 'B', phase: 'empty', held: null, runId: 'dec-empty' },
})

/** E mở B: 10+6=16 — ô trống thì nhận luôn. */
const scDecReceive: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: { ...DEC_NODES },
  edgeStates: { ...ALL_DIM, AC: 'onPath', CE: 'onPath', EB: 'onPath' },
  costs: { ...COSTS_FINAL, B: 16 },
  decision: { at: 'B', phase: 'receive', held: 16, runId: 'dec-recv' },
})

/** D cũng tới: 14+6=20 — nhưng ô đã giữ 16. Gói "20" trượt từ D cho có lai lịch
    (đường D→B nằm DƯỚI bảng quyết định nên không bị che). */
const scDecSecond: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: { ...DEC_NODES, D: 'current' },
  edgeStates: { ...ALL_DIM, AC: 'onPath', CE: 'onPath', EB: 'onPath', DB: 'active' },
  costs: { ...COSTS_FINAL, B: 16 },
  packets: [{ id: 'pk-db20', from: 'D', to: 'B', label: '14+6=20', tone: 'info' }],
  decision: { at: 'B', phase: 'second', held: 16, incoming: 20, runId: 'dec-2nd' },
})

/** CÁI SAI — gán bừa: 20 đè 16, đường tốt tắt phụt. */
const scDecOverwrite: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: { ...DEC_NODES, D: 'current' },
  edgeStates: { ...ALL_DIM, AC: 'dimmed', CE: 'dimmed', EB: 'dimmed', DB: 'active' },
  costs: { ...COSTS_FINAL, B: 20 },
  costFlash: { B: 'worse' },
  decision: { at: 'B', phase: 'overwrite', held: 16, incoming: 20, runId: 'dec-ow' },
})

/** BẢN VÁ — cổng so sánh: 20 không nhỏ hơn 16 → bị chặn, giữ 16. */
const scDecGate: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: { ...DEC_NODES, D: 'current' },
  edgeStates: { ...ALL_DIM, AC: 'onPath', CE: 'onPath', EB: 'onPath', DB: 'active' },
  costs: { ...COSTS_FINAL, B: 16 },
  decision: { at: 'B', phase: 'gate', held: 16, incoming: 20, runId: 'dec-gate' },
})

/* ===== Cảnh Phần Prev (Cụm C) — visual là chính ===== */

/** "16 — nhưng đi lối nào?" — B hỏi, không cạnh nào trả lời. */
const scPrevAsk: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'current',
    F: 'frontier',
    H: 'frontier',
  },
  edgeStates: { ...ALL_DIM },
  costs: COSTS_FINAL,
  mathOverlays: [{ at: 'B', text: '16 — nhưng đi lối nào?', tone: 'info', dx: -90, dy: -110 }],
})

/** Ba cửa vào B — chẳng cửa nào ghi dấu. */
const scThreeDoors: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'current',
    F: 'frontier',
    H: 'frontier',
  },
  edgeStates: { ...ALL_DIM, DB: 'active', EB: 'active', FB: 'active' },
  costs: COSTS_FINAL,
})

/** Ý ngây thơ — Path[C] chép lộ trình: đồ thị sáng đồng bộ A–C. */
const scPathC: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'onPath',
    C: 'onPath',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'locked',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, AC: 'onPath' },
  costs: COSTS_FINAL,
})

/** Bảng dài thêm: các route chia nhánh từ A–C–E. */
const scPathAll: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'onPath',
    C: 'onPath',
    E: 'onPath',
    G: 'locked',
    D: 'locked',
    B: 'locked',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, AC: 'onPath', CE: 'onPath', ED: 'active', EB: 'active' },
  costs: COSTS_FINAL,
})

/** Quan sát trên đồ thị: 2 route chung HỆT đoạn đầu, khác đúng bước cuối. */
const scShareStart: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'onPath',
    C: 'onPath',
    E: 'onPath',
    B: 'current',
    G: 'dimmed',
    D: 'dimmed',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, AC: 'onPath', CE: 'onPath', EB: 'active' },
  costs: { A: 0, C: 4, E: 10, B: 16 },
})

/** Cây mũi tên "tôi đến từ đây" — mỗi điểm đúng MỘT mũi tên. */
const PREV_TREE = (flareAt?: string) =>
  [
    { node: 'C', from: 'A' },
    { node: 'G', from: 'A' },
    { node: 'E', from: 'C' },
    { node: 'D', from: 'E' },
    { node: 'B', from: 'E' },
    { node: 'F', from: 'G' },
    { node: 'H', from: 'G' },
  ].map((a) => ({ ...a, flare: a.node === flareAt }))

const scPrevTree: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'locked',
    F: 'frontier',
    H: 'frontier',
  },
  edgeStates: { ...ALL_DIM },
  costs: COSTS_FINAL,
  prevArrows: PREV_TREE(),
})

/** Diễn lại relax THẬT lần 1: chốt C mở D — mũi tên D→C cắm theo cost. */
const scPrevWrite1: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: {
    ED: 'hidden',
    EB: 'hidden',
    DB: 'hidden',
    GF: 'hidden',
    GH: 'hidden',
    FB: 'hidden',
    AC: 'relaxing',
    CD: 'relaxing',
    CE: 'active',
  },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
  mathOverlays: [{ at: 'D', text: '4+12=16', tone: 'better', dx: -30 }],
  prevArrows: [
    { node: 'G', from: 'A' },
    { node: 'E', from: 'C' },
    { node: 'D', from: 'C', flare: true },
  ],
})

/** Relax lần 2 (E thắng): cost D 16→14 VÀ mũi tên D XOAY C→E — cùng khoảnh khắc.
    (Thời điểm: E vừa chốt ⇒ G ĐÃ chốt trước đó — đúng thứ tự C→G→E.) */
const scPrevSwing: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'locked', E: 'locked', D: 'frontier' },
  edgeStates: {
    EB: 'hidden',
    DB: 'hidden',
    GF: 'hidden',
    GH: 'hidden',
    FB: 'hidden',
    ED: 'relaxing',
    CE: 'active',
  },
  costs: { A: 0, C: 4, G: 6, D: 14, E: 10 },
  weights: true,
  mathOverlays: [{ at: 'D', text: '10+4=14 < 16', tone: 'better', dx: -30 }],
  prevArrows: [
    { node: 'G', from: 'A' },
    { node: 'E', from: 'C' },
    { node: 'D', from: 'E', flare: true },
  ],
})

/** Truy ngược: hỏi B → E → C → A, thắp sáng từng đoạn. */
const scTraceB: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'locked',
    D: 'locked',
    B: 'current',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, EB: 'onPath' },
  costs: COSTS_FINAL,
  prevArrows: PREV_TREE('B'),
})

const scTraceE: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'locked',
    C: 'locked',
    G: 'locked',
    E: 'current',
    D: 'locked',
    B: 'onPath',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, EB: 'onPath', CE: 'onPath' },
  costs: COSTS_FINAL,
  prevArrows: PREV_TREE('E'),
})

const scTraceC: GraphSceneState = sceneBase({
  fog: { revealed: R_ALL },
  nodeStates: {
    A: 'onPath',
    C: 'current',
    G: 'locked',
    E: 'onPath',
    D: 'locked',
    B: 'onPath',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: { ...ALL_DIM, EB: 'onPath', CE: 'onPath', AC: 'onPath' },
  costs: COSTS_FINAL,
  prevArrows: PREV_TREE('C'),
})

/* ============================== Dòng code ============================== */

const fnOpen = L('fn-open', 'NganNhat(map, start, end) {')
const fnClose = L('fn-close', '}')
const costDecl = L('cost-decl', 'Cost = []', 1)
const visDecl = L('vis-decl', 'Visited = []', 1)
const startZero = L('start-zero', 'Cost[start] = 0', 1)
const loopOpen = L('loop-open', 'while (true) {', 1)
// đặt nợ bằng lời MƠ HỒ đúng tầm hiểu lúc đó — chưa dùng thuật ngữ "chốt hết/gặp đích"
const phDone = L('ph-done', 'dừng khi nào? — tính sau (1)', 2, 'placeholder')
const phFound = L('ph-found', 'và khi nào nữa? — tính sau (2)', 2, 'placeholder')
const loopClose = L('loop-close', '}', 1)
const minInit = L('min-init', 'min = null', 2)
const scanOpen = L('scan-open', 'for đỉnh in map {', 2)
const scanIfOpen = L('scan-if-open', 'if Cost[đỉnh] != null và not Visited[đỉnh] {', 3)
// bản gõ ĐẦU TIÊN — chưa loại điểm đã chốt; beat "Visited" sẽ morph thành scanIfOpen.text
const scanIfOpenBare = L('scan-if-open', 'if Cost[đỉnh] != null {', 3)
const minIfOpen = L('min-if-open', 'if min == null hoặc Cost[đỉnh] < Cost[min] {', 4)
const minSet = L('min-set', 'min = đỉnh', 5)
const minIfClose = L('min-if-close', '}', 4)
const scanIfClose = L('scan-if-close', '}', 3)
const scanClose = L('scan-close', '}', 2)
const breakDone = L('break-done', 'if min == null break   // chẳng chọn nổi nữa: chốt hết', 2)
const breakFound = L('break-found', 'if min == end break   // đích đã được CHỐT', 2)
const lock = L('lock', 'Visited[min] = true', 2)
const nbOpen = L('nb-open', 'for đỉnh kề in map[min] {', 2)
const nbClose = L('nb-close', '}', 2)
const newCost = L('newcost', 'newCost = Cost[min] + map[min][đỉnh kề]', 3)
const setCost = L('setcost', 'Cost[đỉnh kề] = newCost', 3)
const ifBetterOpen = L('if-better-open', 'if Cost[đỉnh kề] == null hoặc newCost < Cost[đỉnh kề] {', 3)
const ifBetterClose = L('if-better-close', '}', 3)
const ret = L('ret', 'return Cost[end]', 1)
// S4Prev
const prevDecl = L('prev-decl', 'Prev = []', 1)
const prevSet = L('prev-set', 'Prev[đỉnh kề] = min', 4)

/* ============================ Kịch bản BUILD ============================ */
/* Luật "nhu cầu trước, code sau": need() sinh 2 beat — nói trước, gõ sau.  */

function need(
  callout: CodeBeat['callout'],
  opsBeat: Omit<CodeBeat, 'callout'>,
  extras: Partial<CodeBeat> = {},
): CodeBeat[] {
  return [
    { callout, ...extras },
    { callout, ...extras, ...opsBeat },
  ]
}

export const BUILD_SCRIPT: CodeBeat[] = [
  /* ===== MÀN 1 — cầu nối sương ↔ dữ liệu. Text = nhãn ngắn, lời nói miệng.
     Thẻ phụ (stateTable/mapTable/costCabinet) đã gánh phần minh hoạ. ===== */
  {
    focus: 'visual',
    callout: { tone: 'need', text: t(em('3 tình trạng', 'var(--cyan)'), ' của mỗi điểm') },
    graphScene: scThreeStates,
    aside: 'stateTable',
    pseudoStep: null,
  },
  {
    callout: { tone: 'need', text: t('Bản đồ → bảng tra ', em('map')) },
    graphScene: scMapC,
    aside: 'mapTable',
  },
  {
    callout: { tone: 'need', text: t('Mỗi điểm một ô ', em('Cost')) },
    graphScene: scThreeStates,
    aside: 'costCabinet',
  },

  /* ===== MÀN 2 — gõ máy ===== */
  // ---- Khung hàm
  ...need(
    { tone: 'need', text: t('Cần một ', em('hàm'), ': map, start, end → độ dài') },
    { ops: [{ op: 'insert', afterId: null, lines: [fnOpen, fnClose] }], highlight: ['fn-open'] },
    { focus: 'code' },
  ),

  // ---- Cost = [] + Cost[start] = 0
  ...need(
    { tone: 'insight', text: t(em('Cost[A] = 0'), ' · còn lại chưa biết') },
    {
      ops: [{ op: 'insert', afterId: 'fn-open', lines: [costDecl, startZero] }],
      highlight: ['cost-decl', 'start-zero'],
    },
    { graphScene: scStart, pseudoStep: null },
  ),

  // ---- Vòng lặp + 2 placeholder
  ...need(
    { tone: 'need', text: t(em('Lặp'), ': chọn → mở. Dừng khi nào? tính sau') },
    {
      ops: [{ op: 'insert', afterId: 'start-zero', lines: [loopOpen, phDone, phFound, loopClose] }],
      highlight: ['ph-done', 'ph-found'],
    },
    { pseudoStep: 3, graphScene: scFrontier },
  ),

  // ---- Chọn min (viết THÔ — chưa loại điểm đã chốt)
  ...need(
    { tone: 'need', text: t(em('① Chọn', 'var(--cyan)'), ' điểm mở, cost nhỏ nhất → min') },
    {
      ops: [
        {
          op: 'insert',
          afterId: 'loop-open',
          lines: [minInit, scanOpen, scanIfOpenBare, minIfOpen, minSet, minIfClose, scanIfClose, scanClose],
        },
      ],
      highlight: ['min-init', 'scan-open', 'min-set'],
    },
    { pseudoStep: 1, graphScene: scMinScan },
  ),

  // ---- Lộ bug → vá Visited
  {
    callout: { tone: 'warn', text: t('A chốt rồi mà ', em('vẫn bị chọn lại', 'var(--red)'), ' ?!') },
    graphScene: scMinBug,
  },
  {
    callout: { tone: 'insight', text: t('Đánh dấu ', em('Visited'), ' → quét thì bỏ qua') },
    ops: [
      { op: 'insert', afterId: 'cost-decl', lines: [visDecl] },
      { op: 'morph', targetId: 'scan-if-open', text: scanIfOpen.text },
    ],
    highlight: ['vis-decl', 'scan-if-open'],
    graphScene: scMinFixed,
  },

  // ---- Trả nợ placeholder 1: chốt hết = min null
  ...need(
    { tone: 'insight', text: t('Quét hụt cả lượt → ', em('min null'), ' → dừng') },
    {
      ops: [{ op: 'replace', targetId: 'ph-done', lines: [breakDone] }],
      highlight: ['break-done'],
    },
    { pseudoStep: 3, graphScene: scExhausted },
  ),

  // ---- Trả nợ placeholder 2: gặp đích = min == end
  ...need(
    { tone: 'insight', text: t('Đích ', em('được CHỐT'), ' (min == end) → xong') },
    {
      ops: [{ op: 'replace', targetId: 'ph-found', lines: [breakFound] }],
      highlight: ['break-found'],
    },
    { graphScene: scSeeGoal },
  ),

  // ---- Chốt min
  ...need(
    { tone: 'need', text: t('min đã chắc → ', em('đóng dấu ✓')) },
    { ops: [{ op: 'insert', afterId: 'break-found', lines: [lock] }], highlight: ['lock'] },
    { pseudoStep: 2, graphScene: scLockC },
  ),

  // ---- Mở kề (gán THÔ — chưa có điều kiện)
  ...need(
    { tone: 'need', text: t(em('② Mở', 'var(--cyan)'), ' hàng xóm: cost min + cạnh') },
    {
      ops: [{ op: 'insert', afterId: 'lock', lines: [nbOpen, newCost, setCost, nbClose] }],
      highlight: ['nb-open', 'newcost', 'setcost'],
    },
    { graphScene: scOpenC },
  ),

  /* ===== MÀN 3 — "chỉ ghi khi rẻ hơn": bảng quyết định Cost[B] (chuỗi tiểu-cảnh) ===== */
  {
    focus: 'visual',
    callout: { tone: 'warn', text: t('Ghi Cost[B] — ô đang ', em('trống', 'var(--cyan)')) },
    graphScene: scDecEmpty,
  },
  {
    callout: { tone: 'need', text: t('Trống → nhận ', em('16', 'var(--green)')) },
    graphScene: scDecReceive,
  },
  {
    callout: { tone: 'need', text: t('D tới: ', em('20'), ' · ô đã có 16') },
    graphScene: scDecSecond,
  },
  {
    callout: { tone: 'warn', text: t('Gán bừa: ', em('20 đè 16', 'var(--red)'), ' → mất đường tốt') },
    highlight: ['setcost'],
    highlightTone: 'danger',
    graphScene: scDecOverwrite,
  },
  {
    callout: { tone: 'insight', text: t(em('Rẻ hơn?'), ' 20 > 16 → ', em('khỏi ghi', 'var(--green)')) },
    graphScene: scDecGate,
  },

  /* ===== MÀN 4 — vá if + xét lại A + return ===== */
  ...need(
    { tone: 'insight', text: t('Bọc ', em('if'), ': trống / nhỏ hơn mới ghi') },
    {
      // máy quay về code TẠI beat gõ — beat nói trước đó vẫn đứng trong màn visual
      focus: 'code',
      ops: [
        {
          op: 'wrap',
          targetId: 'setcost',
          before: ifBetterOpen,
          after: ifBetterClose,
          indentDelta: 1,
        },
      ],
      highlight: ['if-better-open', 'setcost', 'if-better-close'],
    },
    { graphScene: scKeepBetter },
  ),

  // ---- xét lại A
  {
    callout: { tone: 'insight', text: t('Quay về A: 8 > 0 → ', em('if tự bỏ qua')) },
    highlight: ['if-better-open'],
    graphScene: scBackToA,
  },

  // ---- return
  ...need(
    { tone: 'need', text: t('Đáp án ở ', em('Cost[end]')) },
    { ops: [{ op: 'insert', afterId: 'loop-close', lines: [ret] }], highlight: ['ret'] },
    // máy lúc này chỉ biết CON SỐ — chưa hề biết đường (đường sáng để dành cho màn Prev)
    { graphScene: scCostsNoPath, pseudoStep: null },
  ),

  // ---- tổng kết — thắp cả 3 câu checklist
  {
    callout: { tone: 'insight', text: t('Mấy chục dòng = ', em('3 câu lúc nãy')) },
    graphScene: scCostsNoPath,
    pseudoStep: 'all',
  },
]

/* ============================ Kịch bản PREV ============================ */

const FULL_CODE: CodeLine[] = [
  fnOpen,
  costDecl,
  visDecl,
  startZero,
  loopOpen,
  minInit,
  scanOpen,
  scanIfOpen,
  minIfOpen,
  minSet,
  minIfClose,
  scanIfClose,
  scanClose,
  breakDone,
  breakFound,
  lock,
  nbOpen,
  newCost,
  ifBetterOpen,
  // wrap ở BUILD đã thụt dòng này vào trong if — trạng thái cuối là indent 4
  { ...setCost, indent: 4 },
  ifBetterClose,
  nbClose,
  loopClose,
  ret,
  fnClose,
]

export const PREV_SCRIPT: CodeBeat[] = [
  /* ===== Màn 1 — Câu hỏi: biết GIÁ, không biết ĐƯỜNG ===== */
  // beat 0: code đầy đủ hiện sẵn (slide tắt typewriter ở beat này)
  {
    ops: [{ op: 'insert', afterId: null, lines: FULL_CODE }],
    // focus visual DÍNH cho TOÀN slide: code đã đọc xong ở slide trước, mấy
    // dòng Prev sắp gõ đều ngắn — panel hẹp đứng yên, đồ thị lớn suốt màn
    focus: 'visual',
    callout: {
      tone: 'warn',
      text: t(
        'Hàm đã trả đúng ',
        em('con số 16'),
        ', nhưng chưa trả về ',
        em('con đường', 'var(--cyan)'),
        '. Nhìn bản đồ mà xem: toàn cost, ',
        em('không một lối đi nào được thắp sáng', 'var(--red)'),
        '.',
      ),
    },
    graphScene: scPrevAsk,
    pseudoStep: null,
  },
  {
    callout: {
      tone: 'need',
      text: t(
        'B có 3 đường đi vào, nhưng ta chưa biết đường ngắn nhất đi qua đường nào.',
      ),
    },
    graphScene: scThreeDoors,
  },

  /* ===== Màn 2 — Ý tưởng ngây thơ & cái giá của nó ===== */
  {
    callout: {
      tone: 'need',
      text: t(
        'Cách nghĩ đầu tiên ai cũng nghĩ: mỗi điểm tự chép ',
        em('nguyên cả lộ trình'),
        ' đến nó.',
      ),
    },
    aside: 'pathFull',
    graphScene: scPathC,
  },
  {
    callout: {
      tone: 'need',
      text: t('Điểm nào cũng một dòng như thế — bảng dài dần ra.'),
    },
    aside: 'pathGrow',
    graphScene: scPathAll,
  },
  {
    callout: {
      tone: 'warn',
      text: t(
        'Bản đồ thật ',
        em('nghìn điểm', 'var(--red)'),
        ': mỗi ô phải lưu một danh sách rất dài, rất tốn bộ nhớ.',
      ),
    },
    aside: 'pathExplode',
    graphScene: scPathAll,
  },

  /* ===== Màn 3 — Quan sát & nén: chỉ cần nhớ MỘT bước =====
     (2 beat đầu còn thẻ phụ — nối liền khối thẻ màn 2; thẻ rút đi
     ĐÚNG lúc cây mũi tên hiện: đồ thị nở to làm cú reveal) ===== */
  {
    callout: {
      tone: 'insight',
      text: t(
        'Nhìn lên đồ thị: lộ trình của E và của B chung phần đầu, chỉ khác ',
        em('bước cuối'),
        '.',
      ),
    },
    aside: 'pathWaste',
    graphScene: scShareStart,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Vậy mỗi điểm chỉ cần nhớ đúng ',
        em('MỘT điều'),
        ': điểm ngay trước nó là điểm nào. Đặt tên bảng mới: ',
        em('Prev'),
        ' — "bước ngay trước".',
      ),
    },
    aside: 'prevChain',
    graphScene: scShareStart,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Mỗi điểm có một mũi tên về điểm đứng ngay trước nó. Muốn lấy cả con đường thì lần ',
        'ngược từ đích.',
      ),
    },
    graphScene: scPrevTree,
  },

  /* ===== Màn 4 — Code hóa: Prev ghi ĐÚNG chỗ ghi cost ===== */
  ...need(
    { tone: 'need', text: t('Thêm một bảng cho "bước ngay trước".') },
    {
      ops: [{ op: 'insert', afterId: 'vis-decl', lines: [prevDecl] }],
      highlight: ['prev-decl'],
    },
  ),
  {
    callout: {
      tone: 'need',
      text: t(
        'Ghi Prev lúc nào? Xem lại một lần ghi cost: chốt C, mở D — mũi tên ',
        em('"điểm trước đó"', 'var(--cyan)'),
        ' cắm theo.',
      ),
    },
    highlight: ['setcost'],
    graphScene: scPrevWrite1,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Khi cost được cập nhật, Prev cũng phải ',
        em('cập nhật theo', 'var(--green)'),
        ' (D: từ C sang E!). ',
        em('Cùng một lúc'),
        ' — nên cùng một chỗ trong code.',
      ),
    },
    highlight: ['if-better-open', 'setcost', 'if-better-close'],
    graphScene: scPrevSwing,
  },
  {
    callout: {
      tone: 'need',
      text: t('Thêm đúng một dòng, ngay cạnh chỗ ghi cost.'),
    },
    ops: [{ op: 'insert', afterId: 'setcost', lines: [prevSet] }],
    highlight: ['prev-set'],
    graphScene: scPrevSwing,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Và đổi câu trả lời: trả về bảng ',
        em('Prev'),
        ' — cần đường nào thì lần ngược từ đích.',
      ),
    },
    // comment ngắn — panel hẹp 600px của màn visual phải đọc trọn dòng
    ops: [{ op: 'morph', targetId: 'ret', text: 'return Prev   // lần ngược là ra' }],
    highlight: ['ret'],
    // thứ được return chính là CÂY MŨI TÊN — không phải khoảnh khắc swing vừa rồi
    graphScene: scPrevTree,
  },

  /* ===== Màn 5 — Truy ngược khép vòng "tư duy ngược" ===== */
  {
    callout: {
      tone: 'need',
      text: t('Chạy thử phép lần ngược. Trước B là điểm nào? ', em('E'), '.'),
    },
    graphScene: scTraceB,
  },
  {
    callout: {
      tone: 'need',
      text: t('Trước E? — ', em('C'), '.'),
    },
    graphScene: scTraceE,
  },
  {
    callout: {
      tone: 'insight',
      text: t('Trước C? — ', em('A'), '. Chạm gốc.'),
    },
    graphScene: scTraceC,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Lật ngược lại: ',
        em('A → C → E → B = 16'),
        '. Bài toán hỏi xuôi — ta trả lời bằng cách ',
        em('lần ngược', 'var(--cyan)'),
        ': đúng với cách nhìn ngược ở Phần 3.',
      ),
    },
    graphScene: scFull,
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Xong phần xây. Tiếp theo: cho hàm ',
        em('chạy thử', 'var(--cyan)'),
        ' — từng dòng, từng bước, xem các bảng thay đổi ra sao.',
      ),
    },
    graphScene: scFull,
  },
]

/* ===== Dev-assert: trạng thái cuối của BUILD phải GIỐNG HỆT FULL_CODE
   (id + indent + text) — loại lệch "wrap chỉ thụt bản sao" bị bắt tại đây. ===== */
if (import.meta.env.DEV) {
  void import('./buildCodeState').then(({ buildCodeState }) => {
    const final = buildCodeState(BUILD_SCRIPT, BUILD_SCRIPT.length - 1).lines
    if (final.length !== FULL_CODE.length) {
      throw new Error(
        `FULL_CODE lệch BUILD: ${FULL_CODE.length} dòng vs fold ra ${final.length}`,
      )
    }
    final.forEach((l, i) => {
      const f = FULL_CODE[i]
      if (l.id !== f.id || l.indent !== f.indent || l.text !== f.text) {
        throw new Error(
          `FULL_CODE[${i}] lệch BUILD: "${f.id}"(indent ${f.indent}) vs "${l.id}"(indent ${l.indent})`,
        )
      }
    })
  })
}
