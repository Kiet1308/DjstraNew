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
import type { DataConnection, Peer } from 'peerjs'
import type { DeckAction, SharedNav } from '../deck/types'
import {
  isSharedNav,
  isValidCode,
  peerIdOf,
  randomCode,
  sanitizeRemoteAction,
  SESSION_CODE_KEY,
  SESSION_JOIN_KEY,
  type DeckSinkMsg,
  type WireMsg,
} from './protocol'

/**
 * Phòng điều khiển chung qua PeerJS (WebRTC, broker công cộng — không cần
 * server riêng). Host giữ state chân lý; khách gửi action lên host, host
 * broadcast state về. Vào phòng = mã 6 số.
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
      /** Mã cũ kẹt trên broker, phòng phải mở bằng mã MỚI — host cần được báo to. */
      codeChanged: boolean
    }
  | {
      phase: 'guest'
      code: string
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
  /** Deck báo state điều hướng mới nhất — host broadcast cho cả phòng. */
  publishShared: (s: SharedNav) => void
  /** Deck đăng ký nhận tin từ phòng (SYNC cho khách, action cho host). */
  setDeckSink: (cb: (m: DeckSinkMsg) => void) => () => void
  /** Hiệu ứng tức thời trong slide — chạy local rồi lan ra cả phòng. */
  emitEvent: (name: string, payload: unknown) => void
  onEvent: (name: string, cb: (payload: unknown) => void) => () => void
}

const JOIN_TIMEOUT_MS = 14_000
const REDIAL_WATCHDOG_MS = 10_000
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

