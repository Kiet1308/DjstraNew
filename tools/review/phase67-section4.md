# Review Phase 6+7 — Phần 4 (S4Build, S4Prev, S4Debugger)

> Review 2 lăng kính: **kỹ thuật** (fold/rewind, tokenizer, typewriter, trace, autoplay, layout) + **sư phạm** (giả lập "Minh" — khán giả sáng dạ, chưa học DSA, xem livestream 1920×1080).
> Nguồn đối chiếu: `Plan.md` (Code panel Phần 4, Quy tắc thuật ngữ, Những điểm cố ý lệch, Debugger cuối Phần 4), `NoiDung.md` 78–231, 34 beat S4Build + 10 beat S4Prev + 34 frame debugger qua screenshot.

**Kết luận chung trước khi vào lỗi**: phần lõi làm ĐÚNG và làm TỐT. Fold thuần `buildCodeState` chuẩn (rewind-to-19 ≡ build-19; forward-back-to-27 ≡ 27-fresh trừ caret — đúng thiết kế). Trace khớp tính tay 100% (chốt A→C→G→E→D, B break; D 18→16→14; B giữ 16 khi chốt D kèm note "nhánh không làm gì cũng là một quyết định"; Prev B→E→C→A; 3+1 frame lần ngược). Mọi dòng code đều có beat NHU CẦU đứng trước (pattern `need()` phủ 100% trừ 2 chỗ cố ý). "đỉnh kề" được đặt tên kèm "kề = nối trực tiếp" TRƯỚC khi xuất hiện trong code. Hai cú callback đắt nhất (B=16-chưa-dám-dừng → `if min == end break`; B=16/20 → wrap) đều nổ đúng chỗ. Không lọt "Dijkstra"/"frontier" ra UI.

---

## CRITICAL

### C1. `Cost[đỉnh kề] = newCost` SAI THỤT LỀ ở S4Prev và toàn bộ Debugger — code trên màn sai cấu trúc

- **File**: `src/codepanel/codeScript.ts:153` (định nghĩa `setCost` indent 3) + `codeScript.ts:487-513` (`FULL_CODE` dùng lại object gốc)
- **Hiện tượng** (thấy rõ trong `debug-00/01/02`, `prev-7/8/9`): trong S4Build, op `wrap` cộng `indentDelta:1` vào BẢN SAO của `setCost` lúc fold → hiển thị đúng indent 4. Nhưng `FULL_CODE` của PREV_SCRIPT chèn lại object `setCost` GỐC (indent 3) → suốt S4Prev và TOÀN BỘ 34 frame debugger, dòng `Cost[đỉnh kề] = newCost` nằm NGANG HÀNG với dòng `if Cost[đỉnh kề] == null...` bọc nó, trong khi `Prev[đỉnh kề] = min` (indent 4) lại thụt sâu hơn.
- **Vì sao critical**: (1) Bài này đang DẠY Minh đọc cấu trúc code — thụt lề chính là ngôn ngữ hình của "dòng nào nằm trong dòng nào". Khối if hiển thị sai cấu trúc trong 2 slide liền. (2) Mâu thuẫn trực tiếp với lời dẫn beat prev-7: *"Thêm đúng một dòng, **ngay cạnh** chỗ ghi cost"* — trên màn hai dòng này lệch nhau một cấp, Minh sẽ hỏi "ơ sao dòng mới thụt sâu hơn, nó nằm trong cái gì?".
- **Fix** (1 dòng): trong `FULL_CODE`, thay phần tử `setCost` bằng `{ ...setCost, indent: 4 }`:
  ```ts
  // codeScript.ts — FULL_CODE
  ifBetterOpen,
  { ...setCost, indent: 4 },   // wrap ở BUILD đã thụt dòng này vào — giữ đúng trạng thái cuối
  ifBetterClose,
  ```
  (Cân nhắc thêm: dev-assert trong `validateScript` hoặc test so sánh `buildCodeState(BUILD_SCRIPT, cuối).lines` ≡ 25 dòng đầu của `FULL_CODE` cả về `indent` — chính loại lệch này sẽ bị bắt tự động.)

---

## MAJOR

### M1. Dấu `}` đóng hàm bị CẮT CỤT khi code lên 27 dòng (S4Prev beat ≥7 và mọi frame debugger)

