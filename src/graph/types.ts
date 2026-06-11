export type NodeId = string

export type GraphNodeDef = { id: NodeId; label?: string }
export type GraphEdgeDef = {
  id: string
  from: NodeId
  to: NodeId
  weight: number
  /** Chỉ Phần 5 dùng cạnh có hướng (mũi tên). */
  directed?: boolean
}
export type GraphData = { nodes: GraphNodeDef[]; edges: GraphEdgeDef[] }

export type NodeVisualState =
  | 'hidden'
  | 'idle'
  | 'fogged' // bóng mờ trong silhouette — thấy dạng, không thấy chi tiết
  | 'frontier' // đang mở: viền cyan đứt
  | 'locked' // đã chốt: vàng + ✓
  | 'current' // đang xét: halo pulse
  | 'onPath' // thuộc đường đi cuối
  | 'dimmed'

export type EdgeVisualState =
  | 'hidden'
  | 'idle'
  | 'active' // nhấn mạnh cyan
  | 'pruned' // bị cắt nhánh
  | 'onPath' // đường đi cuối: gradient + marching ants
  | 'hypothetical' // nét đứt đỏ — giả định
  | 'relaxing' // 2 đoạn sáng khi đang relax
  | 'dimmed'

/** Cạnh KHÔNG tồn tại trong đồ thị — vẽ giả định "biết đâu có đường...". */
export type GhostEdge = {
  id: string
  from: NodeId
  to: NodeId
  label?: string
  /** vị trí nhãn dọc đoạn (0..1, mặc định 0.5) — né va chạm với badge khác */
  labelT?: number
}

/** Mũi tên phụ thuộc (S3Dependencies): "from cần to trước đã". */
export type DepArrowDef = {
  from: NodeId
  to: NodeId
  /** mờ đi (giữ mạng nhện cũ làm nền khi hội tụ về A) */
  dim?: boolean
  /** lật phía cong (vẽ 2 mũi tên ngược chiều cùng cặp đỉnh không đè nhau) */
  flip?: boolean
}

export type MathOverlayDef = {
  at: NodeId
  text: string
  tone?: 'better' | 'worse' | 'info'
  dx?: number
  dy?: number
}

export type GraphSceneState = {
  variant: 'map' | 'abstract'
  nodeStates: Record<NodeId, NodeVisualState>
  edgeStates: Record<string, EdgeVisualState>
  /** Chip cost ở góc đỉnh. undefined = không có chip; null = chip ghost rỗng. */
  costs?: Record<NodeId, number | null>
  /** Hiện trọng số trên các cạnh không bị ẩn. */
  weights?: boolean
  /** Chế độ sương: chỉ render quanh các đỉnh đã lộ — không góc nhìn thượng đế. */
  fog?: { revealed: NodeId[] }
  ghostEdges?: GhostEdge[]
  depArrows?: { arrows: DepArrowDef[]; reversed?: boolean }
  /** Đường giả định "lẻn qua vùng tối" (cut property). */
  phantom?: { points: [number, number][]; crossAt?: [number, number]; label?: string }
  mathOverlays?: MathOverlayDef[]
  traveler?: { route: NodeId[]; runId: string }
}

export function sceneBase(over: Partial<GraphSceneState> = {}): GraphSceneState {
  return { variant: 'abstract', nodeStates: {}, edgeStates: {}, ...over }
}