const RoomContext = createContext<RoomApi | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoomState>(initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const peerRef = useRef<Peer | null>(null)
  const connsRef = useRef<Map<string, DataConnection>>(new Map()) // host: khách đang nối
  const hostConnRef = useRef<DataConnection | null>(null) // khách: dây lên host
  const sharedRef = useRef<SharedNav | null>(null)
  const sinkRef = useRef<((m: DeckSinkMsg) => void) | null>(null)
  const eventsRef = useRef<Map<string, Set<(payload: unknown) => void>>>(new Map())
  const timersRef = useRef<number[]>([])
  const intervalsRef = useRef<number[]>([])
  // Nhịp tim: lần cuối nghe thấy đầu dây bên kia (host: theo connectionId).
  const lastSeenRef = useRef<Map<string, number>>(new Map())
  // Khách chỉ giữ MỘT lịch quay số lại — conn close lẫn peer error cùng đòi
  // retry thì cũng không được sinh hai vòng dial song song.
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
    hostConnRef.current = null
    connsRef.current.clear()
    lastSeenRef.current.clear()
    peerRef.current?.destroy()
    peerRef.current = null
  }, [])

  useEffect(() => teardown, [teardown])

  const deliverEvent = useCallback((name: string, payload: unknown) => {
    const handlers = eventsRef.current.get(name)
    if (handlers) for (const h of [...handlers]) h(payload)
  }, [])

  const safeSend = (conn: DataConnection, msg: WireMsg) => {
    try {
      conn.send(msg)
    } catch {
      /* dây vừa đứt — vòng reconnect/close tự xử lý */
    }
  }

  const hostBroadcast = useCallback((msg: WireMsg, except?: string) => {
    for (const [id, conn] of connsRef.current) {
      if (id !== except) safeSend(conn, msg)
    }
  }, [])

  const hostCount = () => connsRef.current.size + 1

  /* ---------------- HOST ---------------- */

  const wireGuestConn = useCallback(
    (conn: DataConnection, gen: number) => {
      let heartbeat = 0
      const drop = () => {
        window.clearInterval(heartbeat)
        if (gen !== genRef.current) return
        if (!connsRef.current.delete(conn.connectionId)) return
        lastSeenRef.current.delete(conn.connectionId)
        hostBroadcast({ t: 'count', n: hostCount() })
        setState((s) => (s.phase === 'host' ? { ...s, count: hostCount() } : s))
      }
      conn.on('open', () => {
        if (gen !== genRef.current) return conn.close()
        connsRef.current.set(conn.connectionId, conn)
        lastSeenRef.current.set(conn.connectionId, Date.now())
        if (sharedRef.current) safeSend(conn, { t: 'state', s: sharedRef.current })
        safeSend(conn, {
          t: 'begun',
          v: stateRef.current.phase === 'host' && stateRef.current.entered,
        })
        hostBroadcast({ t: 'count', n: hostCount() })
        setState((s) => (s.phase === 'host' ? { ...s, count: hostCount() } : s))
        // Khách tắt tab/mất mạng mà WebRTC im lặng → tự bắt mạch mà loại.
        // (Chỉ arm sau khi conn open — ICE chậm không bị giết oan.)
        heartbeat = window.setInterval(() => {
          if (gen !== genRef.current || !connsRef.current.has(conn.connectionId)) {
            window.clearInterval(heartbeat)
            return
          }
          const seen = lastSeenRef.current.get(conn.connectionId) ?? 0
          if (Date.now() - seen > DEAD_AFTER_MS) {
            conn.close()
            drop()
          } else {
            safeSend(conn, { t: 'ping' })
          }
        }, HEARTBEAT_MS)
        intervalsRef.current.push(heartbeat)
      })
      conn.on('data', (raw) => {
        if (gen !== genRef.current) return
        lastSeenRef.current.set(conn.connectionId, Date.now())
        const msg = raw as WireMsg
        if (msg?.t === 'action') {
          const a = sanitizeRemoteAction(msg.a)
          if (a) sinkRef.current?.({ t: 'action', a })
        } else if (msg?.t === 'event' && typeof msg.name === 'string') {
          deliverEvent(msg.name, msg.payload)
          hostBroadcast(msg, conn.connectionId)
        } else if (msg?.t === 'ping') {
          safeSend(conn, { t: 'pong' })
        }
      })
      conn.on('close', drop)
      conn.on('error', drop)
    },
    [deliverEvent, hostBroadcast],
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
      void import('peerjs').then(({ Peer }) => {
        if (gen !== genRef.current) return
        const peer = new Peer(peerIdOf(code))
        peerRef.current = peer
        peer.on('open', () => {
          if (gen !== genRef.current) return
          sessionStorage.setItem(SESSION_CODE_KEY, code)
          setState({
            phase: 'host',
            code,
            entered: false,
            count: 1,
            // Hứa "mở lại phòng cũ" mà mã lại khác → phải báo to cho host.
            codeChanged: storedCode !== null && code !== storedCode,
          })
        })
        peer.on('connection', (conn) => wireGuestConn(conn, gen))
        // Rớt dây tới broker (không ảnh hưởng khách đã nối) — nối lại để
        // khách MỚI vẫn vào được phòng.
        peer.on('disconnected', () => {
          if (gen === genRef.current && !peer.destroyed) peer.reconnect()
        })
        peer.on('error', (err) => {
          if (gen !== genRef.current) return
          const type = (err as { type?: string }).type
          if (type === 'unavailable-id') {
            // Mã còn kẹt trên broker (vd. vừa refresh) — đợi rồi thử lại,
            // hết kiên nhẫn thì đổi mã mới.
            peer.destroy()
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
          } else if (stateRef.current.phase !== 'host') {
            peer.destroy()
            setState({
              phase: 'lobby',
              pending: null,
              error: {
                kind: 'create',
                msg: 'Không kết nối được — kiểm tra mạng rồi thử lại.',
              },
            })
          }
        })
      })
    }

    attempt(firstCode, 3, 2)
  }, [teardown, wireGuestConn])

  /* ---------------- KHÁCH ---------------- */

  const dialHost = useCallback(
    (code: string, gen: number, reconnecting: boolean) => {
      if (gen !== genRef.current) return
      void import('peerjs').then(({ Peer }) => {
        if (gen !== genRef.current) return
        peerRef.current?.destroy()
        const peer = new Peer()
        peerRef.current = peer

        const retry = () => {
          if (gen !== genRef.current) return
          if (stateRef.current.phase !== 'guest' && reconnecting) return
          if (retryPendingRef.current) return
          retryPendingRef.current = true
          later(RECONNECT_EVERY_MS, () => {
            retryPendingRef.current = false
            dialHost(code, gen, true)
          })
        }
        const failJoin = (msg: string) => {
          peer.destroy()
          setState({ phase: 'lobby', pending: null, error: { kind: 'join', msg } })
        }

        if (!reconnecting) {
          later(JOIN_TIMEOUT_MS, () => {
            if (gen !== genRef.current) return
            if (stateRef.current.phase === 'lobby') {
              failJoin('Kết nối quá lâu — kiểm tra mạng rồi thử lại.')
            }
          })
        }

        peer.on('open', () => {
          if (gen !== genRef.current) return
          const conn = peer.connect(peerIdOf(code), { reliable: true })
          hostConnRef.current = conn
          let lastSeen = Date.now()
          let heartbeat = 0
          let opened = false

          // Host rớt/refresh — bám phòng chờ host quay lại (idempotent:
          // close event lẫn heartbeat đều có thể gọi).
          let degraded = false
          const degrade = () => {
            window.clearInterval(heartbeat)
            if (degraded || gen !== genRef.current) return
            degraded = true
            setState((s) => (s.phase === 'guest' ? { ...s, link: 'reconnecting' } : s))
            retry()
          }

          // Quay số lại có thể rơi vào "xác" đăng ký cũ của host trên broker:
          // không error, không close, không gì cả. Watchdog tự đập đi gọi lại.
          if (reconnecting) {
            later(REDIAL_WATCHDOG_MS, () => {
              if (gen !== genRef.current || opened) return
              peer.destroy()
              retry()
            })
          }

          conn.on('open', () => {
            if (gen !== genRef.current) return
            opened = true
            lastSeen = Date.now()
            sessionStorage.setItem(SESSION_JOIN_KEY, code)
            // begun giữ nguyên qua lần nối lại — host sẽ gửi giá trị thật ngay.
            setState((s) => ({
              phase: 'guest',
              code,
              link: 'on',
              count: s.phase === 'guest' ? s.count : 2,
              begun: s.phase === 'guest' ? s.begun : false,
            }))
            heartbeat = window.setInterval(() => {
              if (gen !== genRef.current) {
                window.clearInterval(heartbeat)
                return
              }
              if (Date.now() - lastSeen > DEAD_AFTER_MS) {
                conn.close()
                degrade()
              } else {
                safeSend(conn, { t: 'ping' })
              }
            }, HEARTBEAT_MS)
            intervalsRef.current.push(heartbeat)
          })
          conn.on('data', (raw) => {
            if (gen !== genRef.current) return
            lastSeen = Date.now()
            const msg = raw as WireMsg
            if (msg?.t === 'state' && isSharedNav(msg.s)) {
              sinkRef.current?.({ t: 'state', s: msg.s })
            } else if (msg?.t === 'count' && typeof msg.n === 'number') {
              setState((s) => (s.phase === 'guest' ? { ...s, count: msg.n } : s))
            } else if (msg?.t === 'begun') {
              setState((s) => (s.phase === 'guest' ? { ...s, begun: msg.v === true } : s))
            } else if (msg?.t === 'event' && typeof msg.name === 'string') {
              deliverEvent(msg.name, msg.payload)
            } else if (msg?.t === 'ping') {
              safeSend(conn, { t: 'pong' })
            }
          })
          conn.on('close', degrade)
        })
        peer.on('error', (err) => {
          if (gen !== genRef.current) return
          const type = (err as { type?: string }).type
          if (reconnecting || stateRef.current.phase === 'guest') {
            peer.destroy()
            retry()
          } else if (type === 'peer-unavailable') {
            failJoin(
              `Không thấy phòng ${code}. Kiểm tra lại mã — hoặc nhờ người tạo phòng mở phòng rồi vào lại.`,
            )
          } else {
            failJoin('Không kết nối được — kiểm tra mạng rồi thử lại.')
          }
        })
      })
    },
    [deliverEvent],
  )

  const joinRoom = useCallback(
    (code: string) => {
      if (stateRef.current.phase !== 'lobby' || !isValidCode(code)) return
      teardown()
      const gen = genRef.current
      setState({ phase: 'lobby', pending: { kind: 'join', code }, error: null })
      dialHost(code, gen, false)
    },
    [teardown, dialHost],
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
    hostBroadcast({ t: 'begun', v: true })
    setState((s) => (s.phase === 'host' ? { ...s, entered: true } : s))
  }, [hostBroadcast])

  const clearError = useCallback(() => {
    setState((s) => (s.phase === 'lobby' ? { ...s, error: null } : s))
  }, [])

  const sendAction = useCallback((a: DeckAction) => {
    const conn = hostConnRef.current
    if (conn?.open) safeSend(conn, { t: 'action', a })
  }, [])

  const publishShared = useCallback((s: SharedNav) => {
    sharedRef.current = s
    if (stateRef.current.phase === 'host') hostBroadcast({ t: 'state', s })
  }, [hostBroadcast])

  const setDeckSink = useCallback((cb: (m: DeckSinkMsg) => void) => {
    sinkRef.current = cb
    return () => {
      if (sinkRef.current === cb) sinkRef.current = null
    }
  }, [])

  const emitEvent = useCallback(
    (name: string, payload: unknown) => {
      deliverEvent(name, payload)
      const msg: WireMsg = { t: 'event', name, payload }
      const phase = stateRef.current.phase
      if (phase === 'host') hostBroadcast(msg)
      else if (phase === 'guest' && hostConnRef.current?.open) {
        safeSend(hostConnRef.current, msg)
      }
    },
    [deliverEvent, hostBroadcast],
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
