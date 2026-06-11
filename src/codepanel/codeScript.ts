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

/** Khoảnh khắc quét tìm min: G=6 thắng. */
const scMin: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'current', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  mathOverlays: [{ at: 'G', text: 'min: 6 < 10 < 16', tone: 'info', dx: 40, dy: 70 }],
})

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

/** min vừa thắng cuộc quét → được đóng dấu ✓. */
const scLockG: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'locked', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
})

/** Relax D qua C: 4+12=16 < 18. */
const scRelax: GraphSceneState = sceneBase({
  fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
  nodeStates: { A: 'locked', C: 'locked', G: 'frontier', D: 'frontier', E: 'frontier' },
  edgeStates: { ...K_C_HIDDEN, AC: 'relaxing', CD: 'relaxing' },
  costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
  weights: true,
  mathOverlays: [{ at: 'D', text: '4+12=16 < 18', tone: 'better', dx: -30 }],
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

/** Toàn cảnh kết quả. */
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
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, B: 16 },
})

/* ============================== Dòng code ============================== */

const fnOpen = L('fn-open', 'NganNhat(map, start, end) {')
const fnClose = L('fn-close', '}')
const costDecl = L('cost-decl', 'Cost = []', 1)
const visDecl = L('vis-decl', 'Visited = []', 1)
const startZero = L('start-zero', 'Cost[start] = 0', 1)
const loopOpen = L('loop-open', 'while (true) {', 1)
const phDone = L('ph-done', 'nếu chốt hết → dừng', 2, 'placeholder')
const phFound = L('ph-found', 'nếu gặp đích → dừng', 2, 'placeholder')
const loopClose = L('loop-close', '}', 1)
const minInit = L('min-init', 'min = null', 2)
const scanOpen = L('scan-open', 'for đỉnh in map {', 2)
const scanIfOpen = L('scan-if-open', 'if Cost[đỉnh] != null và not Visited[đỉnh] {', 3)
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
  // ---- 3 beat cầu nối: sương ↔ dữ liệu
  {
    callout: {
      tone: 'need',
      text: t(
        'Trong sương, mỗi điểm chỉ có ',
        em('3 tình trạng', 'var(--cyan)'),
        ': chưa thấy — đang mở (có con số tạm) — đã chốt ✓. Máy chỉ cần nhớ đúng chừng đó: chưa thấy = ',
        em('Cost == null'),
        ' · đang mở = ',
        em('Cost ≠ null'),
        ' · đã chốt = ',
        em('Visited = true'),
        '.',
      ),
    },
    graphScene: scThreeStates,
    pseudoStep: null,
  },
  {
    callout: {
      tone: 'need',
      text: t(
        'Còn tấm bản đồ? Gói gọn trong một bảng tra tên là ',
        em('map'),
        ': tra một điểm → nhận danh sách các điểm nối với nó kèm chi phí. Ví dụ ',
        em('map[C]', 'var(--cyan)'),
        ' — đứng ở C thấy đúng 3 ngả, bảng ghi đúng 3 dòng.',
      ),
    },
    graphScene: scMapC,
    aside: 'mapTable',
  },
  {
    callout: {
      tone: 'need',
      text: t(
        'Và cách ghi chép: coi như mỗi điểm có một ',
        em('ngăn tủ mang tên nó'),
        ' — ',
        em('Cost["C"] = 4', 'var(--cyan)'),
        ' đọc là "ngăn C của tủ Cost đang ghi số 4".',
      ),
    },
    graphScene: scThreeStates,
  },

  // ---- khung hàm
  ...need(
    {
      tone: 'need',
      text: t(
        'Bắt tay. Ta cần một ',
        em('cỗ máy'),
        ': đưa vào bản đồ, điểm xuất phát, điểm đích — nhận về độ dài đường ngắn nhất.',
      ),
    },
    { ops: [{ op: 'insert', afterId: null, lines: [fnOpen, fnClose] }], highlight: ['fn-open'] },
  ),

  // ---- 2 ngăn tủ
  ...need(
    {
      tone: 'need',
      text: t(
        'Câu ① nhắc đến hai thứ phải nhớ: ',
        em('cost tốt nhất đã biết', 'var(--cyan)'),
        ' của từng điểm, và điểm nào ',
        em('đã chốt'),
        '. Mỗi thứ một tủ.',
      ),
    },
    {
      ops: [{ op: 'insert', afterId: 'fn-open', lines: [costDecl, visDecl] }],
      highlight: ['cost-decl', 'vis-decl'],
    },
    { pseudoStep: 1 },
  ),

  // ---- Cost[start] = 0
  ...need(
    {
      tone: 'insight',
      text: t(
        'Mọi tủ đang rỗng — trừ một điều ta chắc từ đầu: "đường ngắn nhất từ A đến A ',
        em('bằng 0, khỏi nghĩ'),
        '". Cả phát hiện hôm trước nằm gọn trong một dòng.',
      ),
    },
    { ops: [{ op: 'insert', afterId: 'vis-decl', lines: [startZero] }], highlight: ['start-zero'] },
    { graphScene: scStart },
  ),

  // ---- vòng lặp + 2 placeholder
  ...need(
    {
      tone: 'need',
      text: t(
        'Câu ③ bảo ',
        em('lặp'),
        '. Lặp đến bao giờ? Chưa cần nghĩ vội — cứ lặp đã, dán tạm 2 mảnh giấy nhớ chỗ sẽ dừng.',
      ),
    },
    {
      ops: [{ op: 'insert', afterId: 'start-zero', lines: [loopOpen, phDone, phFound, loopClose] }],
      highlight: ['ph-done', 'ph-found'],
    },
    { pseudoStep: 3 },
  ),

  // ---- quét tìm min
  ...need(
    {
      tone: 'need',
      text: t(
        'Vào việc chính — câu ①: "chọn điểm đang mở có cost ',
        em('bé nhất'),
        '". Muốn biết bao giờ dừng thì phải ',
        em('thử chọn trước đã'),
        ' — nên việc chọn đứng TRÊN hai mảnh giấy. Máy không có mắt nhìn cả bàn cờ: nó ',
        em('duyệt từng điểm một', 'var(--cyan)'),
        ', nuôi một "quán quân tạm thời" tên là min.',
      ),
    },
    {
      ops: [{ op: 'insert', afterId: 'loop-open', lines: [minInit, scanOpen, scanClose] }],
      highlight: ['min-init', 'scan-open'],
    },
    { pseudoStep: 1, graphScene: scThreeStates },
  ),
  ...need(
    {
      tone: 'need',
      text: t(
        'Nhưng chỉ xét những điểm "đang mở mà chưa chốt" — dịch theo bảng ghi chép: ',
        em('có cost', 'var(--cyan)'),
        ' (đã thấy) ',
        em('và chưa đóng dấu', 'var(--cyan)'),
        ' (chưa Visited).',
      ),
    },
    {
      ops: [{ op: 'insert', afterId: 'scan-open', lines: [scanIfOpen, scanIfClose] }],
      highlight: ['scan-if-open'],
    },
  ),
  ...need(
    {
      tone: 'need',
      text: t('Gặp ứng viên hợp lệ thì so: ai bé hơn "quán quân tạm thời" thì lên thay.'),
    },
    {
      ops: [{ op: 'insert', afterId: 'scan-if-open', lines: [minIfOpen, minSet, minIfClose] }],
      highlight: ['min-if-open', 'min-set'],
    },
    { graphScene: scMin },
  ),

  // ---- trả nợ placeholder 1
  ...need(
    {
      tone: 'insight',
      text: t(
        'Trả nợ mảnh giấy thứ nhất: "chốt hết" nghĩa là gì? Là quét xong một lượt mà ',
        em('chẳng chọn nổi điểm nào'),
        ' — min vẫn null. Mảnh giấy hóa thành code thật.',
      ),
    },
    {
      ops: [{ op: 'replace', targetId: 'ph-done', lines: [breakDone] }],
      highlight: ['break-done'],
    },
    { pseudoStep: 3 },
  ),

  // ---- trả nợ placeholder 2 — callout trỏ ngược màn sương
  ...need(
    {
      tone: 'insight',
      text: t(
        'Mảnh giấy thứ hai. Nhớ lúc ',
        em('thấy B=16 mà chưa dám dừng', 'var(--cyan)'),
        ' không? Chính là dòng này: chỉ dừng khi đích ',
        em('được CHỐT'),
        ' — tức là khi end được chọn làm min — chứ không phải khi vừa thoáng thấy nó.',
      ),
    },
    {
      ops: [{ op: 'replace', targetId: 'ph-found', lines: [breakFound] }],
      highlight: ['break-found'],
    },
    { graphScene: scSeeGoal },
  ),

  // ---- đóng dấu
  ...need(
    {
      tone: 'need',
      text: t('min sống sót qua hai cửa break — nó chính là điểm được chốt. ', em('Đóng dấu ✓.')),
    },
    { ops: [{ op: 'insert', afterId: 'break-found', lines: [lock] }], highlight: ['lock'] },
    { pseudoStep: 2, graphScene: scLockG },
  ),

  // ---- mở các điểm nối — đặt tên "đỉnh kề"
  ...need(
    {
      tone: 'need',
      text: t(
        'Câu ②: "mở các điểm ',
        em('nối với nó', 'var(--cyan)'),
        '". Danh sách đó nằm sẵn ở map[min]. Đặt cho gọn cái tên: ',
        em('đỉnh kề'),
        ' — "kề" nghĩa là nối trực tiếp.',
      ),
    },
    { ops: [{ op: 'insert', afterId: 'lock', lines: [nbOpen, nbClose] }], highlight: ['nb-open'] },
    { pseudoStep: 2 },
  ),

  // ---- newCost
  ...need(
    {
      tone: 'need',
      text: t(
        'Mở một điểm là ghi cho nó con số tạm: ',
        em('cost của min + chi phí đoạn nối', 'var(--cyan)'),
        '. Chi phí đoạn nối thì tra bảng hai nhịp: map[C] ra danh sách, hỏi tiếp ngăn D ra 12 — viết liền là ',
        em('map[C][D] = 12', 'var(--cyan)'),
        '. Y phép cộng trong sương: 4+12=16.',
      ),
    },
    { ops: [{ op: 'insert', afterId: 'nb-open', lines: [newCost] }], highlight: ['newcost'] },
    { graphScene: scRelax },
  ),

  // ---- ghi cost (ngây thơ)
  {
    callout: { tone: 'need', text: t('Rồi ghi vào ngăn tủ của nó.') },
    ops: [{ op: 'insert', afterId: 'newcost', lines: [setCost] }],
    highlight: ['setcost'],
  },

  // ---- khoảnh khắc đắt nhất: WRAP
  ...need(
    {
      tone: 'warn',
      text: t(
        em('Khoan!', 'var(--red)'),
        ' Có khi ngăn tủ đã có số ',
        em('tốt hơn'),
        ' rồi — nhớ B=16 mà ngả vòng qua D tính ra 20 chứ? Chỉ được ghi đè khi: ngăn còn ',
        em('trống', 'var(--cyan)'),
        ', hoặc số mới ',
        em('nhỏ hơn', 'var(--cyan)'),
        '. Bọc dòng vừa viết trong một điều kiện.',
      ),
    },
    {
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
    callout: {
      tone: 'insight',
      text: t(
        'Câu hỏi xét nét: lỡ nó "mở ngược" về A thì sao? Tính thử: 4+4=8 — chẳng nhỏ hơn 0. ',
        em('Điều kiện vừa viết lo hết'),
        '. Không cần thêm dòng nào.',
      ),
    },
    highlight: ['if-better-open'],
    graphScene: scBackToA,
  },

  // ---- return
  ...need(
    {
      tone: 'need',
      text: t(
        'Vòng lặp dừng nghĩa là đích đã chốt. Câu hỏi ban đầu — "độ dài ngắn nhất đến end?" — đáp án nằm sẵn trong ngăn tủ.',
      ),
    },
    { ops: [{ op: 'insert', afterId: 'loop-close', lines: [ret] }], highlight: ['ret'] },
    { graphScene: scFull, pseudoStep: null },
  ),

  // ---- tổng kết
  {
    callout: {
      tone: 'insight',
      text: t(
        'Nhìn lại cả trang: 25 dòng — mà thực chất chỉ là ',
        em('3 câu ta nói trong sương'),
        '. Code không phát minh điều gì mới; nó chép lại suy luận.',
      ),
    },
    graphScene: scFull,
    pseudoStep: null,
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
  // beat 0: code đầy đủ hiện sẵn (slide tắt typewriter ở beat này)
  {
    ops: [{ op: 'insert', afterId: null, lines: FULL_CODE }],
    callout: {
      tone: 'warn',
      text: t(
        'Cỗ máy chạy ngon… nhưng nó trả về ',
        em('con số 16'),
        ' — chứ chưa trả về ',
        em('con đường', 'var(--cyan)'),
        '. Biết giá chuyến đi mà không biết lối đi.',
      ),
    },
    graphScene: scFull,
    pseudoStep: null,
  },
  {
    callout: {
      tone: 'need',
      text: t(
        'Cách nghĩ đầu tiên ai cũng nghĩ: mỗi điểm lưu ',
        em('nguyên cả lộ trình'),
        ' đến nó.',
      ),
    },
    aside: 'pathFull',
  },
  {
    callout: {
      tone: 'warn',
      text: t(
        'Nhưng nhìn kỹ hai dãy bên phải: lộ trình của B ',
        em('chứa nguyên', 'var(--red)'),
        ' lộ trình của E, chỉ thêm đúng một bước cuối. Điểm nào cũng vậy — ta đang chép đi chép lại cùng một đoạn.',
      ),
    },
    aside: 'pathWaste',
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Vậy mỗi điểm chỉ cần nhớ ',
        em('MỘT bước'),
        ': "đến đây theo đường ngắn nhất thì bước ngay trước là từ đâu?" Muốn cả con đường? Lần ngược là ra.',
      ),
    },
    aside: 'prevChain',
  },
  ...need(
    { tone: 'need', text: t('Thêm một ngăn tủ cho "bước ngay trước".') },
    {
      ops: [{ op: 'insert', afterId: 'vis-decl', lines: [prevDecl] }],
      highlight: ['prev-decl'],
    },
  ),
  {
    callout: {
      tone: 'need',
      text: t(
        'Ghi Prev lúc nào? Bước-ngay-trước đổi ',
        em('đúng lúc'),
        ' ta tìm được đường ngắn hơn — tức là đúng chỗ đang ghi đè cost. Một chỗ duy nhất.',
      ),
    },
    highlight: ['if-better-open', 'setcost', 'if-better-close'],
  },
  {
    callout: {
      tone: 'need',
      text: t('Thêm đúng một dòng, ngay cạnh chỗ ghi cost.'),
    },
    ops: [{ op: 'insert', afterId: 'setcost', lines: [prevSet] }],
    highlight: ['prev-set'],
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Và đổi câu trả lời: thay vì một con số, trả về cả ',
        em('tấm bản đồ-bước-ngược'),
        ' — ai cần đường nào, lần ngược ra đường đó.',
      ),
    },
    ops: [{ op: 'morph', targetId: 'ret', text: 'return Prev   // lần ngược từ end ra cả con đường' }],
    highlight: ['ret'],
  },
  {
    callout: {
      tone: 'insight',
      text: t(
        'Xong phần xây. Tiếp theo: cho cỗ máy ',
        em('chạy thật', 'var(--cyan)'),
        ' — từng dòng, từng nhịp, soi từng ngăn tủ.',
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
