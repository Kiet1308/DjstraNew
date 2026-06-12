// Relay phòng điều khiển chung — tự host trên VPS, không bên trung gian.
// Chạy: ROOM_PORT=9100 node server/room-server.mjs   (mặc định 9100)
// Nginx proxy: location /room { proxy_pass http://127.0.0.1:9100; ... }
//
// Server CHỈ là tổng đài chuyển tin theo phòng — bộ não slide vẫn nằm ở
// trình duyệt của host (host-authoritative, xem src/room/protocol.ts):
//   khách ──action──▶ host ──state──▶ mọi khách
// Server nhớ thêm state mới nhất + cờ "đã bắt đầu" để khách vào sau
// nhận được ngay, và tự đếm người trong phòng.
import http from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const PORT = Number(process.env.ROOM_PORT ?? 9100)
// Mặc định chỉ nghe loopback — ra ngoài phải đi qua nginx (TLS/CSP).
const HOST = process.env.ROOM_HOST ?? '127.0.0.1'
const CODE_RE = /^\d{6}$/

/** @type {Map<string, {host: WebSocket|null, hostToken: string, guests: Map<number, WebSocket>, lastState: unknown, begun: boolean}>} */
const rooms = new Map()
let nextGuestId = 1

const alive = (ws) => ws && ws.readyState === WebSocket.OPEN

function send(ws, msg) {
  if (alive(ws)) ws.send(JSON.stringify(msg))
}

function countOf(room) {
  return room.guests.size + (alive(room.host) ? 1 : 0)
}

function broadcastGuests(room, msg, exceptGid = -1) {
  for (const [gid, g] of room.guests) if (gid !== exceptGid) send(g, msg)
}

function broadcastCount(room) {
  const msg = { t: 'count', n: countOf(room) }
  send(room.host, msg)
  broadcastGuests(room, msg)
}

function dropRoomIfEmpty(code, room) {
  if (!alive(room.host) && room.guests.size === 0) rooms.delete(code)
}

const server = http.createServer((req, res) => {
  if (req.url === '/room/health') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end(`ok ${rooms.size} phong`)
    return
  }
  res.writeHead(404)
  res.end()
})

// maxPayload nhỏ: state slide chỉ vài KB — chặn luôn frame khổng lồ ác ý.
const wss = new WebSocketServer({ server, path: '/room', maxPayload: 64 * 1024 })
wss.on('error', (err) => console.error('wss error:', err.message))

wss.on('connection', (ws) => {
  /** @type {{role: 'host'|'guest'|null, code: string, gid: number}} */
  const me = { role: null, code: '', gid: 0 }
  ws.isAlive = true
  // Frame rác (UTF-8 hỏng, vượt maxPayload...) emit 'error' — không có
  // listener là CHẾT CẢ PROCESS. Nuốt lỗi, close handler tự dọn.
  ws.on('error', () => {})
  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', (data) => {
    let msg
    try {
      msg = JSON.parse(String(data))
    } catch {
      return
    }
    if (!msg || typeof msg.t !== 'string') return
    if (msg.t === 'ping') return send(ws, { t: 'pong' })

    // ---- Bắt tay: tin đầu tiên khai vai trò ----
    if (!me.role) {
      const code = typeof msg.code === 'string' && CODE_RE.test(msg.code) ? msg.code : null
      if (msg.t === 'host' && code) {
        const token = typeof msg.token === 'string' ? msg.token.slice(0, 64) : ''
        let room = rooms.get(code)
        if (room && alive(room.host)) {
          // Cùng token = chính chủ quay lại (đổi mạng để rơi socket zombie)
          // → đá xác cũ, nhận host mới ngay, khỏi chờ sweeper.
          if (token && token === room.hostToken) {
            room.host.terminate()
          } else {
            send(ws, { t: 'taken' })
            return ws.close()
          }
        }
        if (!room) {
          room = { host: null, hostToken: '', guests: new Map(), lastState: null, begun: false }
          rooms.set(code, room)
        }
        room.host = ws
        room.hostToken = token
        me.role = 'host'
        me.code = code
        send(ws, { t: 'hosted' })
        // Host quay lại sau khi rớt — báo khách đang chờ; host sẽ tự gửi
        // lại state + begun ngay sau 'hosted' nên không cần phát lại ở đây.
        broadcastGuests(room, { t: 'host-back' })
        broadcastCount(room)
      } else if (msg.t === 'join' && code) {
        const room = rooms.get(code)
        if (!room || !alive(room.host)) {
          // Close luôn: chặn một socket ngồi vét cạn mã 6 số.
          send(ws, { t: 'no-room' })
          return ws.close()
        }
        me.role = 'guest'
        me.code = code
        me.gid = nextGuestId++
        room.guests.set(me.gid, ws)
        send(ws, { t: 'joined', begun: room.begun, count: countOf(room) })
        if (room.lastState) send(ws, { t: 'state', s: room.lastState })
        broadcastCount(room)
      }
      return
    }

    const room = rooms.get(me.code)
    if (!room) return

    // ---- Host nói → cả phòng nghe ----
    if (me.role === 'host') {
      if (msg.t === 'state') {
        room.lastState = msg.s
        broadcastGuests(room, msg)
      } else if (msg.t === 'begun') {
        room.begun = msg.v === true
        broadcastGuests(room, msg)
      } else if (msg.t === 'event') {
        broadcastGuests(room, msg)
      }
      return
    }

    // ---- Khách nói → action lên host, event lan cả phòng ----
    if (msg.t === 'action') {
      send(room.host, msg)
    } else if (msg.t === 'event') {
      send(room.host, msg)
      broadcastGuests(room, msg, me.gid)
    }
  })

  ws.on('close', () => {
    const room = rooms.get(me.code)
    if (!room) return
    if (me.role === 'host' && room.host === ws) {
      room.host = null
      broadcastGuests(room, { t: 'host-gone' })
      broadcastCount(room)
    } else if (me.role === 'guest') {
      room.guests.delete(me.gid)
      broadcastCount(room)
    }
    dropRoomIfEmpty(me.code, room)
  })
})

// Quét xác chết: ws không trả pong sau một vòng → cắt (close handler dọn phòng).
const sweeper = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate()
      continue
    }
    ws.isAlive = false
    ws.ping()
  }
}, 10_000)
wss.on('close', () => clearInterval(sweeper))

server.listen(PORT, HOST, () => {
  console.log(`room-server nghe ${HOST}:${PORT} (ws path /room, health /room/health)`)
})
