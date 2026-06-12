# Phân tích Phần 4 (S4Build / S4Prev) — 3 cụm feedback của chủ dự án

> Agent phân tích, KHÔNG sửa code. Mọi số liệu px đo từ code thật (`S4Layout.tsx`, `CodePanel.tsx`,
> `CodeLineRow.tsx`, `layouts.ts`) + đối chiếu screenshot `tools/shots/s4/*.png` (build-00…33, prev-0…9).
> Tinh thần tối thượng: visualizer phải trả lời "TẠI SAO phải code thế này, KHÔNG CÓ thì sao" —
> nhu cầu trước, code sau, ít chữ, visual là chính.

---

## 0. Đo đạc hiện trạng layout (khung 1920×1080)

| Vùng | Tọa độ thật trong code | Kích thước | % màn hình |
|---|---|---|---|
| CodePanel (trái) | `left:50, width:1010, top:44, bottom:56` | 1010 × 980 | **47,7%** diện tích |
| Cột phải | `left:1102, right:50` → width 768 | 768 × 980 | 36,3% |
| — PseudoPin (3 câu) | đầu cột phải | 768 × ~205 | |
| — **Mini graph** | `width:768, height:432`, trong là div 1920×1080 `scale(0.4)` | 768 × 432 | **chỉ 16%** |
| — AsidePanel | tự co theo nội dung | ~768 × 120–220 | |
| — Callout | đáy cột, fontSize 28 | ~768 × 120–190 | |

Hệ quả của `scale(0.4)` (S4Layout.tsx:64):
- Chip cost: chữ trong SVG `fontSize 22` (CostBadge.tsx:85) → hiển thị **8,8px**. Trọng số cạnh, mathOverlay cũng co theo. Trên livestream gần như không đọc nổi — khớp 100% với lời phàn nàn "hơi nhỏ, khó nhìn".
- **Lãng phí thêm ~35% diện tích trong chính khung mini**: bbox nội dung đồ thị (abstractLayout + badge/overlay) chỉ chiếm khoảng `x:180→1760, y:160→1020` ≈ 1580×860 trên mặt phẳng 1920×1080. Scale nguyên cả khung 1920×1080 nghĩa là đang scale cả lề trống. Nếu **crop trước khi scale** (`transform: scale(s) translate(-180px, -160px)`), cùng khung 768×432 dùng được scale ≈ **0.49** thay vì 0.40 — to hơn ~22% tuyến tính, miễn phí, không đổi gì khác.

Ràng buộc chiều rộng tối thiểu của code panel (để giữ điều kiện "code ≥ 22px"):
- Dòng dài nhất: `if Cost[đỉnh kề] == null hoặc newCost < Cost[đỉnh kề] {` = **55 ký tự**, indent 3.
- JetBrains Mono advance ≈ 0.6em. Cộng gutter 56px + indent 3×30=90px + padding ngang 36px:
  - fs-code 23px (hiện tại): 55×13,8 + 182 ≈ **941px** → panel 1010px hiện tại chỉ dư ~70px.
  - fs-code 22px (sàn): 55×13,2 + 182 ≈ **908px**.
- ⇒ **Mọi layout TĨNH muốn code luôn đọc trọn dòng đều không thể đưa code xuống dưới ~910px.** Muốn visualizer thật sự lớn thì phải chấp nhận: hoặc layout ĐỘNG theo beat, hoặc cắt-mờ phần đuôi dòng khi code không phải tâm điểm.

---

## Cụm A — Visualizer ở scene viết code quá nhỏ

### Hiện trạng & vấn đề

