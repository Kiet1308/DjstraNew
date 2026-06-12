# Audit sư phạm + UI/UX — vòng sửa theo feedback chủ dự án

> Phương pháp: giả lập khán giả **"Minh"** (chưa từng học DSA) đi qua từng beat bằng screenshot
> `tools/shots/` (s12/title + prune-*, s3/lookfromb + deps + fog + invariant, s4/morph + build + prev),
> đối chiếu lời dẫn trong `S2Pruning.tsx`, `S3Dependencies.tsx`, `S3FogWalk.tsx`, `S3Invariant.tsx`,
> `S4Morph.tsx`, `codeScript.ts`, layout trong `S4Layout.tsx`/`AsidePanel.tsx`. Thước đo duy nhất:
> Minh có TỰ suy ra được không, và có ĐỌC được hình không.

---

## (a) Bảng chấm 9 mục feedback

| # | Yêu cầu | Chấm | Căn cứ (theo mắt Minh) |
|---|---------|------|------------------------|
| 1 | S1Title không spoil — chỉ "tìm đường ngắn nhất", tên "Nhóm 2" | **ĐẠT** | `title.png`: eyebrow "Một tấm bản đồ · một điểm đi · một điểm đến", H1 "TÌM ĐƯỜNG NGẮN NHẤT", "— từ A đến B —", `PRESENTER = 'Nhóm 2'`. Không một chữ nào về sương/tự-nghĩ-ra/thuật toán. |
| 2 | S2Pruning: THỰC SỰ hiểu cắt 1 nhánh = đỡ cả chùm | **ĐẠT** | Chuỗi b0→b6 chuẩn: hỏi trước ("còn đáng đi tiếp không?" với đồng hồ nhảy 0→18 lật đỏ) → cắt → **b2: 3 tuyến tương lai chết theo, đếm được bằng mắt** (chip "−3 tuyến — 0 bước chân") → b3-b4 phóng đại lên bigGraph: hỏi "còn bao nhiêu tuyến chưa thử?" + 23 ghost tỏa ra rồi rụng đồng loạt → b5 counter thật 828/819 + "chỉ 9 tuyến phải đi đến tận đích" → b6 gài "kéo không tự biết chỗ cắt, 286 lần mò". Minh đi từ 1 ví dụ sờ được (3) đến con số sốc (819) mà không phải tin suông. Số liệu khớp dữ liệu thật (3 đường prefix A–D: ADB, ADEB, ADCEB). |
| 3 | Phần 3 giữ BẢN ĐỒ, morph để dành lúc viết code | **ĐẠT** | Toàn bộ s3/* là variant map (phố xá mờ làm nền, thuật ngữ "điểm/đoạn nối"). Morph nằm đúng ở `S4Morph` 3 beat: máy-không-có-mắt (nhu cầu) → "suy luận có đụng tên đường không?" → morph + đặt tên ĐỒ THỊ/ĐỈNH/CẠNH. Tên gọi đến SAU nhu cầu. |
| 4 | S3Dependencies tách nhiều bước, MỘT CHIỀU, bỏ "quay vòng" | **ĐẠT** | 9 beat: B cần D/E/F → hỏi sâu D (cần A,C,E — **không nhắc B**) → F cần G → G cần A ("chạm đáy") → E,C → quy luật (phát biểu sau khi pattern lặp 4 lần) → quan sát hướng (mọi mũi tên chĩa về A) → A=0 → lật ngược. Không tồn tại cặp mũi tên ngược chiều ở bất kỳ beat nào (T1–T4 đều chĩa về phía A). Không còn chữ "quay vòng". |
| 5 | FogWalk: cost hiện MUỘN — 2-3 lần bằng tay trước | **ĐẠT** | b2–b9 KHÔNG có badge nào: trọng số trên cạnh + mathOverlay hiện-rồi-tan ("4+6=10", "4+12=16 < 18") + nhẩm miệng ("cả nhà nhớ giùm: E mười, D mười sáu"). C chốt tay (gate b3), G chốt tay (b6-b7). b9 là beat NHU CẦU thật: quiz "D đang là bao nhiêu — 18 hay 16?" + 4 chip "?" — Minh bị bắt quả tang quên thật (D vừa đổi giá 2 beat trước). b10 badge mới pop + đặt tên cost. Nhu cầu → công cụ → tên gọi, đúng thứ tự. |
| 6 | Quy luật "chốt rẻ nhất" KHÁM PHÁ TRONG LÚC ĐI, bằng lập luận đường-lẻn | **ĐẠT** | Gate 2 không tuyên "nhỏ nhất nên chọn": "Còn lại G=6. Nhưng công bằng thì G cũng phải bị THỬ PHÁ như hai bạn kia → cho nó một cơ hội" → b7 đường lẻn đỏ phá hụt ("vùng tối không có cửa sau… đến cửa đã tốn ≥ 10 > 6") → gate 3 lặp lại với E → **b12 vỡ quy luật ngay tại trận**: "kẻ sống sót LẦN NÀO cũng là điểm đang mở RẺ NHẤT, lý do lần nào cũng đúng một câu". S3Invariant chỉ nhìn lại; dãy 4→6→10→14→16 được kể như "món quà"/bằng chứng lời hứa (chiều luật ⇒ dãy tăng), KHÔNG dùng làm lập luận sinh ra luật. b14 còn tái dùng luật để giải "thấy B=16 chưa được dừng". |
| 7 | Scene viết code: visualizer LỚN, ngang hàng code | **ĐẠT** | `S4Layout` mode visual: đồ thị 1188×668 (~62% màn hình), code thu 600px nhưng GIỮ cỡ chữ 23px (cắt + fade mép). Cả cụm máy-lỗi build-28..31 và các beat nói đều ở mode visual — đồ thị là sân khấu chính, code chỉ nở to đúng lúc gõ. |
| 8 | Dòng `if == null hoặc newCost <` : thấy TẠI SAO, ít chữ | **ĐẠT** | build-28..35 là chuỗi mạnh nhất deck: tua đến chốt D (B=16, lối sáng) → newCost 14+6=20 → **dòng ngây thơ THẬT trên màn thi hành: badge B 16→20 flash đỏ, lối sáng tắt phụt, dòng `Cost[đỉnh kề]=newCost` highlight đỏ** → "máy trả lời 20 ✗ (đáp án thật: 16)" → luật "chỉ ghi khi tốt hơn" → beat riêng ngăn TRỐNG (F ghost, "trống → ghi 6+12=18") → wrap if + chạy lại "20 > 16 → giữ nguyên. Con đường 16 sống sót" → xét nét "mở ngược về A: 4+4=8 — điều kiện lo hết". Mỗi beat ≤ 2 câu, visual gánh chính. |
| 9 | Path/Prev nhiều cảnh, đủ chi tiết | **ĐẠT về kịch bản** (19 beat, 5 màn, mạch không đứt) — **nhưng dính 1 lỗi render MAJOR ở beat quan sát trung tâm** (xem M2): bảng Path bị cắt mất dòng `Path[B]` đúng lúc lời dẫn nói "lộ trình của E và của B". |

---

## (b) Danh sách vấn đề

### CRITICAL — hình không đọc được đúng chỗ cần suy luận

**C1. build-01 (S4Build beat 1 — "map là gì"): bảng `map[C]` bị đè bẹp còn đúng 1 dòng `map[C] = {`.**
- Hiện trạng: callout nói *"Ví dụ map[C] — đứng ở C thấy đúng 3 ngả, **bảng ghi đúng 3 dòng**"* nhưng AsidePanel bị flex-shrink nén còn ~40px (overflow hidden) — 3 dòng `A → 4 / D → 12 / E → 6` và dấu `}` **hoàn toàn không nhìn thấy**. Minh nghe "bảng ghi đúng 3 dòng" mà trên màn không có bảng nào — mất luôn cây cầu "bản đồ ↔ dữ liệu", trong khi mọi dòng code về sau (`map[min]`, `map[min][đỉnh kề]`) đứng trên khái niệm này.
- Nguyên nhân (`S4Layout.tsx` + `AsidePanel.tsx`): cột phải mode visual = PseudoPin + graph 668px (`flexShrink:0`) + aside + callout; tổng vượt 980px → flexbox nén đứa duy nhất không có `flexShrink:0` là AsidePanel, `overflow:'hidden'` cắt sạch ruột.
- Đề xuất sửa: (1) thêm `flexShrink: 0` cho AsidePanel; (2) khi `state.aside` tồn tại ở mode visual, hạ `graphH` 668 → ~540 (`const graphH = visual ? (state.aside ? 540 : 668) : 432`) để bảng + callout đủ chỗ. Beat này đồ thị chỉ là minh họa "đứng ở C thấy 3 ngả" — nhỏ lại không mất gì.

### MAJOR — lệch hình/lời tại beat then chốt

**M1. fog-5 và fog-9 (S3FogWalk): node C bị callout che gần kín.**
- fog-5 là beat *"Chốt C rồi thì **từ C nhìn tiếp**"* — nhân vật chính là C, hai cạnh relax (C–E, C–D) mọc ra từ C, vậy mà C nằm lọt dưới callout 6 dòng, chỉ ló một lát mỏng vàng + dấu ✓. Minh nghe "từ C" mà không thấy C đâu; hai tia sáng như mọc ra từ… cái hộp chữ. fog-9 cũng che C nhưng nhẹ hơn (C không phải tâm điểm beat đó).
- Đề xuất: riêng b5 (và b9) chuyển callout xuống **đáy-giữa** (slot đang dùng cho overlay phản-ví-dụ: `left:360, right:360, bottom:86` — các beat này không có gate nên slot trống), hoặc thêm prop `y` cho `CalloutSlot` như S2Pruning đã làm. Không cần đổi layout đồ thị.

**M2. prev-5 (S4Prev màn 3 — quan sát "chung hệt đoạn đầu"): lời nói E và B, bảng hiện C/E/D — dòng `Path[B]` bị cắt.**
- Callout: *"lộ trình **của E và của B** chung HỆT đoạn đầu — khác đúng BƯỚC CUỐI"*. Aside `pathWaste` có 4 dòng C/E/D/B + chú thích đỏ "↑ chép lại y nguyên…", nhưng bị nén nên Minh chỉ thấy C, E, D — **không có B**, không có chú thích. Trên đồ thị B có sáng (đỡ được một phần), nhưng bảng — nơi "bước cuối" hiện bằng chữ — lại kể chuyện khác lời dẫn. Đây là beat insight đẻ ra Prev.
- Đề xuất (kết hợp với fix C1): sau khi aside hết bị nén, nếu vẫn chật thì đổi rows của stage `waste` thành đúng cặp được nhắc: `[{C}, {E}, {B: shared 'A → C → E', tail ' → B'}]` (bỏ dòng D ở stage này — D đã làm xong nhiệm vụ ở stage `grow`).

### MINOR

**m1. prev-4 (pathExplode): dòng 4 + chốt đỏ "… × 1.000 điểm" bị cắt dọc.** Tràn NGANG là cố ý và đọc ra đúng "đoàn tàu tên chạy khỏi khung" — đạt; dòng thứ 4 mờ dần ở mép cắt nhìn cũng khá "cố ý". Nhưng dòng đỏ tổng kết trùng nội dung callout nên mất không đau. Sau fix C1 sẽ tự hiện đủ — chỉ cần verify lại beat này.

**m2. Mode code: mini-graph scale 0.485 → badge cost ~11px, không đọc được trên livestream.** Chấp nhận được vì lúc gõ code đồ thị chỉ là ngữ cảnh (mọi con số cần đọc đều nằm trong callout/code), nhưng nếu muốn: tăng scale lên 0.52–0.55 vẫn vừa khung 432px.

**m3. build-29: dòng `newCost = Cost[min] + map[min][đỉnh kề]` đang highlight nhưng bị cắt ở 600px (fade giữa token).** Công thức đầy đủ có trong callout ("newCost = 14+6 = 20") nên không chặn suy luận — ghi nhận là cái giá đã biết của thiết kế "giữ cỡ chữ, cắt đuôi". Không cần sửa.

**m4. fog-11-try-F: chip ghost "3?" (labelT 0.72) nằm khá sát badge D=16.** Chưa đè nhau nhưng chỉ cách vài px — nếu rảnh tay hạ `labelT` xuống ~0.6 cho thoáng.

**m5. Gate 2/3 — lập luận đường-lẻn dùng E=10/D=16 làm "giá vé qua cửa" mà không nói vì sao số đó đáng tin.** Khán giả cực kỳ xét nét có thể hỏi "nhỡ đến cửa E có cách rẻ hơn 10?". Trả lời thật ra có sẵn (mọi lối tới E không chui qua vùng tối đều dùng toàn đoạn đã thấy), mức thuyết trình hiện tại là đủ; nếu muốn chặt hơn chỉ cần presenter nói miệng nửa câu: *"tới được cửa nào cũng phải đi bằng đường đã thấy — mà đường đã thấy rẻ nhất tới E là 10"*. Không đề xuất đổi text trên màn (callout b7 đã dài).

**m6. (Rủi ro chấp nhận theo đúng feedback #4) Dependencies b1/b4 cố ý bỏ B khỏi câu "bước cuối VÀO D — từ A, từ C, hay từ E?"** (D còn nối B; tương tự E còn nối D, B). Hình không vẽ mũi tên ngược nên đa số khán giả không vấp; nhưng presenter nên thủ sẵn 1 câu miệng nếu bị hỏi: *"B đang đứng CHỜ câu trả lời của D — đường tốt nhất đến D mà phải vòng qua B thì lại quay về câu hỏi cũ, nên khỏi xét."* KHÔNG đưa lên màn hình (sẽ tái nhiễm "quay vòng" mà chủ dự án đã yêu cầu bỏ).

---

## Soát mạch suy luận các đoạn được hỏi riêng

- **FogWalk b5 → gate 2 (b6)**: nhẩm miệng ĐỦ — vì callout gate nhắc lại trọn bộ "G… 6, E… 10, D… 16 (vừa đổi từ 18 đấy)" và mỗi phản ví dụ tự khai số nó cần ("10+5 = 15 < 16"). Minh không phải nhớ gì xuyên beat. Cái "khó nhớ" được để dành làm nỗi đau cho b9 — đúng thiết kế.
- **b6–b7 "thử phá G"**: tự nhiên, không phải phát kiến thức — logic "công bằng" nối thẳng từ hai cú thử-phá D, E ngay trước đó; G chuyển state 'current' (bị xét) chứ không khóa luôn, hình nói đúng điều lời nói.
- **b9 nhu cầu ghi ra**: THẬT — quiz "18 hay 16?" đánh trúng chỗ khán giả vừa quên thật (D đổi giá ở b5, đã 4 beat trôi qua), 4 chip "?" trên đúng 4 điểm đang mở; câu "muốn thành QUY TẮC cho máy thì không được nhớ mang máng" chuyển nhu cầu cá nhân → nhu cầu thuật toán gọn.
- **b12 tự vỡ trước khi đọc**: strip C=4→G=6→E=10 bay vào có stagger TRƯỚC, callout mở bằng câu hỏi "Khoan… để ý không?" — khán giả có ~1 nhịp để tự thấy "toàn đứa rẻ nhất". Đạt; presenter nên dừng 2 giây trước khi đọc tiếp.
- **Dependencies b1–b4 nhịp hỏi**: cùng một câu hỏi vật lý lặp 4 lần với độ sáng tầng-hóa — đến b3 Minh đoán được trước câu trả lời, b4 phát biểu quy luật đúng lúc pattern chín. Không thấy chỗ đứt.
- **S4 build-28..35 nhìn-hình-hiểu "không if thì hỏng"**: có — chuỗi nguyên-nhân-hậu-quả nằm trọn trên đồ thị (số đẹp → ghi đè → flash đỏ + lối sáng tắt), code chỉ đỏ đúng dòng thủ phạm; chữ ít (≤ 2 câu/beat). Cú "chạy lại cùng tình huống" sau wrap khép vòng chứng minh.
- **prev-0..18 mạch Path→Prev→trace**: không đứt — câu hỏi (biết giá không biết đường) → ý ngây thơ + cái giá (bảng phình) → quan sát nén (chung đoạn đầu) → cây mũi tên → ghi Prev đúng chỗ ghi cost (cú XOAY của D là khoảnh khắc đắt nhất, làm rất tốt) → truy ngược B→E→C→A → lật xuôi khép tròn tư duy ngược. Hai lỗi hiển thị C1/M2 là thứ duy nhất cản trải nghiệm.

## UI/UX 1920×1080 còn lại (đã soi, KHÔNG có vấn đề)

- Chip mathOverlay quanh E (fog-5 "4+6=10", fog-9 "10… nhỉ?") đã né callout (dx dương sang phải) — không đè.
- Strip 3 chip b12 canh phải, callout canh trái — không chạm nhau; cỡ chữ 26px mono đọc tốt.
- SnipScene: 23 ghost cyan tỏa từ điểm cắt đọc ra "một chùm nhiều" rõ ràng, không thành mớ rối; lúc rụng chuyển đỏ phân biệt tốt với prefix.
- PathExplode tràn ngang đúng kiểu cố ý (xem m1 cho phần dọc).
- Mọi callout/badge/chip đã soi đều ≥ cỡ tối thiểu livestream; chip "máy trả lời 20 ✗ (đáp án thật: 16)" trong mini-graph 0.75 đọc rõ.
