import type { ReactNode } from 'react'
import type { GraphSceneState } from '../graph/types'

export type CodeLineKind = 'code' | 'placeholder' | 'comment'

/** Một dòng code là DỮ LIỆU: id ổn định xuyên suốt kịch bản. */
export type CodeLine = {
  id: string
  text: string
  indent: number
  kind: CodeLineKind
}

export type CodeOp =
  | { op: 'insert'; afterId: string | null; lines: CodeLine[] } // null = chèn đầu
  | { op: 'replace'; targetId: string; lines: CodeLine[] }
  | { op: 'morph'; targetId: string; text: string }
  | { op: 'remove'; ids: string[] }
  /** Bọc if quanh dòng có sẵn: dòng cũ GIỮ NGUYÊN id, chỉ thụt vào. */
  | { op: 'wrap'; targetId: string; before: CodeLine; after: CodeLine; indentDelta: number }

export type CodeCalloutTone = 'need' | 'insight' | 'warn'

/** Hình phụ ở cột phải — bảng tra map, mảng Path mọc dần/phình to, chuỗi Prev. */
export type CodeAside =
  | 'stateTable'
  | 'mapTable'
  | 'costCabinet'
  | 'pathFull'
  | 'pathGrow'
  | 'pathExplode'
  | 'pathWaste'
  | 'prevChain'

export type CodeBeat = {
  callout?: { text: ReactNode; tone: CodeCalloutTone }
  ops?: CodeOp[]
  /** id các dòng được rọi sáng ở beat này */
  highlight?: string[]
  /** tông highlight — 'danger' = dòng đang gây họa (nền đỏ) */
  highlightTone?: 'danger'
  /** cảnh đồ thị mini bên phải */
  graphScene?: GraphSceneState
  /** câu pseudocode (1|2|3) đang được dịch — pin checklist sáng câu đó;
      'all' = thắp cả ba (beat tổng kết — chỉ dùng ở màn code, hàng dọc) */
  pseudoStep?: 1 | 2 | 3 | 'all' | null
  aside?: CodeAside
  /** Máy quay theo MÀN, không theo beat: focus DÍNH từ beat khai báo cho đến
      khi một beat khác khai báo lại. Trong một màn KHÔNG GÌ đổi kích thước —
      đổi focus là một cú chuyển cảnh có chủ đích, chỉ đặt ở ranh giới màn. */
  focus?: 'code' | 'visual'
}

export type CodeState = {
  lines: CodeLine[]
  highlight: Set<string>
  highlightTone?: 'danger'
  /** dòng mới sinh ra TẠI beat hiện tại (gõ máy chữ khi đi xuôi) */
  freshIds: Set<string>
  /** dòng vừa morph text tại beat hiện tại */
  morphedIds: Set<string>
  pseudoStep: 1 | 2 | 3 | 'all' | null
  graphScene?: GraphSceneState
  callout?: CodeBeat['callout']
  /** beat đầu của "chuỗi callout giống nhau" (need→ops dùng chung lời) —
      key cho AnimatePresence để lời không nháy lại giữa 2 beat */
  calloutKey: number
  aside?: CodeAside
  focus: 'code' | 'visual'
}

/** Helper khai báo dòng — chuẩn hóa NFC ngay từ nguồn. */
export function L(id: string, text: string, indent = 0, kind: CodeLineKind = 'code'): CodeLine {
  return { id, text: text.normalize('NFC'), indent, kind }
}
