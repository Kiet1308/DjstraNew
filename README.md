# Tìm đường ngắn nhất — slide + visualizer tương tác

Web app vừa là slide thuyết trình vừa là visualizer tương tác, dẫn khán giả **tự nghĩ ra**
thuật toán tìm đường ngắn nhất (tên thuật toán chỉ lộ ở slide cuối — đừng spoil!).

## Chạy

```bash
npm install        # lần đầu
npm run dev        # luyện tập (có dev-validator bắt lỗi kịch bản)
npm run build      # build cho buổi diễn
npm run preview    # serve bản build — KHÔNG cần mạng (font đã bundle)
```

Trình duyệt: Chrome/Edge, **F11 hoặc phím F** để fullscreen. Thiết kế cho 1920×1080
(màn khác tỉ lệ sẽ có viền đen — nội dung tự scale).

## Điều khiển

| Phím | Tác dụng |
|---|---|
| `→` / `Space` / `PageDown` | tiến một nhịp (hỗ trợ presenter clicker) |
| `←` / `PageUp` | lùi một nhịp (về đúng trạng thái đã lắng) |
| `1`–`5` | nhảy về đầu Phần 1–5 |
| `O` | mở/đóng tổng quan (click slide để nhảy) |
| `F` | fullscreen |
| `Enter` | **ép mở khóa gate** (khi không muốn/không kịp click) |
| `R` | khóa lại gate hiện tại (diễn lại màn click) |
| `P` | (chỉ slide "Cho máy chạy thật") tự chạy 800ms/nhịp — bấm phím khác để dừng |

URL luôn mang dạng `#slide.beat` — **F5 giữa chừng sẽ quay về đúng chỗ** (bảo hiểm livestream).

## Ba GATE ở màn sương (Phần 3) — kịch bản click

Màn "Bước đi trong sương" có 3 nhịp bị KHÓA: phải click đúng đỉnh mới đi tiếp
(hoặc `Enter` bỏ qua). **Kịch bản loại-trừ cho presenter** (click sai có chủ đích
để màn phản-ví-dụ hiện ra — đó là phương pháp suy luận, không phải lỗi):

| Gate | Thử trước (hiện phản ví dụ) | Đáp án |
|---|---|---|
| 1 — "Chắc chắn điểm nào?" | **D** ("biết đâu C–D=10…") → **G** ("biết đâu C–G=1…") | **C** |
| 2 — "Tiếp điểm nào?" | **D** ("biết đâu E–D=5…") → **E** ("biết đâu G–E=2…") | **G** |
| 3 — frontier 4 điểm | **D** → **F** ("E–F=3…") → **H** ("E–H=5…") | **E** |

Phản ví dụ tự biến mất sau 7 giây hoặc khi click tiếp. Bấm `→` khi gate còn khóa:
HUD hiện gợi ý kín đáo + các đỉnh ứng viên nhấp nháy nhẹ.

## Sửa nhanh

- **Tên người trình bày**: `src/sections/s1-intro/S1Title.tsx`, hằng `PRESENTER`.
- Lời dẫn từng nhịp: tìm theo nội dung trong `src/sections/**` (Phần 4: `src/codepanel/codeScript.ts`).
- `npm run dev` có **dev-validator**: gõ sai id kịch bản code / số liệu trace lệch
  tính tay là app ném lỗi ngay khi mở — đừng bỏ qua lỗi đỏ trong console lúc luyện tập.

## Nghiệm thu tự động (tùy chọn, cần đã `npm run build`)

```bash
node tools/smoke-engine.mjs   # phím, gate, hash-restore
node tools/full-walk.mjs      # đi hết 159 nhịp xuôi + ngược, bắt lỗi console
node tools/shoot-s3.mjs       # chụp ảnh từng nhịp Phần 3 (tools/shots/)
```

## Cấu trúc

- `src/deck/` — engine slide theo "nhịp" (beat): reducer, phím, HUD, overview
- `src/graph/` — đồ thị SVG fully-controlled: sương mù, badge cost, mũi tên phụ thuộc…
- `src/sections/` — 18 slide chia 5 phần; mỗi slide là một bảng beat render thuần túy
- `src/codepanel/` — "nói trước, code sau": code là dữ liệu, kịch bản ops từng nhịp
- `src/debugger/` — chạy thật thuật toán có instrument → 34 khung hình tua được
- `src/explosion/` — đếm 828 tuyến thật bằng liệt kê đường đơn
