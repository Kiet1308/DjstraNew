import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { DeckAction, SharedNav } from '../deck/types'
import {
  hostToken,
  isSharedNav,
  isValidCode,
  randomCode,
  roomServerUrl,
  sanitizeRemoteAction,
  SESSION_CODE_KEY,
  SESSION_JOIN_KEY,
  type DeckSinkMsg,
  type ServerMsg,
  type WireMsg,
} from './protocol'

/**
 * Phòng điều khiển chung qua relay WebSocket TỰ HOST (server/room-server.mjs
 * trên VPS, cùng origin — không bên trung gian). Host giữ state chân lý;
 * khách gửi action, server chuyển cho host, host broadcast state về.
 * Vào phòng = mã 6 số.
 */
export type RoomState =
  | {
      phase: 'lobby'
      pending: { kind: 'create' | 'join'; code: string } | null
      error: { kind: 'create' | 'join'; msg: string } | null
    }
  | { phase: 'offline' }
  | {
      phase: 'host'
      code: string
      entered: boolean
      count: number
      /** Mã cũ còn host sống giữ trên server, phòng phải mở bằng mã MỚI — báo to. */
      codeChanged: boolean
      /** Rớt dây tới server — đang tự nối lại, khách tạm không nghe thấy mình. */
      link: 'on' | 'reconnecting'
    }
  | {
      phase: 'guest'
      code: string
      /** reconnecting = đứt dây HOẶC host vắng mặt — đều là "đang nối lại". */
      link: 'on' | 'reconnecting'
      count: number
      /** Host đã bấm bắt đầu chưa — chưa thì khách đứng ở màn chờ. */
      begun: boolean
    }

type RoomApi = {
  state: RoomState
  createRoom: () => void
  joinRoom: (code: string) => void
  goOffline: () => void
  /** Về màn hình đầu, rời phòng nếu đang trong phòng. */
  leaveRoom: () => void
  /** Host bấm "Bắt đầu trình chiếu" từ màn hình mã phòng. */
  enterDeck: () => void
  clearError: () => void
  /** Khách chuyển action điều hướng lên host. */
  sendAction: (a: DeckAction) => void
  /** Deck báo state điều hướng mới nhất — host phát cho cả phòng. */
  publishShared: (s: SharedNav) => void
  /** Deck đăng ký nhận tin từ phòng (SYNC cho khách, action cho host). */
  setDeckSink: (cb: (m: DeckSinkMsg) => void) => () => void
  /** Hiệu ứng tức thời trong slide — chạy local rồi lan ra cả phòng. */
  emitEvent: (name: string, payload: unknown) => void
  onEvent: (name: string, cb: (payload: unknown) => void) => () => void
}

const JOIN_TIMEOUT_MS = 14_000
const DIAL_WATCHDOG_MS = 10_000
const RETRY_SAME_CODE_MS = 1500
const RECONNECT_EVERY_MS = 3000
const HEARTBEAT_MS = 5000
const DEAD_AFTER_MS = 15_000

function initialState(): RoomState {
  if (new URLSearchParams(window.location.search).has('offline')) {
    return { phase: 'offline' }
  }
  return { phase: 'lobby', pending: null, error: null }
}

function parseMsg(e: MessageEvent): ServerMsg | null {
  try {
    const m = JSON.parse(String(e.data)) as ServerMsg
    return m && typeof m.t === 'string' ? m : null
  } catch {
    return null
  }
}

