import type { DeckAction, SharedNav } from '../deck/types'

/**
 * Giao thức phòng — sao hình ngôi sao, host là chân lý:
 *   khách ──action──▶ host ──state──▶ mọi khách
 * `event` là kênh phụ cho hiệu ứng tức thời trong slide (vd. phản ví dụ
 * click sai ở Phần 3) — host nhận rồi phát lại cho các khách còn lại.
 */
export type WireMsg =
  | { t: 'state'; s: SharedNav }
  | { t: 'action'; a: DeckAction }
  | { t: 'count'; n: number }
  // Host đã bấm "Bắt đầu trình chiếu" chưa — khách vào sớm thì chờ ở màn
  // đợi, không bị thả vào deck để lỡ tay bấm "đốt" trước gate tương tác.
  | { t: 'begun'; v: boolean }
  | { t: 'event'; name: string; payload: unknown }
  // Heartbeat: WebRTC không báo đứt dây kịp thời khi tab kia tắt/mất mạng,
  // nên hai đầu tự bắt mạch nhau.
  | { t: 'ping' }
  | { t: 'pong' }

/** Tin RoomProvider đẩy xuống DeckProvider để dispatch. */
export type DeckSinkMsg = { t: 'state'; s: SharedNav } | { t: 'action'; a: DeckAction }

/** Khóa sessionStorage: nhớ mã phòng theo tab để refresh giữa buổi mở lại đúng phòng. */
export const SESSION_CODE_KEY = 'tdnn-room-code'
export const SESSION_JOIN_KEY = 'tdnn-join-code'

/** Prefix dài + riêng để mã 6 số không đụng peer khác trên broker công cộng. */
const PEER_PREFIX = 'tdnn-dijkstra-v1-'

export function peerIdOf(code: string) {
  return PEER_PREFIX + code
}

export function randomCode() {
  return String(Math.floor(Math.random() * 900000) + 100000)
}

export function isValidCode(s: string) {
  return /^\d{6}$/.test(s)
}

/** Chỉ cho host chạy action điều hướng từ khách — chặn rác từ mạng. */
export function sanitizeRemoteAction(a: unknown): DeckAction | null {
  if (typeof a !== 'object' || a === null) return null
  const t = (a as { type?: unknown }).type
  if (t === 'NEXT' || t === 'PREV' || t === 'RESOLVE_GATE' || t === 'REARM_GATE') {
    return { type: t }
  }
  if (t === 'GOTO') {
    const { slideIndex, beat } = a as { slideIndex?: unknown; beat?: unknown }
    if (typeof slideIndex !== 'number' || !Number.isFinite(slideIndex)) return null
    return {
      type: 'GOTO',
      slideIndex: Math.floor(slideIndex),
      beat: typeof beat === 'number' && Number.isFinite(beat) ? Math.floor(beat) : undefined,
    }
  }
  return null
}

export function isSharedNav(s: unknown): s is SharedNav {
  if (typeof s !== 'object' || s === null) return false
  const o = s as Record<string, unknown>
  return (
    typeof o.slideIndex === 'number' &&
    typeof o.beat === 'number' &&
    (o.direction === 1 || o.direction === -1) &&
    typeof o.nudge === 'number' &&
    typeof o.resolvedGates === 'object' &&
    o.resolvedGates !== null
  )
}
