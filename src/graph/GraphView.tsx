import { AnimatePresence } from 'motion/react'
import { useId, useMemo } from 'react'
import { layoutsByVariant, type LayoutMap } from './layouts'
import type {
  EdgeVisualState,
  GraphData,
  GraphSceneState,
  NodeId,
  NodeVisualState,
} from './types'
import { GraphEdge } from './GraphEdge'
import { GraphNode } from './GraphNode'
import { CostBadge } from './CostBadge'
import { FogMaskContent, FogAtmosphere } from './FogLayer'
import { SvgIdsContext, type SvgIds } from './svgIds'
import {
  ChaosRays,
  DepArrow,
  GhostEdgeView,
  MathOverlayChip,
  PhantomPath,
} from './decorations'

/** Dev-only: bắt typo id trong scene trước khi lên sóng. */
function assertSceneIds(graph: GraphData, layout: LayoutMap, scene: GraphSceneState) {
  const nodeIds = new Set(graph.nodes.map((n) => n.id))
  const edgeIds = new Set(graph.edges.map((e) => e.id))
  for (const id of Object.keys(scene.nodeStates)) {
    if (!nodeIds.has(id)) throw new Error(`scene.nodeStates: đỉnh lạ "${id}"`)
    if (!layout[id]) throw new Error(`layout thiếu đỉnh "${id}"`)
  }
  for (const id of Object.keys(scene.edgeStates)) {
    if (!edgeIds.has(id)) throw new Error(`scene.edgeStates: cạnh lạ "${id}"`)
  }
  for (const id of Object.keys(scene.costs ?? {})) {
    if (!nodeIds.has(id)) throw new Error(`scene.costs: đỉnh lạ "${id}"`)
  }
  for (const id of scene.fog?.revealed ?? []) {
    if (!nodeIds.has(id)) throw new Error(`scene.fog.revealed: đỉnh lạ "${id}"`)
  }
}

/**
 * Đồ thị SVG fully-controlled: toàn bộ trạng thái đến từ `scene`, zero state.
 * Lùi beat = đổi props → hình lắng về đúng trạng thái cũ.
 */