- Mini graph 768×432 = 16% màn hình, scale 0.4, badge 8,8px (đo ở trên). Screenshot `build-27/28/29.png`: cảnh `scKeepBetter` — khoảnh khắc ĐẮT NHẤT Phần 4 (lý do sinh ra cái if) — bị nhét trong hộp bé góc phải, mathOverlay "14+6=20 > 16 → giữ nguyên" nhỏ tới mức phải căng mắt.
- Trong khi đó **CodePanel chiếm 48% màn hình nhưng phần lớn thời gian gần như trống** (`build-01.png`: 3 beat cầu nối đầu — panel code là một khối tối hoàn toàn rỗng chiếm nửa màn hình).
- Phân tích nhịp kịch bản: BUILD_SCRIPT 34 beat thì chỉ **14 beat có `ops`** (gõ code); 20 beat còn lại là "nói + nhìn visualizer". Tức là **~60% thời gian khán giả cần nhìn ĐỒ THỊ chứ không phải code** — đúng lời chủ dự án: "người nghe sẽ nghe thuyết trình kèm visualizer trước và nhìn thấy code được tạo ra sau".

### 3 phương án

**A1 — Tái cân bằng tĩnh (ít rủi ro, cải thiện vừa):**
code 910px (hạ fs-code xuống 22px), cột phải bắt đầu từ 992 → graph 878×494, kèm crop-trước-scale ⇒ scale ≈ 0.555. Badge lên ~12px. Sửa đúng 4 hằng số trong S4Layout/CodePanel. *Nhược:* vẫn là "code chính, visualizer phụ" — không giải quyết yêu cầu "visualizer cũng là phần chính".

**A2 — Layout ĐỘNG theo focus của beat (ĐỀ CỬ):** mỗi beat thuộc một trong 2 mode, suy tự động từ dữ liệu beat — beat có `ops` (gõ code) → mode `code`; beat chỉ nói/visualize → mode `visual`. Cấu trúc `need()` (nói trước → gõ sau) tự nhiên biến thành nhịp thở: **phóng to đồ thị khi nói, phóng to code khi gõ** — khớp tuyệt đối flow "nói trước, code sau".

**A3 — Sân khấu trung tâm (đẹp nhất, đắt nhất):** mode visual đưa đồ thị ra GIỮA màn hình ~1400×790 (scale ~0.89), code thu thành thanh dọc mỏng 320px bên trái chỉ hiện số dòng + dòng đang highlight. *Nhược:* code biến mất gần hết làm đứt cảm giác "công trình đang xây dần" (giá trị cốt lõi của S4Build); transition 2 chiều phức tạp; phải viết chế độ render rút gọn cho CodePanel. Không đề cử.

### Phương án đề cử A2 — đặc tả cụ thể

Kích thước 2 mode (lề 50px giữ nguyên, gap 32px):

| | mode `code` (beat gõ) | mode `visual` (beat nói) |
|---|---|---|
| CodePanel | `left:50, width:1010` — **y như hiện tại**, fs-code 23px, đọc trọn dòng | `width:600` — chữ vẫn 23px (KHÔNG scale nhỏ), phần đuôi dòng dài bị cắt sau ~36ch + dải fade gradient 80px ở mép phải; panel dim `opacity:0.85` |
| Cột phải | `left:1102, width:768` | `left:682, width:1188` |
| Mini graph | 768×432, **crop+scale 0.49** (`scale(0.49) translate(-180px,-160px)`) | **1188×668, crop+scale 0.75** — badge cost 22→**16,5px**, node to gấp ~1,9 lần hiện nay; mathOverlay đọc thoải mái |
| PseudoPin | 3 dòng dọc như cũ | nén thành dải ngang 1 hàng ~56px: `① · ② · ③`, chỉ câu active hiện đủ chữ |
| Callout | đáy cột 768 | đáy cột 1188, fontSize 30 |

Vì sao "cắt + fade" chứ không scale chữ nhỏ: ràng buộc của chủ dự án là code ≥ 22px khi panel hẹp. Scale 600/1010 cho chữ ~13,6px — phạm luật. Cắt giữ nguyên 23px: ở mode visual khán giả không cần đọc đuôi dòng if dài; code vẫn hiện diện như "công trình" bên cạnh. Khi cần đọc thật (mode code) panel nở full — không dòng nào bị cắt.

