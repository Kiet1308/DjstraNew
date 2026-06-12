import type { ComponentType } from 'react'

export type SectionId = 1 | 2 | 3 | 4 | 5

export type SlideProps = {
  /** Nhịp hiện tại của slide — slide render thuần túy từ số này. */
  beat: number
  /** 1 = đang tiến, -1 = đang lùi (để chọn hướng animation). */
  direction: 1 | -1
  /** Gate tại beat hiện tại đã được resolve chưa (true nếu beat không phải gate). */
  gateResolved: boolean
  /** Slide gọi khi người xem tương tác đúng để mở khóa gate. */
  resolveGate: () => void
  /** Tăng mỗi lần presenter bấm NEXT khi gate còn khóa — dùng để pulse gợi ý. */
  nudge: number
}

export type SlideDef = {
  id: string
  /** Nhãn trung tính hiện trên HUD/Overview — không spoiler. */
  title: string
  section: SectionId
  beats: number
  /** Các beat cần tương tác mới đi tiếp được. */
  gateBeats?: number[]
  /** Hint hiện ở HUD khi NEXT bị chặn — slide trước beat morph phải tự cấp
      chữ không dùng "đỉnh/đồ thị" (quy tắc thuật ngữ). */
  gateHint?: string
  component: ComponentType<SlideProps>
}

export type DeckState = {
  slideIndex: number
  beat: number
  direction: 1 | -1
  /** key = `${slideId}:${beat}` — bền vững trong phiên. */
  resolvedGates: Record<string, true>
  /** Đếm số lần NEXT bị chặn tại gate hiện tại — reset khi đổi beat. */
  nudge: number
  overviewOpen: boolean
}

/** Phần state điều hướng được đồng bộ qua phòng — KHÔNG gồm overviewOpen (cục bộ mỗi máy). */
export type SharedNav = Pick<
  DeckState,
  'slideIndex' | 'beat' | 'direction' | 'resolvedGates' | 'nudge'
>

export type DeckAction =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GOTO'; slideIndex: number; beat?: number }
  | { type: 'RESOLVE_GATE' }
  | { type: 'REARM_GATE' }
  | { type: 'SET_OVERVIEW'; open: boolean }
  /** Ghi đè phần điều hướng bằng state từ host phòng (khách nhận qua mạng). */
  | { type: 'SYNC'; shared: SharedNav }

/** Action điều hướng chung cả phòng — khách chuyển cho host thay vì tự chạy. */
export function isSharedAction(a: DeckAction): boolean {
  return (
    a.type === 'NEXT' ||
    a.type === 'PREV' ||
    a.type === 'GOTO' ||
    a.type === 'RESOLVE_GATE' ||
    a.type === 'REARM_GATE'
  )
}

export function gateKey(slideId: string, beat: number) {
  return `${slideId}:${beat}`
}
