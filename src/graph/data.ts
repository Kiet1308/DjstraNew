import type { GraphData } from './types'

/**
 * Đồ thị mẫu dùng xuyên suốt Phần 1→4 (đã verify chạy tay):
 * chốt C=4 → G=6 → E=10 → D=14 → B=16; đường cuối A→C→E→B = 16.
 * Relax D: 18 → 16 (qua C) → 14 (qua E). Khi chốt D: 14+6=20 > 16 → B giữ nguyên.
 */
export const cityGraph: GraphData = {
  nodes: [
    { id: 'A' },
    { id: 'C' },
    { id: 'G' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' },
    { id: 'H' },
    { id: 'B' },
  ],
  edges: [
    { id: 'AC', from: 'A', to: 'C', weight: 4 },
    { id: 'AG', from: 'A', to: 'G', weight: 6 },
    { id: 'AD', from: 'A', to: 'D', weight: 18 },
    { id: 'CD', from: 'C', to: 'D', weight: 12 },
    { id: 'CE', from: 'C', to: 'E', weight: 6 },
    { id: 'ED', from: 'E', to: 'D', weight: 4 },
    { id: 'EB', from: 'E', to: 'B', weight: 6 },
    { id: 'DB', from: 'D', to: 'B', weight: 6 },
    { id: 'GF', from: 'G', to: 'F', weight: 12 },
    { id: 'GH', from: 'G', to: 'H', weight: 14 },
    { id: 'FB', from: 'F', to: 'B', weight: 4 },
  ],
}

/** Đồ thị mini CÓ HƯỚNG cho cạnh âm (Phần 5). */
export const negGraph: GraphData = {
  nodes: [{ id: 'X' }, { id: 'Y' }, { id: 'Z' }],
  edges: [
    { id: 'XY', from: 'X', to: 'Y', weight: 2, directed: true },
    { id: 'XZ', from: 'X', to: 'Z', weight: 3, directed: true },
    { id: 'ZY', from: 'Z', to: 'Y', weight: -4, directed: true },
  ],
}