Transition (toàn bộ là HTML — Motion layout OK, không đụng hạn chế SVG):
- `motion.div` của CodePanel `animate={{ width }}`; cột phải `animate={{ left, width }}`; hộp graph `animate={{ width, height }}` + div trong `animate={{ scale }}` (translate cố định). Cùng `duration: 0.5, ease: [0.3, 0.8, 0.3, 1]` (trùng ease trượt dòng code) → cảm giác "ống kính máy quay lia qua lia lại".
- Dòng code dùng `layout="position"` neo trái → đổi width KHÔNG reflow chữ (whiteSpace:pre), chỉ thay đổi vùng nhìn thấy. Không giật.
- Mode visual→code: typewriter nên chờ panel nở xong — thêm base delay ~0.3s vào `delays` của CodePanel khi beat trước đó là visual (hoặc đơn giản: cộng cố định 0.3s, không ai nhận ra ở beat code→code).

Việc phải sửa:
1. `src/codepanel/types.ts` — thêm `focus?: 'code' | 'visual'` vào `CodeBeat`, thêm `focus` vào `CodeState`.
2. `src/codepanel/buildCodeState.ts` — 1 dòng derive: `focus = cur.focus ?? (cur.ops?.length ? 'code' : 'visual')`. Pure theo beat ⇒ lùi/tiến/GOTO đều an toàn, không state ngầm.
3. `src/sections/s4-code/S4Layout.tsx` — viết lại theo 2 mode (bảng số trên), crop transform, PseudoPin compact.
4. `src/codepanel/CodePanel.tsx` — nhận prop `width` (default 1010 → **S4Debugger dùng CodePanel trực tiếp không bị ảnh hưởng**, đã kiểm tra DebuggerSlide.tsx tự layout riêng), thêm overlay fade mép phải khi width < 1010.
5. `src/codepanel/codeScript.ts` — chỉ thêm override `focus` ở vài beat ngoại lệ: PREV beat 0 (`ops` đổ nguyên trang code nhưng bản chất là beat đặt câu hỏi → `focus:'visual'`); beat 30 BUILD "xét lại A" mặc định visual là đúng ý (callout trỏ về đồ thị).
6. Chạy lại `tools/shoot-s4.mjs` + `tools/full-walk.mjs`.

Rủi ro kỹ thuật:
- Motion layout không chạy trong SVG — thiết kế này KHÔNG animate gì trong SVG, chỉ animate div bọc ngoài (transform/size HTML). An toàn.
- Đổi width khi đang highlight: dòng highlight nền cyan trải theo width hàng — co lại cùng panel, chấp nhận được.
- `useMemo` theo beat + render thuần → mode nhảy đúng cả khi GOTO/refresh hash giữa chừng.
- Đây là thay đổi nhìn-thấy-rõ → theo CLAUDE.md cần spawn sub-agent review UI/UX sau khi làm.

---

## Cụm B — Dòng `if Cost[đỉnh kề] == null hoặc newCost < Cost[đỉnh kề]` chưa được "chứng minh bằng mắt"

### Hiện trạng (beat 27→30 của BUILD_SCRIPT, ảnh build-27/28/29/30.png)

- Beat 27: gõ `Cost[đỉnh kề] = newCost` — callout *"Rồi ghi vào ngăn tủ của nó."*
- Beat 28–29 (need pair, tone warn): callout dài ~4 câu — *"**Khoan!** Có khi ngăn tủ đã có số **tốt hơn** rồi — nhớ B=16 mà ngả vòng qua D tính ra 20 chứ? Chỉ được ghi đè khi: ngăn còn **trống**, hoặc số mới **nhỏ hơn**…"* — kèm cảnh tĩnh `scKeepBetter` (mathOverlay "14+6=20 > 16 → giữ nguyên") rồi wrap if.
- Beat 30: xét lại A (`scBackToA`) — beat này tốt, giữ nguyên.

### Vấn đề

