import { cityGraph } from '../graph/data'
import { sceneBase, type GraphSceneState, type NodeId } from '../graph/types'

/**
 * Chạy THẬT thuật toán trên cityGraph (A→B) với instrument — mỗi câu lệnh
 * đáng nói đẩy ra một TraceFrame snapshot ĐẦY ĐỦ → tua lùi an toàn.
 * Diễn tiến phải khớp tính tay: chốt C=4→G=6→E=10→D=14→B=16;
 * D: 18→16→14; khi chốt D thì B không đổi (14+6=20 > 16).
 */

export type TraceVars = {
  cost: Record<string, number | null>
  visited: Record<string, boolean>
  prev: Record<string, string | null>
  min: string | null
}

export type TraceFrame = {
  lineId: string
  scene: GraphSceneState
  vars: TraceVars
  note?: string
}

const NODES = cityGraph.nodes.map((n) => n.id)
const START: NodeId = 'A'
const END: NodeId = 'B'

type Adj = Record<string, { to: NodeId; w: number; edgeId: string }[]>
const adj: Adj = {}
for (const n of NODES) adj[n] = []
for (const e of cityGraph.edges) {
  adj[e.from].push({ to: e.to, w: e.weight, edgeId: e.id })
  adj[e.to].push({ to: e.from, w: e.weight, edgeId: e.id })
}

function snapshotVars(
  cost: Record<string, number | null>,
  visited: Record<string, boolean>,
  prev: Record<string, string | null>,
  min: string | null,
): TraceVars {
  return { cost: { ...cost }, visited: { ...visited }, prev: { ...prev }, min }
}

function makeScene(
  cost: Record<string, number | null>,
  visited: Record<string, boolean>,
  min: string | null,
  extra: {
    relax?: { nb: NodeId; improved: boolean; fresh: boolean; text: string }
    pathEdges?: string[]
    pathNodes?: NodeId[]
  } = {},
): GraphSceneState {
  const revealed = NODES.filter((id) => cost[id] !== null)
  const nodeStates: GraphSceneState['nodeStates'] = {}
  for (const id of NODES) {
    if (extra.pathNodes?.includes(id)) nodeStates[id] = 'onPath'
    else if (id === min && !visited[id]) nodeStates[id] = 'current'
    else if (visited[id]) nodeStates[id] = 'locked'
    else if (cost[id] !== null) nodeStates[id] = 'frontier'
  }
  if (min && visited[min] && !extra.pathNodes) nodeStates[min] = 'current'

  // cạnh đã biết = chạm vào ít nhất một đỉnh đã chốt (đúng mô hình "mở từ đỉnh chốt")
  const edgeStates: GraphSceneState['edgeStates'] = {}
  for (const e of cityGraph.edges) {
    const known = visited[e.from] || visited[e.to]
    edgeStates[e.id] = known ? 'idle' : 'hidden'
  }
  if (extra.relax) {
    const re = cityGraph.edges.find(
      (e) =>
        (e.from === min && e.to === extra.relax!.nb) ||
        (e.to === min && e.from === extra.relax!.nb),
    )
    if (re) edgeStates[re.id] = extra.relax.improved || extra.relax.fresh ? 'relaxing' : 'active'
  }
  for (const id of extra.pathEdges ?? []) edgeStates[id] = 'onPath'

  const costs: Record<string, number | null> = {}
  for (const id of revealed) costs[id] = cost[id]

  return sceneBase({
    fog: { revealed },
    nodeStates,
    edgeStates,
    weights: true,
    costs,
    mathOverlays: extra.relax
      ? [
          {
            at: extra.relax.nb,
            text: extra.relax.text,
            tone: extra.relax.improved ? 'better' : extra.relax.fresh ? 'info' : 'worse',
            dx: extra.relax.nb === 'D' ? -240 : 0,
            dy: extra.relax.nb === 'D' ? 40 : -118,
          },
        ]
      : undefined,
  })
}

