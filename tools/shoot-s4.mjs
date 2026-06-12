// Chụp Phần 4 trên DEV server (để dev-validator + trace assert chạy thật)
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'tools/shots/s4'
mkdirSync(OUT, { recursive: true })

const server = await createServer({ server: { port: 5174 } })
await server.listen()

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

const next = async (settle = 1500) => {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(settle)
}
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

const hash = () => new URL(page.url()).hash

// ---- S4Morph: 3 beat "bỏ lớp trang trí" (morph map→abstract dời từ P3 về đây)
await page.goto('http://localhost:5174/#s4-do-thi.0')
await page.reload()
await page.waitForTimeout(2500)
await shot('morph-0')
await next(1400)
await shot('morph-1')
await next(2000) // morph 1.1s + decor tan
await shot('morph-2')

// ---- S4Build: đi hết toàn bộ beat, chụp mỗi beat
await page.goto('http://localhost:5174/#s4-dung-may.0')
await page.reload()
await page.waitForTimeout(2500)
let b = 0
while (hash().startsWith('#s4-dung-may')) {
  await shot(`build-${String(b).padStart(2, '0')}`)
  const before = hash()
  await next(2100) // chờ typewriter gõ xong
  if (hash() === before) break
  b++
}
console.log('build beats đã đi:', b + 1)

// ---- S4Prev
await page.waitForTimeout(800)
let p = 0
while (hash().startsWith('#s4-luu-duong')) {
  await shot(`prev-${p}`)
  const before = hash()
  await next(1700)
  if (hash() === before) break
  p++
}
console.log('prev beats đã đi:', p + 1)

// ---- Debugger: vài frame đầu tay, rồi autoplay P đến cuối
await page.waitForTimeout(600)
await shot('debug-00')
await next(1000)
await shot('debug-01')
await next(1000)
await shot('debug-02')
// autoplay
await page.keyboard.press('p')
await page.waitForTimeout(8000)
await shot('debug-autoplay-mid')
await page.waitForTimeout(22000)
await shot('debug-end')
console.log('debugger sau autoplay:', hash())

// ---- Tua lùi 15 nhịp giữa S4Build xem wrap/typewriter đảo chiều
await page.goto('http://localhost:5174/#s4-dung-may.27')
await page.reload()
await page.waitForTimeout(2200)
await shot('build-27-fresh')
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(250)
}
await page.waitForTimeout(900)
await shot('build-rewind-to-19')
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(250)
}
await page.waitForTimeout(1200)
await shot('build-forward-back-to-27')

await browser.close()
await server.close()
if (errors.length) {
  console.log('LỖI:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('OK — ảnh tại', OUT)
