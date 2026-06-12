# Review kỹ thuật — vòng sửa lớn (S2Pruning/SnipScene, Phần 3 giữ map, S4Morph, layout động, Prev)

Phạm vi: toàn bộ file thay đổi theo danh sách + đối chiếu Plan.md (nguồn chân lý) + screenshot tại `tools/shots/{s12,s3,s4}`. Đã tự chạy lại mô phỏng `computeSnipEvents`/`simulatePruning` bằng Node độc lập để kiểm số liệu.

## Đã xác minh ĐÚNG (không cần sửa)

- **Toán S2Pruning/SnipScene khớp 100%**: tái lập mô phỏng độc lập trên bigGraph ra đúng `TOTAL=828, cutEarly=819, walkedFull=9, PROBES=286`, biggest snip: prefix `S–n1–n4–n2–n3–n5` (5 đoạn), `prefixCost=27 > bestAtTime=26`, `killed=23`. Mọi con số trong callout b3–b6 đều suy từ dữ liệu thật, không hardcode. `computeSnipEvents` dùng cùng thứ tự DFS + cùng tiến hóa `best` với `simulatePruning` (best chỉ đổi khi walkedFull, walkedFull reset `curKey` → trong một nhát kéo `bestAtTime` bất biến — đúng). Tổng suffixes = 819 = cutEarly. `biggest` không bị mutate sau khi chọn (suffixes chỉ push trước vòng chọn max).
- **3 tuyến ghost trên cityGraph** (D–B, D–E–B, D–C–E–B) đúng là 3 đường đơn duy nhất qua D chưa thử khi cắt tại D với kỷ lục 16 (ADB=24, ADEB=28, ADCEB=42).
- **Toán FogWalk chuẩn từng beat**: b2 (C4/G6/D18), b5 (4+6=10; 4+12=16<18), b8 (6+12=18; 6+14=20), `COSTS_G={A0,C4,G6,E10,D16,F18,H20}`, `COSTS_E={…,D14,B16}`, b13 (10+6=16; 10+4=14<16), b15 (14+6=20>16 giữ nguyên), b16 A→C→E→B=16. Mọi phản ví dụ gate (C–D=10→14<18, C–G=1→5<6, E–D=5→15<16, G–E=2→8<10, E–F=3→13<18, E–H=5→15<20) đều đúng số nguyên.
- **GATE_BEATS suy tự động = [3, 6, 11]** ✓; `FINAL_BEAT` suy từ `finalReveal` = 16 ✓; `beats` mọi slide suy từ `BEATS.count`/`SCRIPT.length` ✓. 19 slide trong deck.ts ✓. BUILD = 39 beat, PREV = 19 beat — khớp Plan.
- **Gate 2 patch `G:'current'`** nhất quán với cutScene b7 (G vẫn current, chưa khóa) và b8 (G locked). Re-arm `R` tại b6: bỏ resolved → scene gốc G frontier, câu hỏi quay lại — đúng. Lùi/GOTO vào gate auto-resolve, không kẹt.
- **Rewind**: mọi slide render thuần từ beat. FrozenMeter/PruneCounters/SnipScene đều có nhánh `animate=false` ra trạng thái lắng (đã soi từng nhánh prop); `stripDepDelays` dùng đúng ở S3Dependencies khi `direction === -1`; CostBadge tăng-khi-lùi đổi số im lặng, giảm-khi-xuôi mới pop xanh.
- **Kiến trúc**: không Motion `layout` trong SVG (layout chỉ ở HTML: CodeLineRow/PseudoPin); GraphEdge đã là `motion.line` với **đủ x1..y2 ở cả `initial` lẫn `animate`** trong cả 3 biến thể (glow/dash/chính) — không animate chuỗi `d`; chip trọng số tween x/y theo morph 1.1s; AnimatePresence chỉ bọc phần tử nhỏ keyed ổn định (id cạnh/đỉnh, calloutKey, aside kind) — không remount subtree lớn theo beat.
- **Dev-validator**: `validateScript` chạy cho cả BUILD_SCRIPT lẫn PREV_SCRIPT; assert FULL_CODE đối chiếu fold cuối BUILD (id+indent+text, 25 dòng — tự fold tay xác nhận đúng thứ tự và `setcost` indent 4 sau wrap).
- **Layout động S4 khớp số**: visual: code 600, colLeft 682, colW = 1188, graph 1188×668, scale 0.75 → vùng nhìn 1584×890 từ (180,160) — trọn nội dung 180→1760/160→1020; code: 1010/1092/778×432/0.485 → 1604×890 ✓. `--fs-code: 23px` giữ nguyên khi hẹp, cắt + dải fade 90px (CodePanel) — không co chữ.
- **PREV_TREE và 2 cảnh relax** (`scPrevWrite1` D←C lúc chốt C; xoay D←E lúc chốt E) đúng số (riêng trạng thái G của scPrevSwing — xem MAJOR-1). Trace ngược B→E→C→A và prevChain (Prev[B]=E, Prev[E]=C, Prev[C]=A) đúng. `scFull` chỉ xuất hiện từ màn truy ngược ✓ (trước đó `scCostsNoPath` — biết giá, không đường sáng ✓).
- **Spoiler/thuật ngữ**: S1Title chỉ đề bài + "Nhóm 2"; mọi nhãn UI "đang mở/đã chốt"; "đỉnh kề" chỉ xuất hiện từ S4.
- Marker mũi tên `context-stroke` render đúng trong Chromium (xác nhận bằng screenshot prev-7/prev-9: đầu mũi tên xanh hiện đủ).

