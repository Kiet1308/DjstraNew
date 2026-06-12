import type { GraphData, NodeId } from '../graph/types'

export type SimplePath = {
  nodes: NodeId[]
  /** chi phí cộng dồn tại từng đỉnh trên đường (prefix[0] = 0) */
  prefix: number[]
  cost: number
}

/** Liệt kê TOÀN BỘ đường đơn from→to (DFS) kèm chi phí cộng dồn. */
export function enumeratePaths(graph: GraphData, from: NodeId, to: NodeId): SimplePath[] {
  const adj = new Map<NodeId, { to: NodeId; w: number }[]>()
  for (const n of graph.nodes) adj.set(n.id, [])
  for (const e of graph.edges) {
    adj.get(e.from)!.push({ to: e.to, w: e.weight })
    if (!e.directed) adj.get(e.to)!.push({ to: e.from, w: e.weight })
  }

  const out: SimplePath[] = []
  const stack: NodeId[] = [from]
  const prefix: number[] = [0]
  const onPath = new Set<NodeId>([from])

  function dfs(at: NodeId, cost: number) {
    if (at === to) {
      out.push({ nodes: [...stack], prefix: [...prefix], cost })
      return
    }
    for (const { to: nxt, w } of adj.get(at)!) {
      if (onPath.has(nxt)) continue
      onPath.add(nxt)
      stack.push(nxt)
      prefix.push(cost + w)
      dfs(nxt, cost + w)
      stack.pop()
      prefix.pop()
      onPath.delete(nxt)
    }
  }

  dfs(from, 0)
  return out
}

/**
 * Mô phỏng thử-tất-cả CÓ cắt nhánh, theo đúng thứ tự duyệt:
 * đang đi mà chi phí cộng dồn ≥ kỷ lục hiện tại → cắt ngay tại đó.
 * Trả về số liệu THẬT cho slide pruning.
 */
export function simulatePruning(paths: SimplePath[]): {
  total: number
  cutEarly: number
  walkedFull: number
  best: number
} {
  let best = Infinity
  let cutEarly = 0
  let walkedFull = 0
  for (const p of paths) {
    const cutAt = p.prefix.findIndex((c) => c >= best)
    if (cutAt >= 0) {
      cutEarly++
    } else {
      walkedFull++
      if (p.cost < best) best = p.cost
    }
  }
  return { total: paths.length, cutEarly, walkedFull, best }
}

export type SnipEvent = {
  /** tiền tố chung tính đến ĐIỂM CẮT (phần tử cuối = điểm cắt) */
  prefix: NodeId[]
  /** chi phí cộng dồn tại điểm cắt */
  prefixCost: number
  /** kỷ lục tạm thời lúc cắt */
  bestAtTime: number
  /** các đoạn tương lai chưa thử bị giết theo — mỗi mảng bắt đầu TỪ điểm cắt */
  suffixes: NodeId[][]
}

/**
 * Gom các tuyến bị cắt LIÊN TIẾP chung một chỗ cắt thành "nhát kéo" —
 * mỗi nhát giết cả một chùm tuyến tương lai chưa kịp thử.
 * Số liệu THẬT cho cảnh "một nhát cắt = cả chùm" của S2Pruning.
 */
export function computeSnipEvents(paths: SimplePath[]): {
  events: SnipEvent[]
  walkedFull: number
  biggest: SnipEvent
} {
  let best = Infinity
  let walkedFull = 0
  const events: SnipEvent[] = []
  let curKey: string | null = null
  for (const p of paths) {
    const cutAt = p.prefix.findIndex((c) => c >= best)
    if (cutAt >= 0) {
      const key = p.nodes.slice(0, cutAt + 1).join('>')
      if (key !== curKey) {
        curKey = key
        events.push({
          prefix: p.nodes.slice(0, cutAt + 1),
          prefixCost: p.prefix[cutAt],
          bestAtTime: best,
          suffixes: [],
        })
      }
      events[events.length - 1].suffixes.push(p.nodes.slice(cutAt))
    } else {
      walkedFull++
      if (p.cost < best) best = p.cost
      curKey = null
    }
  }
  if (events.length === 0) {
    throw new Error('computeSnipEvents: không có nhát cắt nào — đồ thị/kịch bản đổi?')
  }
  let biggest = events[0]
  for (const e of events) {
    if (e.suffixes.length > biggest.suffixes.length) biggest = e
  }
  return { events, walkedFull, biggest }
}