function buildTrace(): TraceFrame[] {
  const frames: TraceFrame[] = []
  const cost: Record<string, number | null> = {}
  const visited: Record<string, boolean> = {}
  const prev: Record<string, string | null> = {}
  for (const id of NODES) {
    cost[id] = null
    visited[id] = false
    prev[id] = null
  }

  cost[START] = 0
  frames.push({
    lineId: 'start-zero',
    scene: makeScene(cost, visited, null),
    vars: snapshotVars(cost, visited, prev, null),
    note: 'Cost[start] = 0 — ý "xuất phát từ A" nằm gọn trong một dòng. Nhờ nó, A sẽ tự động là điểm chốt đầu tiên.',
  })

  let iter = 0
  while (true) {
    // quét tìm min trong các điểm đang mở
    let min: string | null = null
    for (const đỉnh of NODES) {
      if (cost[đỉnh] !== null && !visited[đỉnh]) {
        if (min === null || cost[đỉnh]! < cost[min]!) min = đỉnh
      }
    }
    if (min === null) break

    // ngoại hóa phép SO SÁNH: liệt kê cả frontier để thấy vì sao min thắng
    const frontierList = NODES.filter((id) => cost[id] !== null && !visited[id])
      .map((id) => `${id}=${cost[id]}`)
      .join(', ')
    frames.push({
      lineId: 'min-set',
      scene: makeScene(cost, visited, min),
      vars: snapshotVars(cost, visited, prev, min),
      note:
        iter === 0
          ? `Quét một lượt: chỉ A có cost → min = A. Điểm chốt đầu tiên, đúng như đã hứa.`
          : `Quét các điểm đang mở {${frontierList}} → ${min} bé nhất.`,
    })

    if (min === END) {
      frames.push({
        lineId: 'break-found',
        scene: makeScene(cost, visited, min),
        vars: snapshotVars(cost, visited, prev, min),
        note: 'min == end: ĐÍCH ĐƯỢC CHỐT → giờ mới dừng. (Không phải lúc vừa thoáng thấy B=16 — mà là lúc B thắng cuộc quét.)',
      })
      break
    }

    visited[min] = true
    frames.push({
      lineId: 'lock',
      scene: makeScene(cost, visited, min),
      vars: snapshotVars(cost, visited, prev, min),
      note: `Đóng dấu ✓ ${min} — xong hẳn, không bao giờ sửa nữa.`,
    })

    for (const { to: nb, w } of adj[min]) {
      const newCost = cost[min]! + w
      const old = cost[nb]
      const fresh = old === null
      const improved = !fresh && newCost < old!
      let text: string
      if (fresh) text = `${cost[min]}+${w}=${newCost} → ghi`
      else if (improved) text = `${cost[min]}+${w}=${newCost} < ${old} → sửa`
      else text = `${cost[min]}+${w}=${newCost} ≥ ${old} → giữ`

      if (fresh || improved) {
        cost[nb] = newCost
        prev[nb] = min
        frames.push({
          lineId: 'setcost',
          scene: makeScene(cost, visited, min, { relax: { nb, improved, fresh, text } }),
          vars: snapshotVars(cost, visited, prev, min),
          note: improved
            ? `Tìm được đường NGẮN HƠN đến ${nb} (qua ${min}) → sửa cost, sửa luôn Prev[${nb}] = ${min}.`
            : `Mở điểm mới ${nb}: ghi cost ${newCost}, nhớ điểm trước đó Prev[${nb}] = ${min}.`,
        })
      } else {
        frames.push({
          lineId: 'if-better-open',
          scene: makeScene(cost, visited, min, { relax: { nb, improved, fresh, text } }),
          vars: snapshotVars(cost, visited, prev, min),
          note: `${nb} đã có cost tốt hơn → điều kiện if chặn lại, không ghi đè. Nhánh "không làm gì" cũng là một quyết định.`,
        })
      }
    }
    iter++
  }

  // return Prev
  frames.push({
    lineId: 'ret',
    scene: makeScene(cost, visited, END),
    vars: snapshotVars(cost, visited, prev, END),
    note: 'Trả về Prev — bảng lưu điểm ngay trước của mỗi điểm đã thấy.',
  })

  // 3 frame cuối: trace ngược Prev từ B — quay lại cách nhìn ngược ở Phần 3
  const back: { node: NodeId; edge: string }[] = []
  let cur: NodeId = END
  while (prev[cur]) {
    const p = prev[cur]! as NodeId
    const e = cityGraph.edges.find(
      (x) => (x.from === p && x.to === cur) || (x.from === cur && x.to === p),
    )!
    back.push({ node: cur, edge: e.id })
    cur = p
  }
  // back = [{B,EB},{E,CE},{C,AC}] — thắp sáng dần từng đoạn
  const pathEdgesSoFar: string[] = []
  const pathNodesSoFar: NodeId[] = [END]
  for (const step of back) {
    pathEdgesSoFar.push(step.edge)
    const p = prev[step.node]! as NodeId
    pathNodesSoFar.push(p)
    frames.push({
      lineId: 'ret',
      scene: makeScene(cost, visited, null, {
        pathEdges: [...pathEdgesSoFar],
        pathNodes: [...pathNodesSoFar],
      }),
      vars: snapshotVars(cost, visited, prev, null),
      note: `Hỏi ngược: "trước ${step.node} là ai?" → Prev[${step.node}] = ${p}. Thắp sáng đoạn ${p}–${step.node}.`,
    })
  }
  frames.push({
    lineId: 'ret',
    scene: makeScene(cost, visited, null, {
      pathEdges: [...pathEdgesSoFar],
      pathNodes: [...pathNodesSoFar],
    }),
    vars: snapshotVars(cost, visited, prev, null),
    note: 'Lật ngược danh sách vừa lần ra: A → C → E → B = 16. Đúng với cách nhìn ngược ở Phần 3.',
  })

  return frames
}

export const TRACE: TraceFrame[] = buildTrace()

// Dev-check: diễn tiến phải khớp tính tay
if (import.meta.env.DEV) {
  const last = TRACE[TRACE.length - 1]
  if (last.vars.cost.B !== 16) throw new Error(`trace: Cost[B] = ${last.vars.cost.B}, kỳ vọng 16`)
  if (last.vars.cost.D !== 14) throw new Error(`trace: Cost[D] = ${last.vars.cost.D}, kỳ vọng 14`)
  if (last.vars.prev.B !== 'E' || last.vars.prev.E !== 'C' || last.vars.prev.C !== 'A') {
    throw new Error('trace: chuỗi Prev không ra A→C→E→B')
  }
}