Tai họa được **KỂ** chứ không được **DIỄN**. Cảnh `scKeepBetter` cho xem thế giới khi if ĐÃ tồn tại ("giữ nguyên") — tức là chiếu đáp án trước khi khán giả thấy vấn đề. Khán giả chưa bao giờ chứng kiến "không có if thì SỐ ĐẸP BỊ GHI ĐÈ MẤT". Mỉa mai là tại beat 27, code trên màn THẬT SỰ chưa có if — ta đang sở hữu một cỗ máy có lỗi thật 100% mà không cho nó chạy để lộ lỗi. Và callout 4 câu = quá nhiều chữ, ngược yêu cầu "viết ít chữ thôi".

### Thiết kế mới — "cho máy lỗi chạy thật" (thay beat 28–29 bằng chuỗi B1–B6)

Tình huống lấy ĐÚNG từ diễn tiến chuẩn: chốt D=14, xét lại B: newCost = 14+6 = 20 trong khi B đang giữ 16 (qua E). Không có if → 16 bị đè thành 20.

| Beat | Visual (chính) | Lời (≤ 2 câu) | Code |
|---|---|---|---|
| **B1** (visual) | Cảnh `scNaiveSetup`: A,C,G,E locked; **D vừa chốt, halo 'current'**; B frontier **16**; mờ mờ sáng lối A–C–E–B (edge EB 'active') để thấy 16 đến từ đâu | "Dòng vừa viết có kẽ hở. Tua máy đến lúc chốt D — B đang giữ số đẹp: 16." | nguyên trạng (chưa if) |
| **B2** (visual) | Edge DB chuyển 'relaxing', mathOverlay tại B: `14 + 6 = 20` | "Mở lại B từ D: newCost = 20." | highlight `newcost` |
| **B3** (visual — cú đấm) | **Badge B: 16 → 20, FLASH ĐỎ, pop to**; số 16 cũ gạch chéo bay ra; lối sáng A–C–E–B **tắt phụt** (edges dim) | "Dòng của ta ghi đè không hỏi han. Con đường 16 — bay màu." | highlight `setcost` **tô ĐỎ** (tone danger) |
| **B4** (visual — nhu cầu) | mathOverlay tone worse tại B: `máy trả lời 20 ✗ (đáp án thật: 16)`; đồ thị đứng hình | "Hỏng. Vậy LUẬT ghi tủ: chỉ ghi khi **tốt hơn**." | — |
| **B5** (visual — nhánh `== null`) | Cảnh chốt G mở F: badge F là **ô ghost rỗng nét đứt** (costs F:null) → điền 18 lần đầu; chip phụ: `trống → số đầu tiên luôn được ghi` | "Còn ngăn TRỐNG? Trống = chưa từng thấy — lần đầu thì cứ ghi. So 'nhỏ hơn' với cái-chưa-có là vô nghĩa, nên hỏi 'trống?' trước." | highlight `setcost` |
| **B6** (need pair → ops, mode code) | `scKeepBetter` như cũ: chạy LẠI đúng tình huống B1–B3 nhưng giờ if chặn — mathOverlay "20 > 16 → giữ nguyên", badge B đứng yên 16 | "Bọc nó lại: còn trống, hoặc nhỏ hơn — mới được ghi." | **wrap** `if-better-open/close` (op có sẵn) |

Sau đó beat "xét lại A" giữ nguyên — giờ nó là lần xác nhận thứ ba của cùng luật (null / nhỏ hơn / không nhỏ hơn). Vòng tròn: chạy hỏng → thấy đau → đặt luật → bọc if → if tự lo cả các ca khác. Trả lời trọn "tại sao phải có if, không có thì sao" bằng mắt, chữ tối thiểu.

### Việc phải sửa + rủi ro