- **File**: `src/codepanel/CodePanel.tsx:33-43` (panel `top:44, bottom:56, padding:'20px 18px', overflow:'hidden'`) + `CodeLineRow.tsx:58` (`minHeight:33`)
- **Hiện tượng**: 25 dòng (build-32/33) vừa khít. Thêm `Prev = []` + `Prev[đỉnh kề] = min` → 27 dòng thì tràn ~35-40px: `debug-00`→`debug-end` và `prev-7/8/9` đều cho thấy dòng cuối nhìn thấy là `return Prev` — dấu `}` của `fn-close` biến mất sau `overflow:hidden`.
- **Vì sao major**: cả slide debugger (slide chốt của Phần 4) chiếu một hàm không đóng ngoặc suốt 34 nhịp. Minh vừa được dạy "mỗi `{` có một `}`" qua từng beat dựng — giờ hình kết lại thiếu.
- **Fix**: lấy lại ~45px trong panel, ví dụ: `padding: '14px 18px'` (tiết kiệm 12px) + header `padding: '0 12px 12px'`, `marginBottom: 10` (tiết kiệm 12px) + `minHeight: 32`, bỏ `gap:1` (tiết kiệm ~26px ở 27 dòng). Kiểm tra lại build-33 (25 dòng) và debug-end (27 dòng) sau khi chỉnh.

### M2. Beat cầu nối "map là gì" (beat 1) chiếu NHẦM cảnh relax — hình kể chuyện khác lời

- **File**: `src/codepanel/codeScript.ts:195-207` (beat dùng `graphScene: scRelax`)
- **Hiện tượng** (`build-01`): lời dẫn nói *"map[C] = {A: 4, D: 12, E: 6} — đứng ở C thấy 3 ngả"*, nhưng hình bên phải là cảnh relax D: chỉ 2 cạnh A–C, C–D sáng (cạnh C–E thứ ba không nhấn), kèm mathOverlay **"4+12=16 < 18"** — một phép tính chưa hề được nhắc ở thời điểm này của slide. Plan yêu cầu *"mini-bảng `map[C] = {A:4, D:12, E:6}` cạnh đồ thị"* — hiện bảng này chỉ nằm trong chữ của callout.
- **Vì sao major**: đây là 1 trong 3 beat cầu nối quyết định Minh có đọc nổi `map[min]` và `map[min][đỉnh kề]` về sau hay không. Hình đang bắt Minh xử lý một phép so sánh lạc đề đúng lúc cần nó nhìn "C có 3 ngả → tra map[C] ra 3 dòng".
- **Fix**: tạo scene riêng:
  ```ts
  const scMapC: GraphSceneState = sceneBase({
    fog: { revealed: ['A', 'C', 'G', 'D', 'E'] },
    nodeStates: { A: 'locked', C: 'current', G: 'frontier', D: 'frontier', E: 'frontier' },
    edgeStates: { ...K_C_HIDDEN, CE: 'active', AC: 'active', CD: 'active' },
    costs: { A: 0, C: 4, G: 6, D: 16, E: 10 },
    weights: true,
  })
  ```
  và (đáng giá hơn nữa) render mini-bảng 3 dòng `A → 4 · D → 12 · E → 6` qua `extraRight` của `S4Layout` tại beat này — Minh nhìn bảng ↔ nhìn 3 cạnh sáng, "bảng tra" thành hình thật chứ không phải chữ.

### M3. S4Prev: ý tưởng ngây thơ Path[] và cái "thừa" của nó KHÔNG có hình — toàn bộ lập luận nằm trong chữ

- **File**: `src/codepanel/codeScript.ts:532-562` (beat 1-3 của PREV_SCRIPT chỉ có callout, không graphScene/extraRight mới)
- **Hiện tượng** (`prev-1`, `prev-2`): beat 1 nêu `Path[E] = [A, C, E], Path[B] = [A, C, E, B]` trong callout. Beat 2 lập luận *"lộ trình của B **chứa nguyên** lộ trình của E"* — nhưng lúc này 2 mảng ở beat 1 đã biến mất khỏi màn (callout bị thay), Minh phải NHỚ lại 2 dãy ngoặc vuông vừa đọc lướt để tự so. Đồ thị bên phải đứng yên suốt 4 beat.
- **Vì sao major**: đây là beat "hỏi trước khi phát kiến thức" của arc Prev — phần thưởng "chỉ cần nhớ MỘT bước" chỉ đã khi cái thừa được THẤY. Tinh thần dự án: hình phải trả lời "tại sao phải sửa chỗ này". So sánh: bên S4Build, cú wrap được đầu tư op riêng + cảnh riêng; bên này khoảnh khắc tương đương lại chay.
- **Fix**: thêm `extraRight` ở beat 1-3: hai hàng chip `Path[E] = A → C → E` và `Path[B] = A → C → E → B`, phần trùng `A → C → E` của hàng dưới được tô cùng màu/đóng khung ở beat 2 (kèm chữ nhỏ "chép lại y nguyên"), sang beat 3 hai hàng mờ đi, hiện cột `Prev[B]=E · Prev[E]=C · Prev[C]=A`. Đồng thời ở beat 3 cho 3 cạnh EB→CE→AC trên mini-graph nhấp sáng lần lượt theo chiều ngược — gieo trước hình ảnh "lần ngược" mà debugger sẽ gặt.