---

## CRITICAL

### C1. Cột phải Phần 4 TRÀN DỌC ở beat visual có `aside` — AsidePanel bị bóp nát, nội dung biến mất

**File**: `src/sections/s4-code/S4Layout.tsx` (dòng 43: `graphH = visual ? 668 : 432`; dòng 67–98 graph box `flexShrink: 0`; dòng 101–103 AsidePanel không `flexShrink: 0`).

Cột phải cao cố định 980px (top 44, bottom 56). Ở mode visual: pin compact ~45 + gap 18 + graph **668** + gap 18 + aside + gap + callout. Riêng `mapTable` cần ~208px, callout ~160px → tổng ~1.117px > 980. Vì graph box `flexShrink:0` còn AsidePanel (overflow hidden, flex-shrink mặc định 1) thì không, **aside là thứ bị bóp**:

- **BUILD beat 1** (`aside: 'mapTable'`, cầu nối "map là gì"): ảnh `tools/shots/s4/build-01.png` cho thấy chỉ còn dòng `map[C] = {` — **3 dòng A→4 / D→12 / E→6 hoàn toàn không nhìn thấy**, trong khi callout đang nói "đứng ở C thấy đúng 3 ngả, **bảng ghi đúng 3 dòng**". Lời nói trỏ vào một bảng trống — hỏng đúng beat dạy khái niệm `map`.
- **PREV beat 4** (`pathExplode`): `prev-4.png` chỉ thấy 3/4 dòng, dòng chốt "… × 1.000 điểm — ngăn nào cũng một đoàn tàu tên" bị che/cắt (đây là con số gây sốc của màn).
- **PREV beat 7** (`prevChain`): `prev-7.png` mất dòng xanh "lần ngược: B → E → C → A — lật lại là ra cả con đường" — chính là câu chuyển sang màn 5.

(PathRows 2 dòng ở prev-2 thì vừa — chỉ các aside ≥ 4 dòng + note mới vỡ.)

**Cách sửa cụ thể** (chọn 1):
1. Trong `S4Layout`, khi `state.aside` có mặt ở mode visual thì hạ chiều cao graph: `const graphH = visual ? (state.aside ? 470 : 668) : 432` và `const scale = visual ? (state.aside ? 0.53 : 0.75) : 0.485` (470/0.53 ≈ 887 ≈ vùng crop dọc — vẫn trọn hình). Đồng thời thêm `flexShrink: 0` cho root của `AsidePanel` để không bao giờ bị bóp lần nữa.
2. Hoặc: đè `focus` của các beat có aside dài thành `'code'` trong codeScript (mapTable/pathExplode/prevChain) — graph 432 đủ chỗ cho aside; nhưng phương án 1 đúng tinh thần "visual là chính" hơn.

Sau khi sửa chạy lại `node tools/shoot-s4.mjs`, soi `build-01`, `prev-4`, `prev-7`.

---

## MAJOR

### M1. `scPrevSwing`: G còn 'frontier' (cost 6) trong khi E (10) đã chốt — mâu thuẫn với chính quy luật vừa dạy

**File**: `src/codepanel/codeScript.ts` dòng 418–437 (`scPrevSwing`).

Cảnh "mũi tên D XOAY C→E" tái hiện khoảnh khắc **chốt E** (relax D 16→14). Theo diễn tiến chuẩn (chốt C=4 → **G=6** → E=10), lúc E được chốt thì G đã chốt từ trước. Nhưng scene khai báo `G: 'frontier'` với badge 6 hiện rõ — khán giả (vừa học xong "điểm đang mở RẺ NHẤT mới được chốt") sẽ thấy E=10 được khóa trong khi G=6 còn mở → vi phạm quy luật ngay trên hình, đúng beat then chốt của Prev. Ảnh `tools/shots/s4/prev-11.png` xác nhận G viền cyan đứt + badge 6, E vàng ✓.

