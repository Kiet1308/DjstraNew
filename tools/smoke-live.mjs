// Nghiệm thu PHIÊN BẢN ĐANG CHẠY THẬT (đã deploy): 2 trình duyệt vào chung
// phòng qua server thật. Chạy: node tools/smoke-live.mjs [url]
// Mặc định: https://tvk1308.me/Visualizer2
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'https://tvk1308.me/Visualizer2'
const browser = await chromium.launch()
const ctxA = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const ctxB = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const A = await ctxA.newPage()
const B = await ctxB.newPage()
A.on('console', (m) => {
  if (m.type() === 'error') console.log('A console error:', m.text())
})
B.on('console', (m) => {
  if (m.type() === 'error') console.log('B console error:', m.text())
})

let failures = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}
const waitHashEnd = (p, suffix) =>
  p
    .waitForFunction((want) => location.hash === want, suffix, { timeout: 15000 })
    .then(() => true)
    .catch(() => false)

try {
  await A.goto(base)
  await A.locator('.lobby-card', { hasText: 'Tạo phòng' }).click()
  await A.getByText('Đọc mã này cho cả nhóm').waitFor({ timeout: 25000 })
  const code = (await A.locator('.lobby-digit').allTextContents()).join('')
  check('tạo phòng trên bản live', /^\d{6}$/.test(code))
  console.log(`      → mã phòng: ${code}`)

  await B.goto(base)
  await B.locator('.lobby-card', { hasText: 'Vào phòng' }).click()
  await B.keyboard.type(code, { delay: 150 })
  const waiting = await B.getByText('Chờ bắt đầu trình chiếu')
    .waitFor({ timeout: 30000 })
    .then(() => true)
    .catch(() => false)
  check('khách vào phòng → màn chờ', waiting)

  await A.getByText('2 người trong phòng').waitFor({ timeout: 15000 })
  await A.getByText('Bắt đầu trình chiếu').click()
  check('host vào deck', await waitHashEnd(A, '#s1-mo-man.0'))
  check('khách vào deck theo', await waitHashEnd(B, '#s1-mo-man.0'))

  await A.keyboard.press('ArrowRight')
  check('host NEXT → khách theo', await waitHashEnd(B, '#s1-ban-do.0'))
  await B.keyboard.press('ArrowRight')
  check('khách NEXT → host theo', await waitHashEnd(A, '#s1-ban-do.1'))
  await B.keyboard.press('ArrowLeft')
  check('khách PREV → host theo', await waitHashEnd(A, '#s1-ban-do.0'))
} catch (err) {
  console.error('LỖI:', err.message)
  failures++
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nLIVE OK' : `\n${failures} FAIL`)
process.exit(failures === 0 ? 0 : 1)
