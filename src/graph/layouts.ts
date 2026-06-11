import type { NodeId } from './types'

export type LayoutMap = Record<NodeId, { x: number; y: number }>

/**
 * Tọa độ tuyệt đối trên mặt phẳng 1920×1080.
 * Khoảng cách hình học chỉ cần ĐÚNG THỨ TỰ tương đối với trọng số
 * (A–D dài nhất, A–C ngắn) — con số mới là nguồn chân lý.
 */
export const abstractLayout: LayoutMap = {
  A: { x: 280, y: 540 },
  C: { x: 610, y: 330 },
  G: { x: 545, y: 815 },
  E: { x: 1070, y: 265 },
  D: { x: 1095, y: 610 },
  F: { x: 1230, y: 845 },
  H: { x: 880, y: 965 },
  B: { x: 1590, y: 480 },
}

/** Biến thể bản đồ thành phố: cùng đỉnh, vị trí hơi hữu cơ hơn. */
export const mapLayout: LayoutMap = {
  A: { x: 300, y: 565 },
  C: { x: 635, y: 300 },
  G: { x: 515, y: 840 },
  E: { x: 1045, y: 240 },
  D: { x: 1120, y: 635 },
  F: { x: 1255, y: 820 },
  H: { x: 850, y: 940 },
  B: { x: 1610, y: 455 },
}

export const layoutsByVariant = {
  abstract: abstractLayout,
  map: mapLayout,
} as const

/** Layout đồ thị mini có hướng Phần 5 (X trái, Y phải, Z dưới). */
export const negLayout: LayoutMap = {
  X: { x: 660, y: 460 },
  Y: { x: 1300, y: 460 },
  Z: { x: 980, y: 790 },
}