1. `src/graph/types.ts` — thêm `costFlash?: Record<NodeId, 'worse' | 'better'>` vào `GraphSceneState` (flash phải là **dữ liệu cảnh khai báo**, không suy từ ref so giá trị trước — vì lùi beat rồi tiến lại phải replay đúng, và prevRef hiện tại của CostBadge sẽ nhiễu giữa các beat).
2. `src/graph/CostBadge.tsx` — nhận prop `flash`; flash 'worse' = stroke/fill đỏ + pop scale (mirror đúng cơ chế flash xanh `decreased` sẵn có ở dòng 71–76). Lưu ý sẵn có: khi đi LÙI từ B6 về B3, badge 16→20 sẽ flash lại — chấp nhận được vì flash là ngữ nghĩa của chính beat đó (trạng thái lắng vẫn đúng số).
3. `src/codepanel/types.ts` + `CodeLineRow.tsx` — thêm `highlightTone?: 'danger'` (nền đỏ `rgba(255,122,110,0.10)` + vạch trái đỏ) cho B3.
4. `src/codepanel/codeScript.ts` — 3 scene mới (`scNaiveSetup`, `scNaiveOverwrite`, `scNullFirstWrite`) + thay cặp beat 28–29 bằng B1–B6. KHÔNG dòng code mới nào sinh ra ⇒ **dev-assert FULL_CODE cuối file (codeScript.ts:642) không bị ảnh hưởng** — wrap vẫn là op duy nhất đụng dòng.
5. Rủi ro: (a) BUILD_SCRIPT 34→~38 beat → hash `#s4-dung-may.N` cũ lệch chỉ số — chỉ ảnh hưởng bookmark cá nhân, `beats` suy từ length nên engine tự đúng; (b) validator highlight-id: `setcost`/`newcost` đều tồn tại từ beat 26–27 → pass; (c) cảnh B3 "đường 16 tắt phụt" làm bằng edgeStates dim giữa 2 beat — đổi props phần tử bền vững, không remount, đúng nguyên tắc chống-AnimatePresence-theo-beat.

---

## Cụm C — Đoạn Path/Prev (S4Prev) chưa đủ chi tiết

### Hiện trạng (PREV_SCRIPT 10 beat, ảnh prev-0…9)

- Beat 0: code đầy đủ + callout *"trả về **con số 16** — chứ chưa trả về **con đường**"* nhưng cảnh là `scFull` — **đường A→C→E→B đang SÁNG SẴN trên đồ thị**. Lời nói "chưa biết lối đi" trong khi hình đã vẽ lối đi → tự mâu thuẫn, spoiler chính câu hỏi của slide.
- Beat 1–3: ba aside chữ-trong-hộp (`pathFull` chỉ 2 dòng Path[E]/Path[B], `pathWaste` thêm gạch đỏ, `prevChain` 3 dòng) — đồ thị **đứng yên nguyên `scFull` suốt 4 beat đầu**, không minh họa gì.
- Beat 4–8: chèn `Prev = []`, highlight khối if (*"Ghi Prev lúc nào? … đúng chỗ đang ghi đè cost"* — chỉ NÓI, không có cảnh relax nào diễn lại), chèn `Prev[đỉnh kề] = min`, morph return.
- Beat 9: kết. **Toàn slide không có một lần truy ngược B→E→C→A nào trên đồ thị** — chỉ 1 dòng chữ xanh trong aside ("lần ngược: B → E → C → A"). Cú khép vòng "tư duy ngược" bị đẩy hết sang S4Debugger.

Thiếu so với yêu cầu: (1) cảnh "có 16 mà đường đâu?", (2) bảng Path phình to khi đồ thị lớn, (3) quan sát chung-đoạn-đầu TRÊN ĐỒ THỊ, (4) mũi tên "tôi đến từ đây" + cú XOAY mũi tên khi relax tốt hơn, (5) truy ngược thắp sáng dần.

### Thiết kế mới — 18 beat (visual là chính, lời ≤ 2 câu/beat)

**Màn 1 — Câu hỏi (2 beat):**
- **P0** (sửa beat 0): cảnh mới `scCostsNoPath` — 6 đỉnh locked đủ cost (A0 C4 G6 E10 D14 B16), **KHÔNG cạnh nào sáng**, B halo 'current', mathOverlay tại B: `16 — nhưng đi lối nào?`. Lời: "Máy trả về 16. Nó biết GIÁ — không biết ĐƯỜNG."
- **P1**: 3 cạnh vào B (DB, EB, FB) lần lượt nháy 'active' như 3 cánh cửa vô danh. Lời: "Đứng ở B nhìn lại: ba cửa — chẳng cửa nào ghi dấu."

