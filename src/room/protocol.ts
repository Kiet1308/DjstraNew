import type { DeckAction, SharedNav } from '../deck/types'

/**
 * Giao thức phòng — relay WebSocket tự host (server/room-server.mjs trên
 * VPS, cùng origin với site), host là chân lý:
 *   khách ──action──▶ server ──▶ host ──state──▶ server ──▶ mọi khách
 * Server chỉ chuyển tin + nhớ state mới nhất/cờ begun cho khách vào sau,
 * và tự đếm người. `event` là kênh phụ cho hiệu ứng tức thời trong slide
 * (vd. phản ví dụ click sai ở Phần 3) — server lan cho cả phòng.
 */
export type WireMsg =
  | { t: 'state'; s: SharedNav }
  | { t: 'action'; a: DeckAction }
  | { t: 'count'; n: number }
  // Host đã bấm "Bắt đầu trình chiếu" chưa — khách vào sớm thì chờ ở màn
  // đợi, không bị thả vào deck để lỡ tay bấm "đốt" trước gate tương tác.
  | { t: 'begun'; v: boolean }
  | { t: 'event'; name: string; payload: unknown }
  // Heartbeat mức ứng dụng: phát hiện dây chết xuyên qua proxy/NAT,
  // đồng thời giữ kết nối khỏi bị nginx cắt vì idle.
  | { t: 'ping' }
  | { t: 'pong' }

/** Tin server trả riêng cho client (ngoài WireMsg được relay). */
export type ServerMsg =
  | WireMsg
  | { t: 'hosted' }
  | { t: 'taken' }
  | { t: 'joined'; begun: boolean; count: number }
  | { t: 'no-room' }
  | { t: 'host-gone' }
  | { t: 'host-back' }

/** Tin RoomProvider đẩy xuống DeckProvider để dispatch. */
export type DeckSinkMsg = { t: 'state'; s: SharedNav } | { t: 'action'; a: DeckAction }

/** Khóa sessionStorage: nhớ mã phòng theo tab để refresh giữa buổi mở lại đúng phòng. */
export const SESSION_CODE_KEY = 'tdnn-room-code'
export const SESSION_JOIN_KEY = 'tdnn-join-code'
const SESSION_TOKEN_KEY = 'tdnn-host-token'

/** Token chính chủ theo tab: host đổi mạng để rơi socket zombie trên server,
    quay lại với cùng token là server đá xác cũ nhận host mới ngay. */
export function hostToken(): string {
  let t = sessionStorage.getItem(SESSION_TOKEN_KEY)
  if (!t) {
    t = crypto.randomUUID()
    sessionStorage.setItem(SESSION_TOKEN_KEY, t)
  }
  return t
}

/** Cùng origin với site — nginx proxy /room về room-server, dev/preview
    dùng proxy của vite (vite.config.ts). CSP chỉ cần connect-src 'self'. */
export function roomServerUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/room`
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