### M4. Callout NHÁY (fade-out rồi fade-in cùng một nội dung) ở MỌI cặp beat need→ops — ~16 lần trong S4Build

- **File**: `src/sections/s4-code/S4Layout.tsx:77-83` — `<Callout key={beat}>` trong `AnimatePresence mode="wait"`
- **Hiện tượng**: `need()` nhân đôi cùng một callout cho beat k (nói) và beat k+1 (gõ). Vì key theo `beat`, mỗi lần presenter bấm → sang beat ops, đoạn lời y hệt bị exit (0.4s bay lên) rồi enter lại (bay lên từ dưới). Trên livestream đây là cú nháy lặp ~16 lần ở slide dài nhất bài.
- **Fix**: cho key ổn định theo nội dung thay vì theo beat. Gọn nhất: `buildCodeState` đã có sẵn script — thêm vào `CodeState` một `calloutKey` = chỉ số beat ĐẦU TIÊN (đi lùi từ `upTo`) mà callout còn giữ nguyên reference, hoặc đơn giản hơn: trong `need()` gắn cùng một object callout cho cả 2 beat (hiện đã vậy — cùng reference!) rồi ở S4Layout dùng `key={state.callout === prevCallout ? giữ : beat}`. Cách ít xâm lấn nhất: so sánh reference qua `useRef` — nếu `state.callout` cùng reference với render trước thì giữ key cũ.

---

## MINOR

### m1. Nhiều con trỏ nhấp nháy cùng lúc khi chèn nhiều dòng; caret không tắt sau khi gõ xong

- **File**: `src/codepanel/CodeLineRow.tsx:102-112`
- `build-04` (2 caret), `build-06` (2), `build-10` (4 caret cùng nháy). Caret hiện NGAY từ đầu beat ở cả các dòng chưa đến lượt gõ (đang delay, width 0ch) và tồn tại vô hạn sau khi gõ xong. Một "máy chữ" chỉ nên có một con trỏ chạy lần lượt.
- **Fix**: chỉ render caret ở dòng đang gõ — ví dụ truyền `typeDelay`/`typeDur` vào một span caret có `animation-delay = typeDelay` và tự ẩn sau `typeDelay + typeDur + ~1.5s` bằng CSS keyframes (`opacity: 0` ở cuối, `fill-mode: forwards`), hoặc đơn giản: chỉ dòng fresh CUỐI CÙNG được caret.

### m2. `map[min][đỉnh kề]` — cú tra-bảng-hai-lần chưa được bắc cầu bằng ví dụ cụ thể

- **File**: `src/codepanel/codeScript.ts:394-405` (beat newCost)
- Beat cầu nối chỉ dạy `map[C] = {A:4, D:12, E:6}` (tra MỘT lần). Đến `newCost = Cost[min] + map[min][đỉnh kề]` Minh phải tự suy "tra hai lần liên tiếp". Callout nói *"tra bảng map là ra"* — đúng nhưng chưa chỉ tay.
- **Fix** (sửa lời, giữ tông): *"…— tra bảng hai nhịp: `map[C]` ra danh sách, hỏi tiếp ngăn `D` ra `12`. Viết liền: `map[C][D] = 12`. Y phép cộng ta làm trong sương: 4+12=16."*

### m3. Beat 11-12: khối quét min chèn LÊN TRÊN 2 mảnh giấy nhớ mà không một lời; `min = null` xuất hiện trước khi "quán quân tạm thời" được nhắc