**Màn 2 — Ý tưởng ngây thơ & cái giá (3 beat):**
- **P2**: aside `pathFull` (nâng cấp): dòng `Path[C] = A → C` hiện; **đồ thị sáng đồng bộ A–C**. Lời: "Ý đầu tiên: mỗi điểm tự chép cả lộ trình đến nó."
- **P3**: bảng tự dài thêm Path[E]=A→C→E, Path[D]=A→C→E→D, Path[B]=A→C→E→B (stagger delay), đồ thị nháy theo từng route. Lời: "Điểm nào cũng một dòng như thế."
- **P4**: aside mới `pathExplode`: giả lập bản đồ 1.000 điểm — các dòng `Path[X₇₄₂] = A → … (14 bước)` dài dần, **tràn khỏi mép panel** (clip + panel rung nhẹ), đồ thị mờ đi phía sau. Lời: "Bản đồ thật nghìn điểm: mỗi ngăn tủ nhét cả đoàn tàu tên."

**Màn 3 — Quan sát & nén (3 beat):**
- **P5**: quan sát TRÊN ĐỒ THỊ: route của E (A–C–E, cyan) và route của B (A–C–E–B) vẽ chồng — **đoạn chung A–C–E pulse cùng màu, riêng E–B sáng màu khác**; aside `pathWaste` giữ vai phụ chú. Lời: "Hai lộ trình chung HỆT đoạn đầu — khác đúng BƯỚC CUỐI."
- **P6** (insight đỉnh): các route rút lại, mỗi đỉnh chỉ còn **một mũi tên nhỏ chỉ về điểm-ngay-trước**: C→A, G→A, E→C, D→E, B→E, F→G, H→G — cả đồ thị hóa thành **cái cây mũi tên về nhà**. Lời: "Mỗi điểm chỉ cần nhớ MỘT điều: 'tôi đến từ đâu'."
- **P7**: aside `prevChain` như cũ (đặt tên Prev) — giờ có cây mũi tên thật trên đồ thị để đối chiếu. Lời: "Đặt tên ngăn tủ mới: Prev — 'bước ngay trước'."

**Màn 4 — Code hóa, có cảnh diễn lại relax (5 beat):**
- **P8–P9**: need pair `Prev = []` (giữ nguyên beat 4–5 cũ).
- **P10**: diễn lại relax THẬT: chốt C mở D — badge D=16, **mũi tên D→C cắm xuống** kèm mathOverlay `4+12=16`. Lời: "Xem lại một lần ghi cost — mũi tên cắm theo."
- **P11**: chốt E relax D: `10+4=14 < 16` → badge 16→14 flash xanh **và mũi tên D XOAY từ C sang E** (đúng tình huống thật Prev[D]: C → E!). Highlight khối if. Lời: "Cost đổi chủ → người-đứng-trước đổi theo. CÙNG một khoảnh khắc — nên cùng một chỗ trong code."
- **P12**: ops chèn `Prev[đỉnh kề] = min` (beat 7 cũ, lời giữ: "Thêm đúng một dòng, ngay cạnh chỗ ghi cost.").

**Màn 5 — Truy ngược khép vòng (5 beat):**
- **P13**: morph `return Prev` (beat 8 cũ).
- **P14**: hỏi ngược lần 1: B 'current', mũi tên B→E flare, **cạnh E–B bật 'onPath'**. Lời: "Trước B? — E."
- **P15**: E→C, cạnh C–E 'onPath'. Lời: "Trước E? — C."
- **P16**: C→A, cạnh A–C 'onPath', A lóe sáng. Lời: "— A. Chạm gốc."
- **P17**: LẬT: cả đường sáng gradient A→C→E→B (dùng `edgeDelays` lan từ A), F/H dim, cây mũi tên mờ lại. Lời: "Lật ngược lại: A → C → E → B = 16. Đúng kiểu nghĩ-ngược của Phần 3 — khép vòng."

