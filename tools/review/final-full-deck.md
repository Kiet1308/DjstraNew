# FINAL REVIEW — Toàn deck (18 slide, 5 phần, ~157 beat)

> Lượt review cuối, 2 lăng kính: **nhất quán kỹ thuật toàn deck** + **audit sư phạm "Minh"** (sáng dạ, chưa học DSA, xem trọn livestream 45–60'). KHÔNG re-litigate những gì 4 report trước đã bắt-và-vá (đã đối chiếu: `phase3-*`, `phase45-*`, `phase67-*` — toàn bộ fix đã xác nhận có mặt trong source hiện tại, xem mục PASS). Trọng tâm: **Phần 5 lần đầu được review** + các mạch chỉ thấy được khi đi xuyên 5 phần.
>
> Đã chạy: `npm run build` (✓ 2.40s, fonts vietnamese subset ×8 có mặt trong dist), grep src/dist, đếm tay FULL_CODE, soi 11 screenshot s5 + đối chiếu nguồn 4 slide S5 với Plan.md/NoiDung.md.

**Tổng kết: 0 CRITICAL · 3 MAJOR · 4 MINOR · 4 NIT.**

---

## CRITICAL

Không có.

---

## MAJOR

### M1. S5NegativeEdges: "dấu ✓ không cho sửa" MÂU THUẪN với chính dòng code khán giả vừa dựng — và bài toán (đích là đâu?) chưa từng được phát biểu

- **File**: `src/sections/s5-finale/S5NegativeEdges.tsx:62-70` (b2), `:83-91` (b3). Ảnh: `neg-2.png`, `neg-3.png`.
- **Vấn đề 1 — cơ chế**: b3 nói *"Mà Y đã chốt mất rồi, dấu ✓ không cho sửa"*. Nhưng dòng if mà Minh vừa nhìn suốt 34 frame debugger là `if Cost[đỉnh kề] == null hoặc newCost < Cost[đỉnh kề]` — **không hề hỏi Visited**. Nếu cỗ máy cứ chạy tiếp (chốt nốt Z rồi duyệt Z→Y), chính dòng if ấy sẽ vui vẻ ghi −1 đè lên 2. Trên đồ thị 3 đỉnh này, thứ thực sự làm máy trả lời sai là **`if min == end break`**: Y là đích, vừa được chọn làm min là máy dừng và trả lời 2. Minh tinh ý sẽ vặn đúng chỗ này: *"dòng if đâu có nhìn dấu ✓?"* — đúng beat cao trào của slide giới hạn.
- **Vấn đề 2 — đề bài**: b2 chỉ nói "Cho cỗ máy chạy từ X" — không nói **tìm đường đến đâu**. Đến b3 kết tội "cỗ máy trả lời **sai bài toán**" thì… bài toán nào? Thiếu một vế làm cả màn buộc tội mất chỗ đứng.
- **Cái hay bị bỏ lỡ**: nếu nêu đích là Y, cú vỡ trận **tái sử dụng đúng dòng `if min == end break`** — dòng được gài công phu nhất Phần 4 (callback "thấy B=16 chưa dám dừng") — và đúng "luật chỉ tin con số đã CHỐT" của màn sương. Vừa chính xác vừa đắt hơn.
- **Sửa lời** (giữ tông mộc, b4 giữ nguyên):
  - b1, thêm vế cuối: *"…chi phí <xanh>−4</xanh> trên đoạn Z→Y. **Đề bài cho cỗ máy: tìm đường rẻ nhất X→Y.**"*
  - b2: *"Cho cỗ máy chạy: mở Y=2, Z=3 → quét min → Y bé nhất → **CHỐT Y**. Mà Y là đích — đúng dòng `if min == end break`: máy dừng, dõng dạc trả lời **2**. Đúng từng chữ luật ta đặt ra."*
  - b3: *"Nhưng nhìn này: đi X→Z→Y tốn 3 + (−4) = <đỏ>−1</đỏ> — rẻ hơn hẳn 2! Mà máy đã **chốt-và-trả-lời mất rồi**. Cả buổi ta tin 'đã chốt thì không bao giờ phải sửa' — lần này chính niềm tin ấy phản bội ta: cỗ máy trả lời <đỏ>sai</đỏ> — vỡ trận."*
- (Toán của demo đã verify đúng: X→Y=2, X→Z=3, Z→Y=−4 trong `graph/data.ts:35-42`, có hướng đủ 3 cạnh; 3+(−4)=−1<2 ✓; thứ tự chốt X→Y đúng ✓.)

### M2. S5Counting: CẢ HAI nhãn trục của lưới bị SVG cắt cụt — "← quét 30 điểm tìm min →" và "30 lần chốt" không bao giờ hiện

- **File**: `src/sections/s5-finale/S5Counting.tsx:153-156` (nhãn trên, `y={-2}`), `:181-195` (nhãn trái, `x={-16}`). Bằng chứng: `count-2/3/4/6.png` — không ảnh nào có 2 nhãn này (chỉ sót một chấm li ti phía trên lưới).
- Tọa độ âm nằm ngoài viewport của `<svg>` (SVG mặc định `overflow: hidden`) → hai dòng chú thích biến thành dead code thị giác. Đây là hai nhãn làm cho phép đọc "hàng = 1 lần chốt, cột = quét n điểm" **tự hiện trên hình** — mất chúng, toàn bộ gánh nặng giải thích dồn về callout + lời nói.
- **Fix 1 dòng**: thêm `style={{ overflow: 'visible' }}` vào thẻ `<svg>` (dòng 152) — SVG cho phép overflow visible, hai text âm tọa độ sẽ hiện đúng chỗ thiết kế. Kiểm lại bằng `tools/shoot-s5` (nhãn trái rotate −90 cần thoát mép trái: GRID_X=525, đủ chỗ).

### M3. S5Counting b1: lời hứa "mỗi chấm dưới đây là một bước máy phải làm" — trên màn KHÔNG có chấm nào

- **File**: `src/sections/s5-finale/S5Counting.tsx:41-53` (b1: `rows: 0, showGrid: true`). Bằng chứng: `count-1.png` — canvas trống trơn, chỉ có callout + dòng chú thích đáy.
- Beat có nhiệm vụ "phóng tình huống lên n=30" nhưng không có gì biểu diễn 30 điểm; chữ "dưới đây" trỏ vào khoảng trống. Trên livestream, presenter đọc câu này xong là một giây lúng túng.
- **Fix (chọn 1)**:
  1. *Rẻ nhất — sửa lời thành lời hứa*: *"Bản đồ thật có hàng nghìn điểm. Phóng tình huống lên <vàng>n = 30 điểm</vàng>. Từ giờ, **mỗi bước máy làm ta chấm xuống một chấm** — đếm bằng mắt."* (b2 mở hàng chấm đầu tiên là lời hứa được trả ngay).
  2. *Đẹp hơn*: b1 hiện một hàng 30 chấm màu trung tính (fog-300) kèm nhãn "30 điểm" — sang b2 hàng cyan đầu tiên quét đè lên ý "mỗi lần chốt phải quét cả 30 điểm này".

---

## MINOR

### m1. Chip hành trình S5Reveal "thành 25 dòng code" vs cỗ máy cuối cùng 27 dòng

- **File**: `src/sections/s5-finale/S5Reveal.tsx:20`. Đối chiếu: `FULL_CODE` = **đúng 25 dòng** (`codeScript.ts:510-537`, đếm tay + dev-assert đối chiếu fold BUILD ✓) → câu chốt S4Build *"Nhìn lại cả trang: 25 dòng"* (`codeScript.ts:498`) **đúng tại thời điểm nói**. Nhưng S4Prev thêm `Prev = []` + `Prev[đỉnh kề] = min` → màn debugger (thứ cuối cùng Minh thấy) là **27 dòng**.
- Chip recap kết thúc hành trình nên khớp trạng thái cuối: đề xuất đổi thành **"thành 27 dòng code"** (hoặc giữ 25 và chấp nhận lệch 2 dòng với màn debugger — nhưng đã mất công đếm thì đếm cho trúng).

### m2. Chú thích "E = số đoạn nối" hiện từ b1 — TÊN có trước NHU CẦU 3 beat

- **File**: `src/sections/s5-finale/S5Counting.tsx:313-328` (legend render theo `showGrid`, tức từ b1), trong khi E chỉ được cần đến ở b4. Vi phạm nhẹ nguyên tắc xương sống của deck.
- **Fix**: `n = số điểm{def.eStrip ? ' · E = số đoạn nối' : ''}` — nửa sau của legend chỉ hiện cùng dải chấm tím.

### m3. Emoji 🌫️ ở câu chào cuối render thành Ô VUÔNG (tofu) trong ảnh chụp

- **File**: `src/sections/s5-finale/S5Reveal.tsx:150`. Bằng chứng: `reveal-3.png` — "…đi xuyên màn sương. ▯". Khung hình CUỐI CÙNG của cả buổi mà dính tofu thì hỏng dư vị; font bundle (Be Vietnam Pro) không có glyph emoji, fallback phụ thuộc máy trình chiếu — rủi ro không đáng giữ.
- **Fix**: bỏ emoji — *"Cảm ơn mọi người đã cùng đi xuyên màn sương."* tự nó đã đủ đẹp (hoặc thay bằng ký tự có trong font, nhưng bỏ là sạch nhất).

### m4. S5HeapTeaser: câu hỏi và đáp án nằm CÙNG một beat — mất nhịp cho khán giả tự bật

- **File**: `src/sections/s5-finale/S5HeapTeaser.tsx:12` (3 beat), `:63-87` (heading "Bước nào đang tốn nhất?" + đáp án "Chính là cú quét tìm min" + bar đỏ cùng hiện ở stage 0).
- Đây là câu khán giả **đủ sức tự trả lời** (vừa dựng vòng for quét min xong) — đúng chuẩn "hỏi trước khi phát kiến thức" mà S2Pruning đã làm rất tốt. Hiện tại đáp án fade-in sau 0.3s, cướp lượt của khán giả.
- **Fix**: thêm 1 beat — stage 0 chỉ heading; stage 1 mới hiện đoạn "Chính là cú quét tìm min…" + bar đỏ (đẩy các stage sau lùi 1). ~5 dòng đổi.

---

## NIT

1. **S5Counting b4** (`S5Counting.tsx:86-97`): "cả chuyến đi đụng vào mỗi đoạn nối **đúng vài lần**" — mơ hồ; sự thật đếm được: **đúng hai lần, mỗi đầu một lần**. Sửa thành "đụng vào mỗi đoạn nối đúng **hai lần** (mỗi đầu một lần)" — mộc và chắc tay hơn.
2. **S5NegativeEdges b0** (`S5NegativeEdges.tsx:28-33`): câu "Đồ thị này có thứ bản đồ ta quen: đường MỘT CHIỀU" đọc trúc trắc (Plan có chữ "thêm" bị rơi). Đề xuất: *"Đồ thị này có một thứ ta quen trên bản đồ thật: đường MỘT CHIỀU…"*. Ngoài ra nhãn **−4** đã hiện mờ ngay b0 (`neg-0.png`) trước khi b1 giới thiệu trợ giá — chấp nhận được như foreshadow, nhưng nếu muốn twist trọn vẹn thì cho ZY ẩn weight ở b0.
3. **Tiêu đề "Bùng nổ tổ hợp"** (`S2Explosion.tsx:81`): chữ "tổ hợp" hơi học thuật so với phổ từ vựng của deck (chỉ hiện ở Overview/HUD nên vô hại — cân nhắc "Bùng nổ số đường" nếu muốn thuần mộc).
4. **S5Counting b5**: "Mỗi cặp điểm một đoạn nối — n² là kịch trần" — số cặp thật là n(n−1)/2; với vai trò **chặn trên** thì n² vẫn đúng (và khớp Plan/NoiDung), không cần sửa — ghi chú để presenter khỏi bị hỏi xoáy: nếu có ai vặn, đáp "tính cả hai chiều và dư dả cho chẵn — kịch trần mà".

---

## PACING toàn buổi (advice — không yêu cầu đổi cấu trúc)

Phân bố beat: **7 / 16 / 37 / 78 / 19** (S1→S5, tổng ≈157). Phần 4 chiếm **~50% số beat** — nhìn con số thì lệch, nhưng xét bản chất thì không tệ như vẻ ngoài:

- S4Build 34 beat nhưng pattern `need()` nhân đôi → thực chất ~17 "ý"; các beat gõ máy chữ là beat presenter được **thở**.
- S4Debugger 34 frame có autoplay `P` (800ms/frame) — có thể lướt 30s cho đoạn giữa.

**Khuyến nghị điều phối khi diễn** (quan trọng vì đây là rủi ro lớn nhất của show):
1. S4Build: đánh dấu trước ~6 beat neo để nói đậm (map-là-gì · while+2 giấy nhớ · quét min · break-found · **wrap** · return) — các beat còn lại nói lướt theo nhịp gõ.
2. S4Debugger: tay bấm các frame đắt (Cost[start]=0, relax D 18→16→14, B giữ 16, break tại B, 4 frame traceback) — đoạn giữa thả `P`.
3. S3FogWalk có 3 gate tương tác — mỗi gate nên cap ~2 phút kẻo Phần 3+4 ăn hết giờ của finale.
4. Ranh giới giữa các phần đều có cầu chữ tốt (đã verify từng cặp — xem PASS); không có khúc chết. Khúc "chậm" duy nhất: S5Counting b3 stagger 900 chấm ~1.9s trước khi chip "n × n" hiện — presenter cứ để lưới tự lấp đầy trong im lặng, đó là một nhịp kịch tốt, đừng bấm vội.
5. Tổng thời lượng ước tính: S1+S2 ~8–10' · S3 ~15–18' (gate ăn giờ) · S4 ~20–25' · S5 ~7–8' → vừa khít 50–60'. Nếu cần cắt, cắt ở S4Debugger (autoplay nhiều hơn), đừng cắt S5.

---

## Plan.md "Verification cuối" — đối chiếu từng mục

| Mục | Kết quả |
|---|---|
| Đi hết deck → rồi ← không lỗi hình | **Gần đạt** — rewind shots cả 4 bộ (s12/s3/s4/s5) sạch; mọi slide S5 có guard `direction === 1` cho delay ✓. Còn lại cần 1 lượt chạy tay cuối sau khi vá M2/M3 (đổi layout lưới). |
| Click mọi đỉnh ở mọi gate | ✓ — fix nuốt-click-H đã vào source (`S3FogWalk.tsx:546` `pointerEvents: 'none'` + comment); counters đủ kịch bản, ghost edges có labelT tránh đè badge |
| Refresh khôi phục slide.beat | ✓ (hash restore — đã verify ở phase engine, không đổi từ đó) |
| `npm run build` OK, dist offline | ✓ build 2.40s; fonts woff/woff2 bundle đủ **vietnamese subset ×8**; không CDN |
| Grep "Dijkstra" | ✓ src: chỉ `S5Reveal.tsx` (2 chỗ); dist JS: 2 occurrences đều thuộc chunk S5Reveal; `dist/index.html`: 0; `<title>` = "Tìm đường ngắn nhất" ✓ |
| Grep "frontier"/"sai" trên UI | "frontier" chỉ là tên state nội bộ ✓. **"sai" CÓ trên UI tại S5NegativeEdges b3** ("trả lời sai bài toán") — đúng tinh thần (luật cấm "sai" là cho phản hồi GATE, không phải cho phán quyết về cỗ máy); giữ chữ "sai" ở đây, nên cập nhật câu chữ checklist trong Plan để lượt grep sau khỏi báo động giả |
| Những điểm cố ý lệch NoiDung | ✓ đủ 7: đích B thống nhất; B chốt cuối; gate 3 = {E,D,F,H}; trọng số nhân đôi; **~70 năm (1956)** ✓ (2026−1956=70, chữ "khoảng" chuẩn); Visited="đã chốt"; Thử-D/Thử-G là kịch bản bắt buộc |
| Spirit check: NHU CẦU trước TÊN GỌI tại mọi khái niệm mới | ✓ toàn deck (xem bảng PASS); ngoại lệ duy nhất còn lại là m2 (legend "E =" sớm 3 beat) |
| Spirit check: gate đủ thông tin SUY LUẬN | ✓ (3 gate — phase3 đã audit; lượt này xác nhận không hồi quy) |

---

## PASS — những gì lượt full-pass này đã xác minh (đừng sửa nữa)

**Phần 5 chi tiết**
- Toán đếm bước trung thực: 30×30=900 ✓; E≤n² → n²+E≤2n² → "vẫn cỡ n²" ✓; **O(n²) và chữ "ĐỘ PHỨC TẠP" chỉ xuất hiện ở beat CUỐI** (`count-6.png`) — "đếm trước, ký hiệu sau" giữ trọn ✓.
- Heap teaser dùng **số thật**: log₂10⁶ ≈ 19.93 → "~20 bước" ✓; "log n" đặt tên SAU con số ✓; O((n+E)log n) chỉ là phụ chú "cho ai tò mò" ✓; không đi sâu heap ✓.
- Cạnh âm: đồ thị có hướng đủ 3 mũi tên, weight −4 đúng dữ liệu; mũi tên được giới thiệu trước khi dùng ("như phố một chiều") ✓; phép tính 3+(−4)=−1<2 đúng cả callout lẫn mathOverlay ✓ (cơ chế kể chuyện cần vá — M1).
- **Câu thần chú khớp NGUYÊN VĂN xuyên 2 phần**: gate-1 answer `S3FogWalk.tsx:178` *"đi tiếp thì chỉ dài thêm chứ không ngắn lại"* ≡ trích dẫn tại `S5NegativeEdges.tsx:107-108` (đúng từng chữ, kể cả "thì") — callback nổ chuẩn ✓; b8 sương ("đi tiếp chỉ dài thêm") là echo nhất quán ✓.
- S5Reveal: "Dijkstra" — nơi render DUY NHẤT toàn app ✓; nền là `finalScene` của chính màn sương (op 14%) — callback hình đẹp ✓; "~70 năm (1956), Edsger W. Dijkstra" ✓; thông điệp đóng *"Ông ấy chỉ là người nói ra đầu tiên — còn suy luận thì ai cũng làm được"* — đúng tinh thần NoiDung dòng 13-14 ✓.

**Mạch thuật ngữ xuyên đề (kết luận cho câu hỏi "điểm/đoạn nối ở S5 có phải hồi quy?")**
- **Không phải hồi quy — giữ nguyên.** Beat morph nói rõ "Tên gọi thôi — nó vẫn là bản đồ của ta"; sau morph deck chưa bao giờ bỏ "điểm" trong lời nói (FogWalk: "ba điểm đang mở"; Pseudocode: "các điểm nối với nó"), chỉ dùng "đỉnh/cạnh" ở ngữ cảnh sát-code (`đỉnh kề`, `for đỉnh in map`, "cạnh âm"). S5Counting nói chuyện đếm-bước với khán giả phổ thông → "n = số điểm, E = số đoạn nối" đúng phổ giọng đã thiết lập, khớp luôn Plan. "cạnh âm" tại S5NegativeEdges cũng hợp lệ (ngữ cảnh thuật toán). Chuỗi đặt tên đủ và đúng thứ tự: CHI PHÍ (S1Maps) → cost (FogWalk b5, có cầu "chi phí tốt nhất… gọi tắt là cost") → ĐỒ THỊ/ĐỈNH/CẠNH (1 lần, LookFromB b1) → CHỐT (b4)/MỞ (b6) → đỉnh kề (S4, kèm "kề = nối trực tiếp") → ĐỘ PHỨC TẠP/O(n²)/log n (S5, sau khi đếm) ✓.

**Liên tục con số xuyên đề**
- best = **16** lập ở S2TryAll = B=16 màn sương = trace Phần 4 = "A→C→E→B = 16" ✓ (8 đường đơn, ACEB=16 nhỏ nhất — đã verify độc lập ở phase45).
- **828/819**: S2StillSlow import thẳng `BIG_TOTAL` từ ExplosionScene — một nguồn, không lệch được ✓.
- **25 dòng**: FULL_CODE đúng 25 dòng (đếm tay) + dev-assert fold-BUILD ≡ FULL_CODE (id+indent+text) `codeScript.ts:642-659` ✓ — claim S4Build chuẩn; chỉ chip recap ở Reveal lệch 2 dòng (m1).
- 30×30=900, log₂10⁶≈20, 70 năm — đều thật ✓. Không "∞" trên UI ✓.

**Chuỗi callback xuyên phần — cả 5 cặp đấu chữ khớp**
| Gieo | Gặt | Khớp |
|---|---|---|
| S2Explosion chaos | S3LookFromB b0 "hàng trăm ngả… **ta vừa nếm mùi rồi**" + chaosFrom('A') | ✓ |
| Fog b12 "thấy đích… Chưa." | break-found: "Nhớ lúc **thấy B=16 mà chưa dám dừng** không?" + scene scSeeGoal | ✓ |
| Gate-1 "đi tiếp thì chỉ dài thêm…" | S5NegativeEdges b4 trích nguyên văn | ✓ |
| Fog b13 "14+6=20 > 16 → giữ nguyên" | Wrap: "nhớ B=16 mà ngả vòng qua D tính ra 20 chứ?" + scKeepBetter | ✓ |
| S2StillSlow "(thử quay ống kính lại…)" | S3LookFromB b0 "**Quay ống kính** nhìn từ B" | ✓ |
- Cầu nội bộ S4→S5: PREV beat cuối "cho cỗ máy **chạy thật**" → title debugger "Cho máy chạy thật"; debugger khép "tư duy ngược" → S5Counting b0 "**Cỗ máy chạy đúng rồi** — nhưng NHANH hay CHẬM?" ✓.

**Nhất quán thị giác**
- Ngữ nghĩa màu giữ vững ở S5: amber+✓ = chốt (X, Y), cyan nét đứt = đang mở (Z), đỏ = vi phạm/thủ phạm (chip −1<2, cạnh ZY 'pruned' ở b4) — khớp S1→S4 ✓.
- cityGraph + layout dùng chung S1→S4, S5Reveal tái dùng `finalScene`; negGraph là đồ thị MỚI được giới thiệu tử tế ("đồ thị lạ") ✓. cutScene/finalScene đã hợp nhất một nguồn (`scenes.ts`) — fix C1/m7 phase3 xác nhận có mặt, phantom đi A→C→E (qua cửa) rồi mới lặn vào vùng tối ✓.

**HUD/Overview**
- 18 title đều trung tính, không spoiler, định vị tốt cho presenter: "Mở màn / Bài toán tìm đường / Thử mọi con đường / Bùng nổ tổ hợp / Cắt nhánh sớm / Vẫn chậm / Nhìn từ đích / Chuỗi phụ thuộc / Bước đi trong sương / Quy luật lộ ra / Ba câu chốt hạ / Dựng cỗ máy / Nhớ lại con đường / Cho máy chạy thật / Đếm bước / Lấy min cho khéo / Một giới hạn / **Lộ diện**" ✓. Nhãn phần "Phần 5 — Nhìn lại" kín tiếng ✓.

**Hồi quy của các fix cũ — không phát hiện**: pointerEvents gate H ✓, ghost labelT ✓, ALL_EDGES suy từ data ✓, FULL_CODE indent setcost=4 + dev-assert ✓, scMapC/scLockG có thật trong codeScript ✓, S2StillSlow l0 đã reword ✓, gateHint riêng cho FogWalk ✓.