export function GraphView({
  graph,
  scene,
  layouts = layoutsByVariant,
  clickable = [],
  onNodeClick,
  hintNodes = [],
  nodeSize = 34,
  chaosFrom,
  edgeDelays,
}: {
  graph: GraphData
  scene: GraphSceneState
  layouts?: { map: LayoutMap; abstract: LayoutMap }
  clickable?: NodeId[]
  onNodeClick?: (id: NodeId) => void
  hintNodes?: NodeId[]
  nodeSize?: number
  /** Vẽ chùm tia rối loạn tỏa từ một đỉnh (S3LookFromB beat động cơ). */
  chaosFrom?: NodeId
  /** Trễ animation đổi-trạng-thái theo cạnh — vd đường cuối lan ngược từ B. */
  edgeDelays?: Record<string, number>
}) {
  const layout = layouts[scene.variant]
  const fog = scene.fog
  const revealedSet = fog ? new Set(fog.revealed) : null

  if (import.meta.env.DEV) assertSceneIds(graph, layout, scene)

  const nodeVisible = (id: NodeId) => {
    const st = scene.nodeStates[id] ?? 'idle'
    if (st === 'hidden') return false
    if (revealedSet) return revealedSet.has(id)
    return true
  }
  const edgeVisible = (eid: string, from: NodeId, to: NodeId) => {
    const st = scene.edgeStates[eid] ?? 'idle'
    if (st === 'hidden') return false
    return nodeVisible(from) && nodeVisible(to)
  }

  // id <defs> namespace theo instance — 2 GraphView cùng trang không đụng nhau
  const uid = useId().replace(/:/g, '')
  const ids = useMemo<SvgIds>(
    () => ({
      pathGrad: `pathGrad-${uid}`,
      fogSoft: `fogSoft-${uid}`,
      depArrowHead: `depArrowHead-${uid}`,
      edgeArrowHead: `edgeArrowHead-${uid}`,
    }),
    [uid],
  )
  const maskId = `fog-${uid}`

  // hành lang sáng trong sương = đúng các cạnh ĐANG HIỂN THỊ (đã biết)
  const litEdges = fog
    ? graph.edges.filter((e) => edgeVisible(e.id, e.from, e.to))
    : []

  return (
    <SvgIdsContext.Provider value={ids}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <defs>
            <radialGradient id={ids.fogSoft}>
              <stop offset="55%" stopColor="white" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id={ids.pathGrad}
              gradientUnits="userSpaceOnUse"
              x1={layout.A?.x ?? 0}
              y1={layout.A?.y ?? 0}
              x2={layout.B?.x ?? 1920}
              y2={layout.B?.y ?? 1080}
            >
              <stop offset="0%" stopColor="var(--path-a)" />
              <stop offset="100%" stopColor="var(--path-b)" />
            </linearGradient>
            <marker
              id={ids.depArrowHead}
              viewBox="0 0 12 12"
              refX="9"
              refY="6"
              markerWidth="9"
              markerHeight="9"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--violet)" />
            </marker>
            <marker
              id={ids.edgeArrowHead}
              viewBox="0 0 12 12"
              refX="8"
              refY="6"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 1 1 L 11 6 L 1 11 z" fill="context-stroke" />
            </marker>
            {fog && (
              <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
                <FogMaskContent revealed={fog.revealed} layout={layout} litEdges={litEdges} />
              </mask>
            )}
          </defs>

          {/* Lớp cạnh — bị sương che theo mask khi fog bật */}
          <g mask={fog ? `url(#${maskId})` : undefined}>
            <AnimatePresence>
              {graph.edges.map((e) => {
                if (!edgeVisible(e.id, e.from, e.to)) return null
                const a = layout[e.from]
                const b = layout[e.to]
                return (
                  <GraphEdge
                    key={e.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    state={(scene.edgeStates[e.id] ?? 'idle') as Exclude<EdgeVisualState, 'hidden'>}
                    weight={e.weight}
                    showWeight={!!scene.weights}
                    directed={e.directed}
                    nodeRadius={nodeSize}
                    delay={edgeDelays?.[e.id] ?? 0}
                  />
                )
              })}
            </AnimatePresence>
          </g>

          {chaosFrom && layout[chaosFrom] && <ChaosRays from={layout[chaosFrom]} />}

          {/* Đường giả định + đường lẻn — phía trên cạnh thật */}
          <AnimatePresence>
            {scene.ghostEdges?.map((g) => (
              <GhostEdgeView key={g.id} ghost={g} layout={layout} />
            ))}
            {scene.phantom && (
              <PhantomPath
                key="phantom"
                points={scene.phantom.points}
                crossAt={scene.phantom.crossAt}
              />
            )}
          </AnimatePresence>

          {/* Đỉnh — đỉnh chưa lộ trong sương KHÔNG render: không góc nhìn thượng đế */}
          <AnimatePresence>
            {graph.nodes.map((n) => {
              if (!nodeVisible(n.id)) return null
              const p = layout[n.id]
              const st = scene.nodeStates[n.id] ?? 'idle'
              return (
                <GraphNode
                  key={n.id}
                  id={n.id}
                  x={p.x}
                  y={p.y}
                  state={st as Exclude<NodeVisualState, 'hidden'>}
                  variant={scene.variant}
                  clickable={clickable.includes(n.id)}
                  hinting={hintNodes.includes(n.id)}
                  onClick={onNodeClick}
                  size={nodeSize}
                />
              )
            })}
          </AnimatePresence>

          {/* Chip cost ở góc đỉnh */}
          <AnimatePresence>
            {scene.costs &&
              Object.entries(scene.costs).map(([id, v]) => {
                if (v === undefined || !nodeVisible(id)) return null
                const p = layout[id]
                const st = scene.nodeStates[id] ?? 'idle'
                return (
                  <CostBadge
                    key={id}
                    x={p.x}
                    y={p.y}
                    value={v}
                    nodeState={st as Exclude<NodeVisualState, 'hidden'>}
                    size={nodeSize}
                  />
                )
              })}
          </AnimatePresence>

          {/* Mũi tên phụ thuộc — trên cùng của lớp SVG */}
          <AnimatePresence>
            {scene.depArrows?.arrows.map((a) => (
              <DepArrow
                key={`${a.from}->${a.to}`}
                from={a.from}
                to={a.to}
                dim={a.dim}
                flip={a.flip}
                solid={scene.depArrows?.reversed}
                layout={layout}
                nodeRadius={nodeSize}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Lớp HTML: phép tính cạnh đỉnh */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <AnimatePresence>
            {scene.mathOverlays?.map((m) => (
              <MathOverlayChip key={`${m.at}:${m.text}`} overlay={m} layout={layout} />
            ))}
          </AnimatePresence>
        </div>

        {/* Khí quyển sương trôi */}
        <FogAtmosphere opacity={fog ? 1 : 0} />
      </div>
    </SvgIdsContext.Provider>
  )
}