- **File**: `src/codepanel/codeScript.ts:286-302`
- NoiDung.md:105 có đúng câu chuyển này: *"Tức là đầu tiên chọn đỉnh thử trước đã"* — bản dựng làm rơi. Minh thấy code mới đẩy 2 tờ giấy xuống mà không hiểu vì sao thứ tự lại thế; thấy `min = null` mà 3 beat sau mới gặp khái niệm "quán quân tạm thời" (beat 15).
- **Fix** (sửa lời beat 11): *"Vào việc chính — câu ①: 'chọn điểm đang mở có cost **bé nhất**'. Mà muốn biết bao giờ dừng thì phải **thử chọn trước đã** — nên việc chọn đứng TRÊN hai mảnh giấy. Máy không có mắt nhìn cả bàn cờ: nó **duyệt từng điểm một**, nuôi một 'quán quân tạm thời' tên là `min`."*

### m4. Beat "Đóng dấu ✓" (21-22) — hình không có gì được đóng dấu

- **File**: `src/codepanel/codeScript.ts:367-375` (dùng lại `scThreeStates`: G vẫn 'frontier')
- Lời nói "Đóng dấu ✓" nhưng cảnh là trạng thái TĨNH với G còn đang mở — không node nào chuyển frontier→locked. Cảnh `scMin` ngay trước đó (beat 15-16) vừa cho G thắng cuộc quét; mạch hình tự nhiên là G được đóng dấu.
- **Fix**: scene mới `scLockG` = `scThreeStates` nhưng `G: 'locked'` (và `costs` giữ nguyên) — Minh thấy đúng cú "min vừa thắng → ✓".

### m5. Beat 9-14: panel phải gần như đen kịt suốt 6 beat dày code nhất

- **File**: `codeScript.ts:264` (`graphScene: scStart` dính từ beat 8)
- `build-10`, `build-12`, `build-14`: chỉ một chấm A giữa màn đêm trong lúc Minh phải nuốt while + 2 placeholder + 3 tầng vòng quét. Hợp lý về "fiction" (đang ở vạch xuất phát) nhưng phí 40% màn hình ở đoạn cần hỗ trợ thị giác nhất.
- **Fix nhẹ**: từ beat 11 trở đi chuyển sang `scThreeStates` (đúng lời "duyệt từng điểm một" — có 5 điểm để duyệt) hoặc thêm hiệu ứng các node lần lượt nhấp sáng theo nhịp "duyệt".

### m6. Callout 26px (S4Layout) / note 24px (Debugger) — dưới chuẩn ≥28px chính Plan đặt ra

- **File**: `S4Layout.tsx:79` (`fontSize: 26`), `DebuggerSlide.tsx:103` (`fontSize: 24`)
- Plan: "callout ≥ 28px". Vẫn đọc được trên 1080p nhưng đây là tự phá chuẩn của mình; nếu không tăng được vì layout (M1 giải phóng chỗ sẽ giúp), ghi chú lại quyết định trong Plan.

### m7. VarsPanel: lóe sáng "ngược chiều" khi tua lùi

- **File**: `src/debugger/DebuggerSlide.tsx:21` (`prevFrame = TRACE[beat-1]` bất kể direction)
- Tua lùi từ frame k+1 về k: ô đổi giá trị trên màn là diff(k+1→k), nhưng ô lóe là diff(k-1→k) — có thể lóe một ô khác ô vừa đổi. Không sai dữ liệu, chỉ lệch tín hiệu.
- **Fix**: nhận `direction` từ SlideProps, khi `direction === -1` lấy `prevFrame = TRACE[beat+1]` (diff với frame vừa rời) hoặc tắt flash khi lùi.

### m8. Không có dev-assert ràng `frame.lineId` ∈ dòng của FINAL_CODE

- **File**: `src/debugger/trace.ts:248-255`
- Validator hiện bắt afterId/targetId/highlight của codeScript, nhưng nếu một `lineId` trong trace gõ nhầm (`'set-cost'` chẳng hạn) thì debugger chỉ lặng lẽ không highlight gì — đúng loại lỗi "lên sóng mới lộ".
- **Fix**: trong block DEV của trace.ts: `const ids = new Set(FINAL_CODE.lines.map(l => l.id)); for (const f of TRACE) if (!ids.has(f.lineId)) throw ...` (chuyển FINAL_CODE ra nơi import được, hoặc check trong DebuggerSlide).

### m9. Note các frame `min-set` giữa chừng chưa ngoại hóa phép SO SÁNH

- **File**: `src/debugger/trace.ts:142`
- `min = E (cost 10)` — Minh phải tự dò bảng Cost để hiểu vì sao E thắng. Một frame giữa chừng (ví dụ min=E) nên viết: *"Quét: E=10 bé nhất trong {E=10, D=16, F=18, H=20} → min = E."* — đúng kiểu "luôn chốt điểm đang mở có cost nhỏ nhất" được nhìn thấy một lần bằng số.

