import type { GraphData } from '../graph/types'
import type { LayoutMap } from '../graph/layouts'

/**
 * Đồ thị "thành phố 12 ngã tư" cho cảnh bùng nổ tổ hợp.
 * Dày cạnh có chủ đích — số đường đơn S→T phải đủ lớn để gây choáng
 * (con số hiển thị là số THẬT, đếm bằng enumeratePaths).
 */
export const bigGraph: GraphData = {
  nodes: [
    { id: 'S' },
    { id: 'n1' },
    { id: 'n2' },
    { id: 'n3' },
    { id: 'n4' },
    { id: 'n5' },
    { id: 'n6' },
    { id: 'n7' },
    { id: 'n8' },
    { id: 'n9' },
    { id: 'n10' },
    { id: 'T' },
  ],
  edges: [
    { id: 'b1', from: 'S', to: 'n1', weight: 5 },
    { id: 'b2', from: 'S', to: 'n2', weight: 7 },
    { id: 'b3', from: 'S', to: 'n3', weight: 4 },
    { id: 'b4', from: 'n1', to: 'n2', weight: 3 },
    { id: 'b5', from: 'n2', to: 'n3', weight: 4 },
    { id: 'b6', from: 'n1', to: 'n4', weight: 6 },
    { id: 'b7', from: 'n2', to: 'n5', weight: 5 },
    { id: 'b8', from: 'n3', to: 'n6', weight: 7 },
    { id: 'b9', from: 'n4', to: 'n5', weight: 4 },
    { id: 'b10', from: 'n5', to: 'n6', weight: 3 },
    { id: 'b11', from: 'n4', to: 'n7', weight: 5 },
    { id: 'b12', from: 'n5', to: 'n8', weight: 6 },
    { id: 'b13', from: 'n6', to: 'n9', weight: 4 },
    { id: 'b14', from: 'n7', to: 'n8', weight: 3 },
    { id: 'b15', from: 'n8', to: 'n9', weight: 5 },
    { id: 'b16', from: 'n7', to: 'n10', weight: 6 },
    { id: 'b17', from: 'n8', to: 'n10', weight: 4 },
    { id: 'b18', from: 'n9', to: 'T', weight: 6 },
    { id: 'b19', from: 'n10', to: 'T', weight: 5 },
    { id: 'b20', from: 'n8', to: 'T', weight: 9 },
    { id: 'b21', from: 'n2', to: 'n4', weight: 6 },
    { id: 'b22', from: 'n6', to: 'n8', weight: 5 },
    { id: 'b23', from: 'n3', to: 'n5', weight: 6 },
    { id: 'b24', from: 'n9', to: 'n10', weight: 3 },
  ],
}

export const bigLayout: LayoutMap = {
  S: { x: 250, y: 560 },
  n1: { x: 560, y: 260 },
  n2: { x: 600, y: 560 },
  n3: { x: 560, y: 860 },
  n4: { x: 900, y: 330 },
  n5: { x: 940, y: 600 },
  n6: { x: 900, y: 880 },
  n7: { x: 1240, y: 290 },
  n8: { x: 1280, y: 590 },
  n9: { x: 1240, y: 870 },
  n10: { x: 1520, y: 420 },
  T: { x: 1680, y: 620 },
}
