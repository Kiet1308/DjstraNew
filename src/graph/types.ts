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
  /** tầng đã hỏi xong — còn đọc được nhưng nhường sân khấu (0.45) */
  soft?: boolean
  /** stagger trong-beat (giây) — slide tự ép 0 khi đi lùi */
  delay?: number
  /** lật phía cong (vẽ 2 mũi tên ngược chiều cùng cặp đỉnh không đè nhau) */
  flip?: boolean
}

/** Mũi tên "tôi đến từ đây" (S4Prev): cắm ở node, chỉ về điểm ngay trước. */
export type PrevArrowDef = {
  node: NodeId
  from: NodeId
  /** đang được hỏi trong màn truy ngược — sáng + dày hơn */
  flare?: boolean
}

export type MathOverlayDef = {
  at: NodeId
  text: string
  tone?: 'better' | 'worse' | 'info'
  dx?: number
  dy?: number
}

/** Con trỏ quét tìm min (Phần 4): vòng sáng chạy dọc route, dừng ở đỉnh cuối.
    runId đổi → quét lại từ đầu. tone 'lock' = đỉnh vừa được chốt (amber). */
export type ProbeDef = {
  route: NodeId[]
  runId: string
  tone?: 'scan' | 'lock'
}

/** Thẻ "min" nổi: neo trên một đỉnh, có dây nối xuống — thẻ chỉ nhảy sang đỉnh
    khác khi đỉnh đó rẻ hơn. tone: keep=giữ (green) · warn=cảnh báo (amber) · lose. */
export type MinHolderDef = {
  node: NodeId
  value: number | string
  tone?: 'keep' | 'warn' | 'lose'
  /** tag phụ dưới thẻ: "A đã chốt rồi?!", "2 < 4 · giữ"… */
  note?: string
}

/** Gói chi phí trượt dọc cạnh from→to mang theo phép tính ("4+12=16"). */
export type CostPacketDef = {
  id: string
  from: NodeId
  to: NodeId
  label: string
  tone?: 'better' | 'worse' | 'info'
}

/** Bảng quyết định Cost[at]: cửa vào → cổng so sánh → ô đang giữ.
    Mỗi phase = một tiểu-cảnh (bấm "Tiếp"): ô trống → nhận số → ứng viên thứ hai
    → (CÁI SAI) ghi đè → (BẢN VÁ) cổng chặn bật ngược. */
export type DecisionDef = {
  at: NodeId
  phase: 'empty' | 'receive' | 'second' | 'overwrite' | 'gate'
  /** số ô đang giữ (null = trống) */
  held?: number | null
  /** số ứng viên mới đang gõ cửa */
  incoming?: number
  runId: string
}

export type GraphSceneState = {
  variant: 'map' | 'abstract'
  nodeStates: Record<NodeId, NodeVisualState>
  edgeStates: Record<string, EdgeVisualState>
  /** Chip cost ở góc đỉnh. undefined = không có chip; null = chip ghost rỗng;
      '?' = chip ghost CÓ dấu hỏi (chưa biết, nhưng nói thẳng ra — vẫn TUYỆT ĐỐI KHÔNG ∞). */
  costs?: Record<NodeId, number | '?' | null>
  /** Hiện trọng số trên các cạnh không bị ẩn. */
  weights?: boolean
  /** Chế độ sương: chỉ render quanh các đỉnh đã lộ — không góc nhìn thượng đế. */
  fog?: { revealed: NodeId[] }
  ghostEdges?: GhostEdge[]
  depArrows?: { arrows: DepArrowDef[]; reversed?: boolean }
  /** Cây mũi tên "tôi đến từ đây" — Phần 4 (Prev). */
  prevArrows?: PrevArrowDef[]
  /** Flash badge cost theo KỊCH BẢN (rewind-an-toàn): worse = ghi đè xấu (đỏ). */
  costFlash?: Record<NodeId, 'worse' | 'better'>
  /** Gadget Phần 4 — đều scene-driven (rewind = đổi props), xem types ở trên. */
  probe?: ProbeDef
  minHolder?: MinHolderDef
  packets?: CostPacketDef[]
  decision?: DecisionDef
  /** Đường giả định "lẻn qua vùng tối" (cut property). */
  phantom?: { points: [number, number][]; crossAt?: [number, number]; label?: string }
  mathOverlays?: MathOverlayDef[]
  traveler?: { route: NodeId[]; runId: string }
}

export function sceneBase(over: Partial<GraphSceneState> = {}): GraphSceneState {
  return { variant: 'abstract', nodeStates: {}, edgeStates: {}, ...over }
}