(Với Cụm A: chỉ P8–P9, P12, P13 là mode `code`; 14 beat còn lại hưởng đồ thị lớn 1188×668 — cộng hưởng đúng lúc.)

### Việc phải sửa + rủi ro

1. `src/graph/types.ts` — thêm `prevArrows?: { node: NodeId; from: NodeId; flare?: boolean }[]` vào `GraphSceneState`.
2. `src/graph/decorations.tsx` — component `PrevArrow`: mũi tên ngắn ôm dọc cạnh, **solid màu green/path** (PHẢI khác rõ DepArrow tím nét đứt của S3 kẻo nhầm "mũi tên phụ thuộc"); vẽ bằng `pathLength 0→1`; **cú xoay C→E của D = AnimatePresence keyed `"D:C"`/`"D:E"`** (mũi tên cũ rút về, mũi tên mới vẽ ra) — toàn attribute animation, **không Motion layout trong SVG** ✓.
3. `src/graph/GraphView.tsx` — render lớp prevArrows (trên lớp cạnh, dưới đỉnh).
4. `src/codepanel/types.ts` — `CodeAside` thêm `'pathExplode'`; `AsidePanel.tsx` viết `PathExplode` + nâng `PathRows` lên 4 dòng có stagger.
5. `src/codepanel/codeScript.ts` — ~9 scene mới + PREV_SCRIPT 10→18 beat. Morph/insert giữ nguyên target id (`ret`, `setcost`, `vis-decl` đều tồn tại) → validator pass; **FULL_CODE assert không đụng** (PREV không nằm trong assert đó).
6. Rủi ro: (a) hash beat cũ lệch (như Cụm B); (b) P10–P11 là "cảnh diễn lại" với fog thu gọn (chỉ A,C,E,D) — phải chú thích thị giác "tua lại" (vd viền khung nhấp nháy kiểu replay) để không bị hiểu là máy đang chạy tiếp; (c) trùng lặp với 3 frame trace-ngược của S4Debugger là CÓ CHỦ ĐÍCH (ở đây là Ý TƯỞNG, ở debugger là MÁY CHẠY THẬT) — nhưng lời dẫn 2 nơi không được trùng nguyên văn; (d) chạy lại `shoot-s4.mjs`, `full-walk.mjs` để kiểm 18 beat tiến/lùi.

---

## Phát hiện thêm (ngoài 3 cụm, liên quan trực tiếp)

1. **`scFull` đang spoil ở cả cuối S4Build**: beat 31–33 (return + tổng kết) cũng thắp `onPath` A→C→E→B — trong khi cỗ máy lúc đó chỉ biết `Cost[end]=16`, CHƯA hề biết đường. Nên thay bằng biến thể "costs đầy đủ, không đường sáng" (chính là `scCostsNoPath` của P0) → câu hỏi mở đầu S4Prev mạnh hơn hẳn, và "đường sáng lần đầu" được để dành cho đúng khoảnh khắc truy ngược P17.
2. CostBadge flash xanh hiện dựa `prevRef` so giá trị — khi thiết kế thêm flash đỏ (Cụm B) nên chuyển cả hai sang scene-driven (`costFlash`) cho nhất quán và rewind-an-toàn.

## Thứ tự triển khai gợi ý

1. Cụm A (A2) — khung trước, vì B và C đều thiết kế cảnh cho đồ thị-lớn.
2. Cụm B — thêm `costFlash` + `highlightTone` + 6 beat.
3. Cụm C — `prevArrows` + 18 beat + sửa spoiler scFull (phát hiện 1).
4. Re-shoot s4, full-walk tiến/lùi toàn deck, rồi spawn sub-agent review 2 lăng kính (kỹ thuật + sư phạm giả lập người mới) theo đúng quy ước dự án.
