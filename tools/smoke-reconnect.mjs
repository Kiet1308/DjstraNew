// Nghiệm thu hồi phục: host lỡ REFRESH giữa buổi → mở lại đúng phòng cũ,
// khách tự nối lại, vị trí slide giữ nguyên. Chạy sau `npm run build`.
import { preview } from 'vite'
import { chromium } from 'playwright'
import { startRoomServer } from './room-srv.mjs'

const roomSrv = await startRoomServer()
const server = await preview({ preview: { port: 4180 } })
const base = 'http://localhost:4180'
const browser = await chromium.launch()
const ctxA = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const ctxB = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const A = await ctxA.newPage()
const B = await ctxB.newPage()

let failures = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}
const waitHash = (p, h, t = 12000) =>
  p
    .waitForFunction((want) => location.hash === want, h, { timeout: t })
    .then(() => true)
    .catch(() => false)

try {
  // Dựng phòng, vào deck, tiến tới giữa buổi
  await A.goto(base)
  await A.locator('.lobby-card', { hasText: 'Tạo phòng' }).click()
  await A.getByText('Đọc mã này cho cả nhóm').waitFor({ timeout: 25000 })
  const code = (await A.locator('.lobby-digit').allTextContents()).join('')
  await B.goto(base)
  await B.locator('.lobby-card', { hasText: 'Vào phòng' }).click()
  await B.keyboard.type(code, { delay: 150 })
  await waitHash(B, '#s1-mo-man.0')
  await A.getByText('Bắt đầu trình chiếu').click()
  await A.keyboard.press('ArrowRight')
  await A.keyboard.press('ArrowRight')
  check('cả hai ở giữa buổi (#s1-ban-do.1)', await waitHash(B, '#s1-ban-do.1'))

  // Host refresh!
  await A.reload()
  await A.waitForTimeout(1000)

  // Khách phải nhận ra mất kết nối
  const toast = await B.getByText('Mất kết nối với phòng')
    .waitFor({ timeout: 25000 })
    .then(() => true)
    .catch(() => false)
  check('khách hiện toast mất kết nối', toast)

  // Lobby của host gợi mở lại phòng cũ
  check(
    `card gợi "Mở lại phòng ${code}"`,
    await A.getByText(`Mở lại phòng ${code}`)
      .isVisible()
      .catch(() => false),
  )

  // Host mở lại phòng (card đã đổi title) — phải ra ĐÚNG mã cũ
  await A.locator('.lobby-card', { hasText: 'Mở lại phòng' }).click()
  await A.getByText('Đọc mã này cho cả nhóm').waitFor({ timeout: 30000 })
  const code2 = (await A.locator('.lobby-digit').allTextContents()).join('')
  check('mã phòng giữ nguyên sau refresh', code2 === code)

  await A.getByText('Bắt đầu trình chiếu').click()
  check('host trở lại đúng vị trí cũ', await waitHash(A, '#s1-ban-do.1'))

  // Khách tự nối lại, toast biến mất, vẫn điều khiển được
  const reB = await B.getByText('Mất kết nối với phòng')
    .waitFor({ state: 'hidden', timeout: 45000 })
    .then(() => true)
    .catch(() => false)
  check('khách tự nối lại (toast biến mất)', reB)
  await B.waitForTimeout(800)
  await B.keyboard.press('ArrowRight')
  check('khách lại điều khiển được sau hồi phục', await waitHash(A, '#s1-ban-do.2'))
} catch (err) {
  console.error('LỖI:', err.message)
  failures++
} finally {
  await browser.close()
  await new Promise((r) => server.httpServer.close(r))
  roomSrv.kill()
}

console.log(failures === 0 ? '\nTẤT CẢ PASS' : `\n${failures} FAIL`)
process.exit(failures === 0 ? 0 : 1)