So sánh: `scPrevWrite1` (chốt C, mở D) để `G: 'frontier'` là **đúng** (lúc đó G chưa chốt); chỉ `scPrevSwing` sai.

**Sửa**: trong `scPrevSwing` đổi `G: 'frontier'` → `G: 'locked'`. (Tùy chọn thêm cho trọn: thêm `{ node: 'G', from: 'A' }` vào `prevArrows` của cảnh này — G đã chốt thì đã có mũi tên về A; và của `scPrevTree` thì đã có sẵn.) Không cần reveal F/H — các cạnh GF/GH đang hidden, không ai kiểm được; nhưng G=6 'frontier' thì kiểm được ngay bằng quy luật.

### M2. S4Morph beat 2: cost badge + dấu ✓ + halo KHÔNG tween theo morph — nhảy giật ~35px trong khi node trượt 1.1s

**File**: `src/graph/CostBadge.tsx` (cx/cy dòng 54–55, `rect x/y` dòng 73–78, `text x/y` dòng 89–92 — đều là attribute TĨNH, đổi tức thì khi layout đổi) và `src/graph/GraphNode.tsx` (chip ✓ dòng 166–178, halo `current` dòng 96–110 — `circle` thường, cx/cy tĩnh).

Tại S4Morph b2 layout đổi map→abstract: `motion.rect`/`motion.text` của node và `motion.line` của cạnh tween 1.1s, **nhưng 6 badge cost (A0,C4,G6,E10,D14,B16) và 2 dấu ✓ (G, D) nhảy thẳng đến vị trí mới ngay frame đầu** (delta 25–35px chéo, vd D (1120,635)→(1095,610)), rồi node mới trườn tới sau ~1 giây — badge "rời thân" đúng khoảnh khắc trình diễn của slide mới. Đây là lỗi mới lộ ra vì trước đây morph không có costs trên hình (Phần 3 cũ không badge khi morph).

**Sửa**: cho phần thân badge/✓ đi theo cùng tween:
- CostBadge: thay vị trí tuyệt đối bằng translate có animate — bọc nội dung trong `<motion.g animate={{ x: cx, y: cy }} transition={{ x: morph, y: morph }}>` (morph = tween 1.1s như GraphNode) và vẽ rect/text quanh gốc (0,0); hoặc đưa `x/y` của rect và text vào `animate` với transition morph.
- GraphNode: tương tự cho chip ✓ (đưa `cx/cy/x/y` vào motion attrs với transition morph) — halo/hit-area chỉ xuất hiện ở map nên ít quan trọng hơn, nhưng sửa cùng cách được.

---

## MINOR

### m1. finalScene bỏ rơi badge F=18 / H=20 — số "đã ghi" tự bốc hơi ở b16
`src/sections/s3-reverse/scenes.ts:79` — `costs` của finalScene chỉ có A,C,G,E,D,B. Từ b15 (COSTS_E đủ F/H) sang b16, hai badge lặng lẽ biến mất (xác nhận `fog-16.png`), lùi lại thì pop trở lại. Hơi ngược thông điệp "ghi ra cho đỡ phải nhớ". Đề nghị thêm `F: 18, H: 20` — node `dimmed` đã tự hạ opacity badge còn 0.35, không gây ồn. (Nếu cố ý làm sạch khung kết thì ghi chú vào scenes.ts để vòng review sau khỏi bới lại.)

### m2. `computeSnipEvents`: `biggest = events[0]` nổ nếu không có nhát cắt nào
`src/explosion/enumeratePaths.ts:116` — với bigGraph hiện tại luôn có 277 events nên an toàn, nhưng đổi graph/trọng số là `biggest` thành `undefined` → `SnipScene` deref `BIGGEST_SNIP.prefix` crash lúc import. Thêm guard (`if (!events.length) throw new Error('không có nhát cắt — đổi bigGraph?')`) cho lỗi tự khai báo sớm.

### m3. Lời b3 S2Pruning "đã tốn X — **hơn** kỷ lục" phụ thuộc dữ liệu
Điều kiện cắt là `>=`; trong 277 events có 45 nhát `prefixCost === bestAtTime`. Với biggest hiện tại 27>26 thì chữ "hơn" đúng, nhưng nếu chỉnh bigGraph mà biggest rơi vào nhát "bằng" thì lời sai. Có thể đổi thành "đã chạm/vượt kỷ lục" hoặc kệ (số hiện tại đúng).

