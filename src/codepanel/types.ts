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

/** Hình phụ ở cột phải — bảng tra map, mảng Path thừa, chuỗi Prev. */
export type CodeAside = 'mapTable' | 'pathFull' | 'pathWaste' | 'prevChain'

export type CodeBeat = {
  callout?: { text: ReactNode; tone: CodeCalloutTone }
  ops?: CodeOp[]
  /** id các dòng được rọi sáng ở beat này */
  highlight?: string[]
  /** cảnh đồ thị mini bên phải */
  graphScene?: GraphSceneState
  /** câu pseudocode (1|2|3) đang được dịch — pin checklist sáng câu đó */
  pseudoStep?: 1 | 2 | 3 | null
  aside?: CodeAside
}

export type CodeState = {
  lines: CodeLine[]
  highlight: Set<string>
  /** dòng mới sinh ra TẠI beat hiện tại (gõ máy chữ khi đi xuôi) */
  freshIds: Set<string>
  /** dòng vừa morph text tại beat hiện tại */
  morphedIds: Set<string>
  pseudoStep: 1 | 2 | 3 | null
  graphScene?: GraphSceneState
  callout?: CodeBeat['callout']
  /** beat đầu của "chuỗi callout giống nhau" (need→ops dùng chung lời) —
      key cho AnimatePresence để lời không nháy lại giữa 2 beat */
  calloutKey: number
  aside?: CodeAside
}

/** Helper khai báo dòng — chuẩn hóa NFC ngay từ nguồn. */
export function L(id: string, text: string, indent = 0, kind: CodeLineKind = 'code'): CodeLine {
  return { id, text: text.normalize('NFC'), indent, kind }
}
