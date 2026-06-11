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
