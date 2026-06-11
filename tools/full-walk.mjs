// Tổng duyệt: đi HẾT deck bằng → (tự click gate đúng), rồi lùi ← về đầu.
// Bắt mọi lỗi console/page. node tools/full-walk.mjs
import { preview } from 'vite'
import { chromium } from 'playwright'

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

const hash = () => new URL(page.url()).hash
// đáp án các gate: gate1 → C, gate2 → G, gate3 → E (tọa độ abstract layout)
const GATE_ANSWERS = {
  '#s3-trong-suong.3': [610, 330],
  '#s3-trong-suong.7': [545, 815],
  '#s3-trong-suong.10': [1070, 265],
}

await page.goto('http://localhost:4173/#s1-mo-man.0')
await page.reload()
await page.waitForTimeout(1500)

let steps = 0
let stuck = 0
const visited = [hash()]
for (let i = 0; i < 400; i++) {
  const before = hash()
  const answer = GATE_ANSWERS[before]
  if (answer) {
    await page.mouse.click(answer[0], answer[1])
    await page.waitForTimeout(450)
  }
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(330)
  const after = hash()
  if (after === before) {
    stuck++
    if (stuck >= 3) break // cuối deck (hoặc kẹt thật — sẽ lộ ở số beat)
  } else {
    stuck = 0
    steps++
    visited.push(after)
  }
}
console.log(`đi xuôi: ${steps} bước, dừng tại ${hash()}`)
const FORWARD_END = hash()

// lùi về đầu
let backSteps = 0
stuck = 0
for (let i = 0; i < 400; i++) {
  const before = hash()
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(300)
  if (hash() === before) {
    stuck++
    if (stuck >= 3) break
  } else {
    stuck = 0
    backSteps++
  }
}
console.log(`đi ngược: ${backSteps} bước, dừng tại ${hash()}`)

const ok =
  FORWARD_END === '#s5-lo-dien.3' && hash() === '#s1-mo-man.0' && steps === backSteps
console.log(ok ? 'WALK OK' : 'WALK LỆCH!')

await browser.close()
await new Promise((r) => server.httpServer.close(r))
if (errors.length) {
  console.log(`${errors.length} LỖI CONSOLE:`)
  for (const e of errors.slice(0, 20)) console.log(' -', e)
  process.exit(1)
}
if (!ok) process.exit(1)
console.log('KHÔNG lỗi console trong toàn bộ hành trình.')
