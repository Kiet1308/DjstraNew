import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Phòng multiplayer nói chuyện với relay cùng origin tại /room
// (server/room-server.mjs, mặc định cổng 9100) — dev/preview proxy qua đây,
// trên VPS thì nginx đảm nhiệm việc này.
const roomProxy = {
  '/room': { target: 'http://127.0.0.1:9100', ws: true },
}

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { proxy: roomProxy },
  preview: { proxy: roomProxy },
})