### m4. CityGhosts là `<svg>` thường nằm trực tiếp trong AnimatePresence
`src/sections/s2-brute/S2Pruning.tsx:423–425` — con trực tiếp của AnimatePresence không phải motion component → unmount tức thì, không exit (các motion.path bên trong không được đếm). Hiện được lớp city crossfade 0.7s che nên không thấy; nếu muốn exit thật thì bọc root bằng `motion.svg`/`motion.div` có `exit`.

### m5. Rewind VÀO beat morph-return replay animation nhỏ
`src/codepanel/CodeLineRow.tsx:129–137` — `morphed` không phân biệt direction (khác `fresh` có `showTyping`): lùi từ PREV b14 về b13, dòng `ret` chạy lại fade `opacity 0→1, y -8→0`. Vi phạm nhẹ "lùi = trạng thái lắng". Sửa nếu muốn: truyền `morphed && direction === 1` từ CodePanel.

### m6. Screenshot cũ lẫn trong tools/shots gây nhiễu review
`tools/shots/s3/fog-7-*`, `fog-6-resolved` cũ (01:26) chụp theo bố cục gate cũ vẫn nằm cạnh ảnh mới (18:10); s12 còn `prune-2.png/prune-3.png` đời trước. Đề nghị các script `shoot-*.mjs` xóa thư mục output trước khi chụp (`rmSync(OUT, {recursive:true, force:true})` rồi `mkdirSync`). Nhân tiện: log cuối shoot-s3 nói "lùi 38 nhịp" nhưng vòng lặp bấm 39 lần (vô hại — chỉ log).

### m7. Chú thích lệch số nhỏ
- `S4Layout.tsx:14` docstring ghi "đồ thị về **768**×432" — thực tế colW = 778. Sửa comment.
- Plan.md mục layout động ghi "778×432" — code đúng với Plan; chỉ docstring lệch.

### m8. `PROBES` gồm cả 9 lượt đi trọn (không bị cắt)
`S2Pruning.tsx:20` — 286 = 277 nhát + 9 lượt trọn; chữ "lần lần-đường-rồi-cắt" gộp cả 9 lượt không-cắt. Khớp Plan ("~286") nên không yêu cầu sửa; nếu muốn chặt chẽ: "286 lượt phải lần đường (277 lần dừng giữa chừng)".

### m9. Vòng rAF ExplosionScene đọc `state.current.done` lúc render
`src/explosion/ExplosionScene.tsx:141` — sau khi `done` bật trong loop, component không re-render nên rAF tiếp tục quay no-op (early-return) cho đến khi đổi beat. Không leak (cleanup theo `active`), chi phí ~0; ghi nhận, không cần sửa. SnipScene/PruneCounters gate đúng theo prop, dừng hẳn khi đổi beat.

---

## Đối chiếu Plan.md — không phát hiện lệch nội dung

Đã rà từng mục: FogWalk 18 beat/gate 3-6-11/show-cost b10/strip b12/final b16; Dependencies 9 beat một chiều (mọi mũi tên chĩa về A, không cặp ngược chiều — xác nhận cả hình deps-5..7); LookFromB 5 beat không morph; Invariant 3 beat chỉ nhìn lại; S2Pruning 7 beat đúng kịch bản hỏi-trước; S4Morph 3 beat nhu-cầu-trước-tên-sau; BUILD 39/PREV 19 beat đúng trình tự Plan (kể cả `scCostsNoPath` cuối BUILD và scFull chỉ sau truy ngược). Hai chỗ code "đi xa hơn Plan" đều hợp lệ: thứ tự duyệt gate scripted bằng counters (Plan yêu cầu), `breakDone` có comment tiếng Việt trên dòng code (không phải UI label, không phạm thuật ngữ).

## Tóm tắt

| Mức | Số lượng | Tiêu điểm |
|---|---|---|
| CRITICAL | 1 | C1 — aside Phần 4 bị bóp mất nội dung ở mode visual (mapTable/pathExplode/prevChain) |
| MAJOR | 2 | M1 — scPrevSwing G frontier sai trạng thái; M2 — badge/✓ nhảy giật khi morph S4 |
| MINOR | 9 | finalScene thiếu badge F/H, guard biggest, exit CityGhosts, morph replay khi lùi, shots cũ, comment lệch… |

Toán toàn cục (diễn tiến chốt, relax, phản ví dụ, số liệu pruning 828/819/9/286/23/27>26) **sạch**. Hai vấn đề lớn nhất đều là render/scene-data, sửa nhỏ và cục bộ.
