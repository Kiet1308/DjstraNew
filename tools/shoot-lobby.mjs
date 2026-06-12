// Chụp các màn hình lobby để soát thiết kế. Chạy sau `npm run build`.
import { preview } from 'vite'
import { chromium } from 'playwright'

const server = await preview({ preview: { port: 4183 } })
const base = 'http://localhost:4183'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

await page.goto(base)
await page.waitForTimeout(1600)
await page.screenshot({ path: 'tools/shots/lobby-menu.png' })

await page.locator('.lobby-card', { hasText: 'Vào phòng' }).click()
await page.waitForTimeout(900)
await page.keyboard.type('481', { delay: 80 })
await page.waitForTimeout(400)
await page.screenshot({ path: 'tools/shots/lobby-join.png' })

await page.keyboard.press('Escape')
await page.waitForTimeout(700)
await page.locator('.lobby-card', { hasText: 'Tạo phòng' }).click()
await page.getByText('Đọc mã này cho cả nhóm').waitFor({ timeout: 25000 })
await page.waitForTimeout(600)
await page.screenshot({ path: 'tools/shots/lobby-host.png' })
const code = (await page.locator('.lobby-digit').allTextContents()).join('')

// Khách thứ hai vào → màn chờ
const ctxB = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const B = await ctxB.newPage()
await B.goto(base)
await B.locator('.lobby-card', { hasText: 'Vào phòng' }).click()
await B.keyboard.type(code, { delay: 120 })
await B.getByText('Chờ bắt đầu trình chiếu').waitFor({ timeout: 30000 })
await B.waitForTimeout(600)
await B.screenshot({ path: 'tools/shots/lobby-waiting.png' })

// Vào deck xem pill phòng
await page.getByText('Bắt đầu trình chiếu').click()
await page.waitForTimeout(1200)
await page.screenshot({ path: 'tools/shots/lobby-deck-pill.png' })

await browser.close()
await new Promise((r) => server.httpServer.close(r))
console.log('đã chụp 5 ảnh vào tools/shots/')