---

## NIT

1. **CHAR_MS trùng lặp**: `26` hardcode ở `CodePanel.tsx:25` (công thức delay) và `CodeLineRow.tsx:5` — đổi một nơi là lệch nhịp gõ nối tiếp. Export 1 hằng chung.
2. **`P` autoplay vẫn toggle khi Overview đang mở** (`DebuggerSlide.tsx:39-45` không biết `overviewOpen`) — autoplay có thể chạy ngầm sau lớp overview. Thêm check hoặc dừng play khi overview mở.
3. **ArrowRight khi đang autoplay = dừng + tiến 1 nhịp** — hành vi hợp lý (presenter giành lái là ưu tiên), nhưng nên ghi vào ghi chú presenter để khỏi bất ngờ "vì sao nó nhảy thêm 1 frame".
4. **S4Prev beat 8 (morph return) gõ và nói cùng beat** — lệch nhẹ pattern need→ops, chấp nhận được vì "nhu cầu" đã treo từ beat 0 của slide ("trả về con số chứ chưa trả về con đường") và morph chính là cú trả nợ; không cần sửa.
5. **Bộ screenshot đủ**: prompt nhắc build-34/prev-10 nhưng kịch bản có đúng 34 beat (00–33) và 10 beat (0–9) — không thiếu hình, chỉ lệch kỳ vọng đếm.

---

## Xác nhận các hạng mục ĐẠT (để khỏi sửa nhầm chỗ không hỏng)

| Hạng mục | Kết quả |
|---|---|
| Fold thuần / rewind | ✓ rewind-to-19 ≡ build-19; forward-back-to-27 ≡ 27-fresh (khác đúng mỗi caret — by design) |
| `freshIds` chỉ từ beat cuối; wrap giữ id + thụt lề (trong BUILD) | ✓ build-29: 3 dòng if/setcost/} đúng cấu trúc, setcost giữ id |
| Validator | ✓ bắt afterId/targetId sai, id trùng, id tái sử dụng, highlight mồ côi (thiếu mỗi m8) |
| Tokenizer tiếng Việt | ✓ `đỉnh`, `kề` 2 ident — render liền mạch tự nhiên; NFC tại nguồn (`L()` + morph); keyword `và/hoặc/not` tô đúng; comment/number/string đúng màu trên mọi screenshot |
| Typewriter | ✓ delay nối tiếp đúng thứ tự dòng; tắt khi direction −1 và ở prev beat 0; `0ch→Nch` + `whiteSpace:pre` không vỡ dòng |
| Trace vs tính tay | ✓ toàn bộ (chốt A,C,G,E,D + B-break; D 18→16→14; 14+6=20>16 giữ B; 34 frame; 3+1 traceback) |
| Mô hình "cạnh chỉ lộ khi một đầu đã chốt" | ✓ `makeScene` (visited[from]‖visited[to]) khớp fiction Phần 3; các scene tay trong codeScript cũng nhất quán (FB ẩn đến tận scFull vì F không bao giờ chốt) |
| Notes bắt buộc theo Plan | ✓ Cost[start]=0 ở frame đầu; "ĐÍCH ĐƯỢC CHỐT → giờ mới dừng"; "nhánh không làm gì cũng là một quyết định" |
| Autoplay | ✓ P toggle, phím khác dừng, interval cleanup theo beat, dừng ở frame cuối không tràn sang S5 |
| Thuật ngữ / spoiler | ✓ "đỉnh kề" đặt tên trước khi vào code; pin 3 câu khớp S3 kèm câu ② đã vá; "frontier" chỉ là tên state nội bộ; "Dijkstra" chỉ ở S5Reveal |
| Sư phạm: need→ops | ✓ 100% dòng code có lý do đứng trước (2 ngoại lệ đều cố ý: setCost-ngây-thơ phục vụ cú "Khoan!", morph return là cú trả nợ) |
| Callback "thấy B=16 chưa dám dừng" + B=16/20 ở wrap + "xét lại A" 4+4=8>0 | ✓ cả ba, đúng beat, đúng scene |
| Traceback khép vòng "tư duy ngược" | ✓ 3 frame hỏi-ngược thắp từng đoạn + frame lật danh sách "A → C → E → B = 16 — khép tròn" |
