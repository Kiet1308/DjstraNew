// Nghiệm thu deck engine trên slide THẬT — chạy: node tools/smoke-engine.mjs
// Yêu cầu: đã `npm run build` (serve dist qua vite preview).
import { preview } from 'vite'
import { chromium } from 'playwright'

const server = await preview({ preview: { port: 4173 } })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

let failures = 0
function check(name, cond) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) failures++
}
const hash = () => new URL(page.url()).hash
const press = async (key, times = 1) => {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key)
    await page.waitForTimeout(90)
  }
}

await page.goto('http://localhost:4173/?offline')
await page.waitForTimeout(800)

check('title không spoiler', (await page.title()) === 'Tìm đường ngắn nhất')
check('khởi động tại slide mở màn', hash() === '#s1-mo-man.0')

await press('ArrowRight')
check('NEXT hết slide 1 beat → sang s1-ban-do', hash() === '#s1-ban-do.0')
await press('ArrowLeft')
check('PREV về beat cuối slide trước (1 beat → beat 0)', hash() === '#s1-mo-man.0')

// Gate thật: FogWalk beat 3 (GATE 1).
// Chú ý: GOTO/hash thẳng vào gate sẽ auto-resolve (bảo hiểm livestream),
// nên phải đáp xuống beat 2 rồi NEXT tiến vào gate.
await page.goto('http://localhost:4173/?offline#s3-trong-suong.2')
await page.reload()
await page.waitForTimeout(1500)
await press('ArrowRight') // vào gate beat 3 theo chiều tiến
check('NEXT vào gate beat 3', hash() === '#s3-trong-suong.3')
await press('ArrowRight')
check('NEXT bị chặn tại gate 1', hash() === '#s3-trong-suong.3')
check('HUD hiện hint khi bị chặn', await page.getByText('click điểm trên bản đồ').isVisible())
await press('Enter')
await press('ArrowRight')
check('Enter ép resolve → NEXT đi tiếp', hash() === '#s3-trong-suong.4')
await press('ArrowLeft')
check('PREV về gate đã resolve — không kẹt', hash() === '#s3-trong-suong.3')
await press('r')
await press('ArrowRight')
check('R re-arm → NEXT lại bị chặn', hash() === '#s3-trong-suong.3')
await page.mouse.click(635, 300) // click C — đáp án đúng (map layout)
await page.waitForTimeout(500)
await press('ArrowRight')
check('click C resolve gate → NEXT đi tiếp', hash() === '#s3-trong-suong.4')

// Refresh khôi phục
await page.goto('http://localhost:4173/?offline#s3-quy-luat.2')
await page.reload()
await page.waitForTimeout(800)
check('refresh khôi phục #s3-quy-luat.2', hash() === '#s3-quy-luat.2')

// Overview + nhảy phần
await press('o')
check('O mở overview', await page.getByText('Tổng quan').isVisible())
await press('Escape')
await page.waitForTimeout(400)
await press('2')
check('phím 2 nhảy về đầu phần 2', hash() === '#s2-thu-het.0')
await press('5')
check('phím 5 nhảy về phần 5', hash() === '#s5-dem-buoc.0')

await browser.close()
await new Promise((r) => server.httpServer.close(r))
console.log(failures === 0 ? '\nTẤT CẢ PASS' : `\n${failures} FAIL`)
process.exit(failures === 0 ? 0 : 1)