const RoomContext = createContext<RoomApi | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoomState>(initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const wsRef = useRef<WebSocket | null>(null)
  const sharedRef = useRef<SharedNav | null>(null)
  const sinkRef = useRef<((m: DeckSinkMsg) => void) | null>(null)
  const eventsRef = useRef<Map<string, Set<(payload: unknown) => void>>>(new Map())
  const timersRef = useRef<number[]>([])
  const intervalsRef = useRef<number[]>([])
  // Chỉ giữ MỘT lịch quay số lại — nhiều đường cùng đòi retry (đứt dây,
  // watchdog, no-room) cũng không sinh hai vòng dial song song.
  const retryPendingRef = useRef(false)
  // Mỗi lần tạo/vào/rời phòng tăng gen — callback async cũ tự thấy mình hết hạn.
  const genRef = useRef(0)

  const clearTimers = () => {
    for (const t of timersRef.current) window.clearTimeout(t)
    for (const t of intervalsRef.current) window.clearInterval(t)
    timersRef.current = []
    intervalsRef.current = []
  }
  const later = (ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }

  const teardown = useCallback(() => {
    genRef.current++
    clearTimers()
    retryPendingRef.current = false
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  useEffect(() => teardown, [teardown])

  const deliverEvent = useCallback((name: string, payload: unknown) => {
    const handlers = eventsRef.current.get(name)
    if (handlers) for (const h of [...handlers]) h(payload)
  }, [])

  const sendMsg = (
    ws: WebSocket | null,
    msg: WireMsg | { t: 'host'; code: string; token: string } | { t: 'join'; code: string },
  ) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      /* dây vừa đứt — onclose tự xử lý */
    }
  }

  /** Bắt mạch: server im quá lâu (proxy treo, mất mạng) → tự cắt cho onclose lo. */
  const armHeartbeat = (ws: WebSocket, gen: number, touch: { last: number }) => {
    const hb = window.setInterval(() => {
      if (gen !== genRef.current || wsRef.current !== ws) {
        window.clearInterval(hb)
        return
      }
      if (Date.now() - touch.last > DEAD_AFTER_MS) {
        ws.close()
      } else {
        sendMsg(ws, { t: 'ping' })
      }
    }, HEARTBEAT_MS)
    intervalsRef.current.push(hb)
  }

  /* ---------------- HOST ---------------- */

  /** Dây host sau khi server xác nhận 'hosted' — dùng chung cho tạo mới lẫn nối lại. */
  const wireHostSocket = useCallback(
    (ws: WebSocket, code: string, gen: number, reclaim: () => void) => {
      wsRef.current = ws
      const touch = { last: Date.now() }
      armHeartbeat(ws, gen, touch)
      // Server có thể đang giữ cờ begun/state cũ (host vừa refresh) —
      // host luôn tự xưng lại trạng thái thật của mình.
      const entered = stateRef.current.phase === 'host' && stateRef.current.entered
      sendMsg(ws, { t: 'begun', v: entered })
      if (sharedRef.current) sendMsg(ws, { t: 'state', s: sharedRef.current })

      ws.onmessage = (e) => {
        if (gen !== genRef.current) return ws.close()
        touch.last = Date.now()
        const msg = parseMsg(e)
        if (!msg) return
        if (msg.t === 'action') {
          const a = sanitizeRemoteAction(msg.a)
          if (a) sinkRef.current?.({ t: 'action', a })
        } else if (msg.t === 'event' && typeof msg.name === 'string') {
          deliverEvent(msg.name, msg.payload)
        } else if (msg.t === 'count' && typeof msg.n === 'number') {
          setState((s) => (s.phase === 'host' ? { ...s, count: msg.n } : s))
        }
      }
      ws.onclose = () => {
        if (gen !== genRef.current || wsRef.current !== ws) return
        setState((s) => (s.phase === 'host' ? { ...s, link: 'reconnecting' } : s))
        reclaim()
      }
      void code
    },
    [deliverEvent],
  )

  /** Vòng nối lại của host: đòi lại đúng mã phòng cũ trên server. */
  const hostReclaim = useCallback(
    (code: string, gen: number) => {
      const schedule = () => {
        if (gen !== genRef.current || stateRef.current.phase !== 'host') return
        if (retryPendingRef.current) return
        retryPendingRef.current = true
        later(RECONNECT_EVERY_MS, () => {
          retryPendingRef.current = false
          dial()
        })
      }
      const dial = () => {
        if (gen !== genRef.current || stateRef.current.phase !== 'host') return
        const ws = new WebSocket(roomServerUrl())
        let settled = false
        later(DIAL_WATCHDOG_MS, () => {
          if (!settled) ws.close()
        })
        ws.onopen = () => {
          // Gen hết hạn (user đã rời/đổi phòng) → đóng ngay kẻo thành
          // socket ma chiếm phòng trên server.
          if (gen !== genRef.current) return ws.close()
          sendMsg(ws, { t: 'host', code, token: hostToken() })
        }
        ws.onmessage = (e) => {
          if (gen !== genRef.current) return ws.close()
          const msg = parseMsg(e)
          if (msg?.t === 'hosted') {
            settled = true
            setState((s) => (s.phase === 'host' ? { ...s, link: 'on' } : s))
            wireHostSocket(ws, code, gen, () => hostReclaim(code, gen))
          } else if (msg?.t === 'taken') {
            // Mã đang bị host khác (token lạ) giữ — đợi rồi thử tiếp.
            settled = true
            ws.close()
            schedule()
          }
        }
        ws.onclose = () => {
          if (gen !== genRef.current || settled) return
          schedule()
        }
      }
      schedule()
    },
    [wireHostSocket],
  )

  const createRoom = useCallback(() => {
    if (stateRef.current.phase !== 'lobby') return
    teardown()
    const gen = genRef.current
    // Refresh giữa buổi: dùng lại mã cũ để khách tự nối lại được.
    const storedCode = sessionStorage.getItem(SESSION_CODE_KEY)
    const firstCode = storedCode ?? randomCode()

    const attempt = (code: string, sameCodeTries: number, freshCodeTries: number) => {
      if (gen !== genRef.current) return
      setState({ phase: 'lobby', pending: { kind: 'create', code }, error: null })
      const ws = new WebSocket(roomServerUrl())
      let settled = false
      const fail = (msg: string) => {
        settled = true
        ws.close()
        setState({ phase: 'lobby', pending: null, error: { kind: 'create', msg } })
      }
      later(DIAL_WATCHDOG_MS, () => {
        if (gen === genRef.current && !settled) {
          fail('Không kết nối được — kiểm tra mạng rồi thử lại.')
        }
      })
      ws.onopen = () => {
        if (gen !== genRef.current) return ws.close()
        sendMsg(ws, { t: 'host', code, token: hostToken() })
      }
      ws.onmessage = (e) => {
        if (gen !== genRef.current) return ws.close()
        const msg = parseMsg(e)
        if (msg?.t === 'hosted') {
          settled = true
          sessionStorage.setItem(SESSION_CODE_KEY, code)
          setState({
            phase: 'host',
            code,
            entered: false,
            count: 1,
            // Hứa "mở lại phòng cũ" mà mã lại khác → phải báo to cho host.
            codeChanged: storedCode !== null && code !== storedCode,
            link: 'on',
          })
          wireHostSocket(ws, code, gen, () => hostReclaim(code, gen))
        } else if (msg?.t === 'taken') {
          // Mã đang có host sống giữ (vd. tab cũ chưa bị sweeper dọn) —
          // đợi rồi thử lại, hết kiên nhẫn thì đổi mã mới.
          settled = true
          ws.close()
          if (sameCodeTries > 0) {
            later(RETRY_SAME_CODE_MS, () => attempt(code, sameCodeTries - 1, freshCodeTries))
          } else if (freshCodeTries > 0) {
            attempt(randomCode(), 0, freshCodeTries - 1)
          } else {
            setState({
              phase: 'lobby',
              pending: null,
              error: { kind: 'create', msg: 'Không tạo được phòng — thử lại sau ít giây.' },
            })
          }
        }
      }
      ws.onclose = () => {
        if (gen !== genRef.current || settled) return
        fail('Không kết nối được — kiểm tra mạng rồi thử lại.')
      }
    }

    attempt(firstCode, 3, 2)
  }, [teardown, wireHostSocket, hostReclaim])

  /* ---------------- KHÁCH ---------------- */

  const dialGuest = useCallback(
    (code: string, gen: number, reconnecting: boolean) => {
      if (gen !== genRef.current) return
      const schedule = () => {
        if (gen !== genRef.current) return
        if (retryPendingRef.current) return
        retryPendingRef.current = true
        later(RECONNECT_EVERY_MS, () => {
          retryPendingRef.current = false
          dialGuest(code, gen, true)
        })
      }
      const failJoin = (msg: string) => {
        setState({ phase: 'lobby', pending: null, error: { kind: 'join', msg } })
      }

      const ws = new WebSocket(roomServerUrl())
      let joined = false
      let settled = false // đã có kết cục (joined / fail / chủ động retry)

      if (reconnecting) {
        later(DIAL_WATCHDOG_MS, () => {
          if (gen === genRef.current && !settled) ws.close()
        })
      } else {
        later(JOIN_TIMEOUT_MS, () => {
          if (gen !== genRef.current || settled) return
          settled = true
          ws.close()
          failJoin('Kết nối quá lâu — kiểm tra mạng rồi thử lại.')
        })
      }

      ws.onopen = () => {
        if (gen !== genRef.current) return ws.close()
        sendMsg(ws, { t: 'join', code })
      }
      const touch = { last: Date.now() }
      ws.onmessage = (e) => {
        if (gen !== genRef.current) return ws.close()
        touch.last = Date.now()
        const msg = parseMsg(e)
        if (!msg) return
        if (!joined) {
          if (msg.t === 'joined') {
            joined = true
            settled = true
            wsRef.current = ws
            sessionStorage.setItem(SESSION_JOIN_KEY, code)
            setState({
              phase: 'guest',
              code,
              link: 'on',
              count: typeof msg.count === 'number' ? msg.count : 2,
              begun: msg.begun === true,
            })
            armHeartbeat(ws, gen, touch)
          } else if (msg.t === 'no-room') {
            settled = true
            ws.close()
            if (reconnecting) {
              schedule() // host chưa quay lại — bám phòng chờ tiếp
            } else {
              failJoin(
                `Không thấy phòng ${code}. Kiểm tra lại mã — hoặc nhờ người tạo phòng mở phòng rồi vào lại.`,
              )
            }
          }
          return
        }
        if (msg.t === 'state' && isSharedNav(msg.s)) {
          sinkRef.current?.({ t: 'state', s: msg.s })
        } else if (msg.t === 'count' && typeof msg.n === 'number') {
          setState((s) => (s.phase === 'guest' ? { ...s, count: msg.n } : s))
        } else if (msg.t === 'begun') {
          setState((s) => (s.phase === 'guest' ? { ...s, begun: msg.v === true } : s))
        } else if (msg.t === 'event' && typeof msg.name === 'string') {
          deliverEvent(msg.name, msg.payload)
        } else if (msg.t === 'host-gone') {
          // Host vắng mặt nhưng dây tới server vẫn sống — chỉ đổi nhãn,
          // KHÔNG quay số lại; server sẽ báo host-back.
          setState((s) => (s.phase === 'guest' ? { ...s, link: 'reconnecting' } : s))
        } else if (msg.t === 'host-back') {
          setState((s) => (s.phase === 'guest' ? { ...s, link: 'on' } : s))
        }
      }
      ws.onclose = () => {
        if (gen !== genRef.current) return
        if (joined) {
          if (wsRef.current === ws) wsRef.current = null
          setState((s) => (s.phase === 'guest' ? { ...s, link: 'reconnecting' } : s))
          schedule()
        } else if (reconnecting && !settled) {
          schedule()
        } else if (!settled) {
          settled = true
          failJoin('Không kết nối được — kiểm tra mạng rồi thử lại.')
        }
      }
    },
    [deliverEvent],
  )

  const joinRoom = useCallback(
    (code: string) => {
      if (stateRef.current.phase !== 'lobby' || !isValidCode(code)) return
      teardown()
      const gen = genRef.current
      setState({ phase: 'lobby', pending: { kind: 'join', code }, error: null })
      dialGuest(code, gen, false)
    },
    [teardown, dialGuest],
  )

  /* ---------------- API chung ---------------- */

  const goOffline = useCallback(() => {
    teardown()
    setState({ phase: 'offline' })
  }, [teardown])

  const leaveRoom = useCallback(() => {
    teardown()
    setState({ phase: 'lobby', pending: null, error: null })
  }, [teardown])

  const enterDeck = useCallback(() => {
    if (stateRef.current.phase !== 'host') return
    sendMsg(wsRef.current, { t: 'begun', v: true })
    setState((s) => (s.phase === 'host' ? { ...s, entered: true } : s))
  }, [])

  const clearError = useCallback(() => {
    setState((s) => (s.phase === 'lobby' ? { ...s, error: null } : s))
  }, [])

  const sendAction = useCallback((a: DeckAction) => {
    if (stateRef.current.phase === 'guest') sendMsg(wsRef.current, { t: 'action', a })
  }, [])

  const publishShared = useCallback((s: SharedNav) => {
    sharedRef.current = s
    if (stateRef.current.phase === 'host') sendMsg(wsRef.current, { t: 'state', s })
  }, [])

  const setDeckSink = useCallback((cb: (m: DeckSinkMsg) => void) => {
    sinkRef.current = cb
    return () => {
      if (sinkRef.current === cb) sinkRef.current = null
    }
  }, [])

  const emitEvent = useCallback(
    (name: string, payload: unknown) => {
      deliverEvent(name, payload)
      const phase = stateRef.current.phase
      if (phase === 'host' || phase === 'guest') {
        sendMsg(wsRef.current, { t: 'event', name, payload })
      }
    },
    [deliverEvent],
  )

  const onEvent = useCallback((name: string, cb: (payload: unknown) => void) => {
    let set = eventsRef.current.get(name)
    if (!set) {
      set = new Set()
      eventsRef.current.set(name, set)
    }
    set.add(cb)
    return () => {
      set.delete(cb)
    }
  }, [])

  const api = useMemo<RoomApi>(
    () => ({
      state,
      createRoom,
      joinRoom,
      goOffline,
      leaveRoom,
      enterDeck,
      clearError,
      sendAction,
      publishShared,
      setDeckSink,
      emitEvent,
      onEvent,
    }),
    [
      state,
      createRoom,
      joinRoom,
      goOffline,
      leaveRoom,
      enterDeck,
      clearError,
      sendAction,
      publishShared,
      setDeckSink,
      emitEvent,
      onEvent,
    ],
  )

  return <RoomContext.Provider value={api}>{children}</RoomContext.Provider>
}

export function useRoom(): RoomApi {
  const api = useContext(RoomContext)
  if (!api) throw new Error('useRoom ngoài RoomProvider')
  return api
}

/** Đăng ký nghe event phòng — handler mới nhất luôn được gọi, không re-subscribe. */
export function useRoomEvent<T>(name: string, handler: (payload: T) => void) {
  const { onEvent } = useRoom()
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => onEvent(name, (p) => ref.current(p as T)), [onEvent, name])
}
