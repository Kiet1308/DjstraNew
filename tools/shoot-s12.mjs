// Chụp từng beat Phần 1 + 2 — node tools/shoot-s12.mjs
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'tools/shots/s12'
mkdirSync(OUT, { recursive: true })

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

const next = async (settle = 1100) => {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(settle)
}
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

// ---- S1Title
await page.goto('http://localhost:4173/#s1-mo-man.0')
await page.reload()
await page.waitForTimeout(2400)
await shot('title')

// ---- S1Maps (6 beat) — traveler 2.6s
await next(1000)
for (let b = 0; b < 6; b++) {
  await page.waitForTimeout(b >= 1 && b <= 3 ? 2600 : 400)
  await shot(`maps-${b}`)
  if (b < 5) await next(800)
}

// ---- S2TryAll (6 beat)
await next(1000)
for (let b = 0; b < 6; b++) {
  await page.waitForTimeout(b >= 1 && b <= 4 ? 3300 : 600)
  await shot(`tryall-${b}`)
  if (b < 5) await next(700)
}

// ---- S2Explosion (3 beat) — counter chạy ~6.5s
await next(1200)
await shot('explosion-0')
await next(2300)
await shot('explosion-1-mid') // giữa lúc đếm
await page.waitForTimeout(6500)
await shot('explosion-1-done')
await next(1300)
await shot('explosion-2')

// ---- S2Pruning (7 beat: cắt → ghost city → fanout bigGraph → nhát kéo → counters)
await next(1200)
await page.waitForTimeout(2200)
await shot('prune-0')
await next(1500)
await shot('prune-1')
await next(2800) // 3 ghost city + chip
await shot('prune-2-cityghosts')
await next(3400) // prefix 1.2s + 23 ghost fan-out
await shot('prune-3-fanout')
await next(1800) // nhát kéo — chùm rụng
await shot('prune-4-snipped')
await next(2600) // counters đếm + dòng "chỉ 9 tuyến"
await shot('prune-5-counters')
await next(1300)
await shot('prune-6')

// ---- S2StillSlow (3 beat)
await next(1200)
for (let b = 0; b < 3; b++) {
  await shot(`slow-${b}`)
  if (b < 2) await next(1400)
}

// ---- Lùi xuyên Phần 1-2 về đầu
for (let i = 0; i < 27; i++) {
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(130)
}
await page.waitForTimeout(1000)
console.log('sau khi lùi:', new URL(page.url()).hash)
await shot('rewind')

await browser.close()
await new Promise((r) => server.httpServer.close(r))
if (errors.length) {
  console.log('LỖI:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('OK — ảnh tại', OUT)
