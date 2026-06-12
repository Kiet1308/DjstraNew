// Helper cho tools: bật room-server cục bộ (cổng 9100 — khớp proxy trong
// vite.config.ts) rồi chờ health ok. Trả về child process để kill khi xong.
import { spawn } from 'node:child_process'

export async function startRoomServer(port = 9100) {
  const child = spawn(process.execPath, ['server/room-server.mjs'], {
    env: { ...process.env, ROOM_PORT: String(port) },
    stdio: 'ignore',
  })
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/room/health`)
      if (r.ok) return child
    } catch {
      /* chưa lên — thử lại */
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  child.kill()
  throw new Error('room-server không lên được')
}
