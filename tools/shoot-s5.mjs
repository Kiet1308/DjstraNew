// Chụp Phần 5 — node tools/shoot-s5.mjs
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'tools/shots/s5'
mkdirSync(OUT, { recursive: true })

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

const next = async (settle = 1600) => {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(settle)
}
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

await page.goto('http://localhost:4173/#s5-dem-buoc.0')
await page.reload()
await page.waitForTimeout(1500)
for (let b = 0; b < 7; b++) {
  await page.waitForTimeout(b === 3 ? 2400 : 800)
  await shot(`count-${b}`)
  if (b < 6) await next()
}

await next(1400)
for (let b = 0; b < 4; b++) {
  await page.waitForTimeout(1200)
  await shot(`heap-${b}`)
  if (b < 3) await next()
}

await next(1400)
for (let b = 0; b < 5; b++) {
  await shot(`neg-${b}`)
  if (b < 4) await next()
}

await next(1500)
for (let b = 0; b < 4; b++) {
  await page.waitForTimeout(b === 0 ? 1800 : 1300)
  await shot(`reveal-${b}`)
  if (b < 3) await next()
}

// thử lùi về giữa phần 5
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(150)
}
await page.waitForTimeout(900)
await shot('rewind')
console.log('rewind tại:', new URL(page.url()).hash)

await browser.close()
await new Promise((r) => server.httpServer.close(r))
if (errors.length) {
  console.log('LỖI:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('OK — ảnh tại', OUT)
