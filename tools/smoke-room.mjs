// Nghiệm thu phòng multiplayer — 2 trình duyệt vào chung phòng, điều khiển
// chéo nhau. CẦN MẠNG (broker PeerJS công cộng). Chạy: node tools/smoke-room.mjs
// Yêu cầu: đã `npm run build`.
import { preview } from 'vite'
import { chromium } from 'playwright'

const server = await preview({ preview: { port: 4179 } })
const base = 'http://localhost:4179'
const browser = await chromium.launch()
const ctxA = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const ctxB = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const A = await ctxA.newPage() // host
const B = await ctxB.newPage() // khách

let failures = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}
const hashOf = (p) => new URL(p.url()).hash
const waitHash = (p, h) =>
  p
    .waitForFunction((want) => location.hash === want, h, { timeout: 12000 })
    .then(() => true)
    .catch(() => false)

try {
  // ---- Host tạo phòng từ lobby ----
  await A.goto(base)
  await A.locator('.lobby-card', { hasText: 'Tạo phòng' }).click()
  await A.getByText('Đọc mã này cho cả nhóm').waitFor({ timeout: 25000 })
  const code = (await A.locator('.lobby-digit').allTextContents()).join('')
  check('mã phòng 6 số', /^\d{6}$/.test(code))
  console.log(`      → mã phòng: ${code}`)

  // ---- Khách nhập mã, tự vào khi đủ 6 số → đứng ở màn chờ ----
  await B.goto(base)
  await B.locator('.lobby-card', { hasText: 'Vào phòng' }).click()
  await B.keyboard.type(code, { delay: 150 })
  const sawWaiting = await B.getByText('Chờ bắt đầu trình chiếu')
    .waitFor({ timeout: 30000 })
    .then(() => true)
    .catch(() => false)
  check('khách nối xong → màn chờ (không bị thả vào deck)', sawWaiting)

  // ---- Host thấy đủ người, bắt đầu chiếu → khách vào deck theo ----
  await A.getByText('2 người trong phòng').waitFor({ timeout: 12000 })
  check('host đếm 2 người', true)
  await A.getByText('Bắt đầu trình chiếu').click()
  check('host vào deck', await waitHash(A, '#s1-mo-man.0'))
  const waitingGone = await B.getByText('Chờ bắt đầu trình chiếu')
    .waitFor({ state: 'hidden', timeout: 12000 })
    .then(() => true)
    .catch(() => false)
  check('host bắt đầu → khách vào deck theo', waitingGone && (await waitHash(B, '#s1-mo-man.0')))
  check('pill phòng hiện trên màn host', await A.locator('.room-pill').isVisible())

  // ---- Host bấm NEXT → khách theo ----
  await A.keyboard.press('ArrowRight')
  check('host NEXT → khách sang s1-ban-do', await waitHash(B, '#s1-ban-do.0'))

  // ---- Khách bấm NEXT → host theo (ai cũng điều khiển được) ----
  await B.keyboard.press('ArrowRight')
  check('khách NEXT → host sang beat sau', await waitHash(A, '#s1-ban-do.1'))

  // ---- Khách lùi → host theo ----
  await B.keyboard.press('ArrowLeft')
  check('khách PREV → host lùi về beat đầu', await waitHash(A, '#s1-ban-do.0'))

  // ---- Gate: host đứng trước gate, khách click resolve hộ ----
  await A.evaluate(() => {
    location.hash = '#s3-trong-suong.2'
  })
  check('GOTO của host lan sang khách', await waitHash(B, '#s3-trong-suong.2'))
  await A.keyboard.press('ArrowRight') // tiến vào gate beat 3
  check('vào gate beat 3 cả hai bên', await waitHash(B, '#s3-trong-suong.3'))

  // khách click SAI (G) → phản ví dụ phải hiện trên màn HOST
  await B.locator('.node-hit[data-node="G"]').click()
  const counterOnHost = await A.getByText('Chưa chắc')
    .first()
    .waitFor({ timeout: 8000 })
    .then(() => true)
    .catch(() => false)
  check('khách click sai → phản ví dụ hiện bên host', counterOnHost)

  // khách click ĐÚNG (C) → gate mở cho cả phòng
  await B.locator('.node-hit[data-node="C"]').click()
  await B.waitForTimeout(700)
  await A.keyboard.press('ArrowRight')
  check('khách click C mở gate → host NEXT đi tiếp', await waitHash(B, '#s3-trong-suong.4'))

  // ---- Khách rớt → host vẫn chiếu bình thường, đếm lại 1 ----
  // (phát hiện rớt qua ICE — có thể mất hơn chục giây)
  await ctxB.close()
  await A.getByText('1 người').waitFor({ timeout: 30000 })
  check('khách thoát → host đếm lại 1 người', true)
  await A.keyboard.press('ArrowRight')
  check('host vẫn điều khiển được sau khi khách thoát', await waitHash(A, '#s3-trong-suong.5'))
} catch (err) {
  console.error('LỖI:', err.message)
  failures++
} finally {
  await browser.close()
  await new Promise((r) => server.httpServer.close(r))
}

console.log(failures === 0 ? '\nTẤT CẢ PASS' : `\n${failures} FAIL`)
process.exit(failures === 0 ? 0 : 1)
