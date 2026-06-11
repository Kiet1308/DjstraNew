// Chụp từng beat của Phần 3 + diễn tập gate — node tools/shoot-s3.mjs
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'tools/shots/s3'
mkdirSync(OUT, { recursive: true })

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

const hash = () => new URL(page.url()).hash
const next = async (settle = 900) => {
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(settle)
}
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

// Tọa độ đỉnh (layout abstract, stage = viewport 1:1)
const P = {
  A: [280, 540], C: [610, 330], G: [545, 815], E: [1070, 265],
  D: [1095, 610], F: [1230, 845], H: [880, 965], B: [1590, 480],
}
const click = async (id, settle = 1000) => {
  await page.mouse.click(P[id][0], P[id][1])
  await page.waitForTimeout(settle)
}

// ---- S3LookFromB (6 beat)
await page.goto('http://localhost:4173/#s3-nhin-tu-b.0')
await page.reload()
await page.waitForTimeout(1800)
for (let b = 0; b < 6; b++) {
  await shot(`lookfromb-${b}`)
  if (b < 5) await next(b === 0 ? 1800 : 1500) // đợi settle hết stagger
}

// ---- S3Dependencies (6 beat)
await next(1300)
for (let b = 0; b < 6; b++) {
  await shot(`deps-${b}`)
  if (b < 5) await next(1300)
}

// ---- S3FogWalk (16 beat, gate tại 3/7/10)
await next(1300)
console.log('fogwalk start:', hash())
for (let b = 0; b < 16; b++) {
  await shot(`fog-${b}`)
  if (b === 3) {
    await next(300) // NEXT bị chặn → hint
    await shot('fog-3-blocked-hint')
    await click('D')
    await shot('fog-3-try-D')
    await click('G')
    await shot('fog-3-try-G')
    await click('C', 1200)
    await shot('fog-3-resolved')
  }
  if (b === 7) {
    await click('D')
    await shot('fog-7-try-D')
    await click('E')
    await shot('fog-7-try-E')
    await click('G', 1200)
    await shot('fog-7-resolved')
  }
  if (b === 10) {
    await click('F')
    await shot('fog-10-try-F')
    await click('H')
    const tryH = await page.getByText('E–H = 5').isVisible()
    console.log(tryH ? 'PASS' : 'FAIL', ' click H hiện đúng phản ví dụ E–H (không bị overlay nuốt)')
    await shot('fog-10-try-H')
    await click('E', 1200)
    await shot('fog-10-resolved')
  }
  if (b < 15) await next(1600)
}
console.log('fogwalk end:', hash())

// ---- S3Invariant (4 beat)
await next(1200)
for (let b = 0; b < 4; b++) {
  await shot(`invariant-${b}`)
  if (b < 3) await next(1300)
}

// ---- S3Pseudocode (5 beat)
await next(1100)
for (let b = 0; b < 5; b++) {
  await shot(`pseudo-${b}`)
  if (b < 4) await next(900)
}

// ---- Tua lùi xuyên suốt về đầu Phần 3 — bắt lỗi hình khi đảo chiều
for (let i = 0; i < 37; i++) {
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(140)
}
await page.waitForTimeout(1200)
console.log('sau khi lùi 37 nhịp:', hash())
await shot('rewind-landing')

await browser.close()
await new Promise((r) => server.httpServer.close(r))

if (errors.length) {
  console.log('LỖI CONSOLE/PAGE:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('OK — không lỗi console. Ảnh tại', OUT)
