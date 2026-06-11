# Phase 4+5 — Review Sections 1–2 (kỹ thuật + audit sư phạm "Minh")

Reviewer scope: `src/sections/s1-intro/*`, `src/sections/s2-brute/*`, `src/explosion/*`, `src/graph/{TravelerDot,usePointAlongPath,mapDecor}.tsx`, tích hợp `src/deck/deck.ts`; screenshots `tools/shots/s12/*.png`. Nguồn chân lý: `Plan.md` (kịch bản beat Phần 1–2, quy tắc thuật ngữ/chống spoiler) + `NoiDung.md:16-49`.

Số liệu đã verify độc lập (chạy lại enumeration bằng script ngoài, không tin code): bigGraph có đúng **828** đường đơn S→T; pruning mô phỏng đúng thứ tự DFS cho **819 cắt / 9 đi trọn / best 21**; cityGraph có đúng **8** đường đơn A→B (ACEB=16, ACEDB=20, ACDB=22, AGFB=22, ADB=24, ACDEB=26, ADEB=28, ADCEB=42); tổng các tuyến trong S2TryAll khớp trọng số thật (A→D→B=24, A→C→D→B=22, A→C→E→B=16).

Tổng kết: **0 CRITICAL · 3 MAJOR · 8 MINOR · 6 NIT**. Khung sư phạm lớn đều ĐẠT: thứ tự khái-niệm-trước-tên-gọi ở beat CHI PHÍ, mẫu HỎI-TRƯỚC ở pruning, lời thú nhận trung thực "vẫn phải thử nốt", cú pivot "đổi câu hỏi" không spoil Phần 3. Các vấn đề còn lại là defect hiển thị khi tua + 2 chỗ kịch tính bị non so với plan.

---

## MAJOR

### M1. ExplosionScene không reset khi rời beat đếm → counter/vệt màu "đông cứng dở dang" khi lùi về beat 0; và counter "0 tuyến đã thử" lộ sau callout ngay lượt chạy xuôi bình thường

- **File**: `src/explosion/ExplosionScene.tsx:58-72` (effect reset chỉ chạy khi `running && !settled`), `:74-80` (effect settled chỉ chạy khi `settled`), `:196-224` (khối counter render vô điều kiện); `src/sections/s2-brute/S2Explosion.tsx:52-54`.
- Hai biểu hiện:
  1. **Luôn xảy ra** (bằng chứng `explosion-0.png`): ở beat 0 counter "0 tuyến đã thử" vẫn render giữa đỉnh màn, bị callout (zIndex 20 > 10) đè một nửa — chữ "…n đã thử" thò ra sau mép callout, số "0" lờ mờ sau nền blur. Trông như lỗi layout trên livestream, ngay pass xuôi đầu tiên.
  2. **Khi tua**: đang đếm dở ở beat 1 (vd 317) bấm `←` về beat 0 → `running=false, settled=false` → KHÔNG effect nào chạy → counter giữ nguyên "317" + 8 path pool đứng hình giữa nét vẽ, màu mè ngay trên beat "bản đồ to hơn một chút". Vi phạm thẳng yêu cầu Plan.md ("lùi beat ra trạng thái lắng", mục 5 thứ tự triển khai).
- **Fix đề xuất** (gộp cả hai): thêm nhánh reset cho trạng thái "chưa chạy":
  ```tsx
  // ExplosionScene — thay effect reset hiện tại
  useEffect(() => {
    if (!running && !settled) {
      state.current.count = 0
      state.current.done = false
      if (counterRef.current) counterRef.current.textContent = '0'
      for (const el of slotRefs.current) el?.setAttribute('stroke-opacity', '0')
    }
    ...
  }, [running, settled])
  ```
  và ẩn hẳn khối counter khi chưa vào cuộc: `style={{ opacity: running || settled ? 1 : 0, transition: 'opacity .4s', ... }}` trên div counter (`:198`). Beat 0 sẽ sạch như thiết kế.

### M2. Beat freeze của S2Pruning thiếu "con số tổng đỏ dần vượt mốc" — đồng hồ hiện sẵn "đã đi: 18 > 16" màu đỏ TRƯỚC cả khi lữ khách tới nơi

- **File**: `src/sections/s2-brute/S2Pruning.tsx:94-123` (FrozenMeter tĩnh, hiện sau 0.4s), `:213-221` (traveler chạy 1800ms).
- Plan.md:166 quy định trình tự cảm xúc: *"freeze traveler giữa một tuyến, **con số tổng đỏ dần vượt mốc best-so-far** → 'tuyến này còn đáng đi tiếp không?'"*. Hiện tại Minh thấy ngay từ giây 0.4 một cái hộp đỏ chót ghi sẵn phép so sánh "18 > 16" trong khi chấm đỏ còn đang bò giữa đường (shot `prune-0.png` chụp sau khi tới, nhưng 1.4s đầu của beat là trạng thái lệch pha này). Cái đồng hồ nhảy số dần — 10… 14… **16 vượt mốc, chuyển đỏ**… 18, khựng — chính là thứ làm khán giả TỰ bật ra "dừng lại đi!" trước khi presenter hỏi. Mất nó là mất nửa kịch tính của khoảnh khắc đắt nhất Phần 2.
- **Fix đề xuất**: cho FrozenMeter đếm theo tiến độ của dot (cùng duration 1800ms), trắng → đỏ khi vượt 16:
  ```tsx
  function FrozenMeter({ animate }: { animate: boolean }) {  // animate = beat===0 && direction===1
    const ref = useRef<HTMLSpanElement>(null)
    const over = useRef(false) // đổi border/màu khi vượt 16 (ghi class/style trực tiếp)
    useRafLoop(animate, (_dt, t) => {
      const v = Math.min(18, (t / 1800) * 18)
      if (ref.current) ref.current.textContent = `đã đi: ${Math.round(v)}`
      ...khi v > 16 lần đầu: thêm ' > 16', flip màu đỏ...
    })
    // animate=false (beat>0 / direction===-1): render thẳng "đã đi: 18 > 16" đỏ — trạng thái lắng
  }
  ```
  Giữ nguyên callout hỏi (presenter nói đè lên lúc số đang nhảy là hợp lý), hoặc trễ callout ~1.2s cho khớp nhịp.

### M3. Chip "Tốt nhất hiện tại" biến mất suốt lúc traveler chạy — sổ kỷ lục vắng mặt đúng lúc Minh cần nó để so sánh

- **File**: `src/sections/s2-brute/S2TryAll.tsx:175-198` — `key={`best-${def.best}`}` + motion.div **không có prop `exit`**.
- Khi sang beat có kỷ lục mới (24→22, 22→16): AnimatePresence thấy key đổi, chip cũ unmount **tức thì** (không exit), chip mới `initial opacity 0` nằm chờ delay 2.3s. Hệ quả: trong toàn bộ 2.4s traveler chạy tuyến mới, góc phải KHÔNG có con số kỷ lục nào — Minh không có mốc để ngầm so "tuyến này đang đấu với 22". Mà chính thao tác "vừa đi vừa liếc kỷ lục" là móng cho S2Pruning ("đồng hồ 18 — mà kỷ lục đang là 16"). Sổ sách best-so-far được lập rất tốt ở beat 1 ("Ghi sổ: tốt nhất hiện tại = 24") nhưng bị chính animation phá ở các beat sau.
- **Fix đề xuất**: chip luôn hiển thị kỷ lục CŨ trong lúc chạy, chỉ nhảy số khi traveler về đích — bỏ key theo best, animate phần số bên trong:
  ```tsx
  const shownBest = def.running >= 0 && direction === 1
    ? BEATS.at(beat - 1).best   // kỷ lục trước chuyến đi
    : def.best
  // ...một chip duy nhất (key cố định 'best'), bên trong:
  // <motion.span key={shownBest→def.best sau delay 2.3s> — hoặc đơn giản:
  // setTimeout-free: render shownBest, và thêm motion.span keyed bởi def.best
  // với delay 2.3 đè lên (crossfade số cũ → số mới, chip không biến mất)
  ```
  (Cách rẻ nhất giữ nguyên cấu trúc: thêm `exit={{ opacity: 0 }}` + `<AnimatePresence mode="popLayout">` vẫn chưa đủ vì cũ sẽ thoát ngay khi key đổi — phải tách "khung chip" khỏi "con số".)

---

## MINOR

### m1. Hộp counter "819 bị cắt giữa chừng" đè lên điểm E (beats 2–3 S2Pruning)

- **File**: `src/sections/s2-brute/S2Pruning.tsx:186` (`top: 90`); bằng chứng `prune-2.png`, `prune-3.png` — node E (1045,240) thò nửa thân dưới đáy hộp đỏ, nhãn "E" bị nuốt.
- Hộp cao ~135px → đáy ≈ 225, chạm rect node E (mép trên ≈ 206). Dù đồ thị đã dim 0.3 vẫn trông cẩu thả trên 1080p.
- **Fix**: `top: 56` (đáy ≈ 191, thoát hẳn E), hoặc dim đồ thị xuống 0.15 ở beat counter.

### m2. "Ta mới thử 4" đếm lẫn chuyến ngõ cụt vào "8 tuyến tới đích" — Minh tinh ý sẽ vặn

- **File**: `src/sections/s2-brute/S2TryAll.tsx:112-118`.
- 8 tuyến là 8 đường đơn **tới đích** (đã verify). Trong 4 lượt thử có 1 lượt A→G→H là ngõ cụt, không thuộc 8 tuyến đó → "mới thử 4 (trong 8)" lệch sổ sách: thực đo được 3/8.
- **Reword** (giữ giọng mộc, còn nhấn thêm cái giá của ngõ cụt):
  > "Bản đồ đồ chơi này có cả thảy **8** tuyến tới đích. Đi 4 chuyến mới đo xong **3** — còn tốn nguyên một chuyến đâm ngõ cụt. Thành phố **thật** thì sao?"

### m3. S2StillSlow dòng 1 lặp gần nguyên văn S2Pruning beat 3 — hai beat liền kề nói cùng một câu

- **File**: `src/sections/s2-brute/S2StillSlow.tsx:16-24` vs `src/sections/s2-brute/S2Pruning.tsx:80-88` (cùng "lần theo từng nhánh" + "vẫn là 828").
- Nhắc lại khi chuyển slide là chấp nhận được, nhưng nguyên văn thì presenter sẽ tự nghe mình nói lại. Đề xuất cho l0 lùi một bước thành câu tổng kết-có-nhịp:
  > "Cắt nhánh là một bước tiến thật — mỗi chuyến đi ngắn hẳn. Nhưng cái danh sách phải lần qua vẫn dài **828** dòng."

### m4. Explosion không thể chạy lại theo chiều xuôi trong cùng phiên slide (`doneRun` dính vĩnh viễn)

- **File**: `src/sections/s2-brute/S2Explosion.tsx:52-54`.
- Sau khi đếm xong, lùi về beat 0 rồi tiến lại beat 1 → `doneRun=true` → settled ngay, hiện 828 tĩnh. Màn đếm là "money shot"; presenter muốn diễn lại (khán giả vào trễ, demo lại) phải nhảy hẳn sang slide khác rồi quay về — không ai nhớ nổi mẹo đó lúc live.
- **Fix**: `useEffect(() => { if (beat === 0) setDoneRun(false) }, [beat])` — đứng ở beat 0 là "lên đạn lại", tiến vào beat 1 luôn chạy tươi; lùi từ beat 2 về 1 vẫn settled nhờ `direction === -1`.

### m5. PruneCounters lóe "0 / 0" một frame khi đến beat 3 theo chiều lùi (từ S2StillSlow quay về)

- **File**: `src/sections/s2-brute/S2Pruning.tsx:131-139` — set textContent trong `useEffect` (chạy SAU paint); span khởi tạo là chuỗi `'0'`.
- Slide remount tại beat 3, `active=false` → frame đầu vẽ "0/0", frame sau mới thành 828/819. Trên OBS 60fps đủ thấy nháy.
- **Fix**: đổi `useEffect` → `useLayoutEffect` (chạy trước paint), giữ nguyên logic.

### m6. Ngõ cụt thiếu nhịp "chững lại" tại H — plan tả "chững lại, quay đầu", hiện tại dot quay xe mượt như đã biết trước

- **File**: `src/sections/s2-brute/S2TryAll.tsx:27` (route `['A','G','H','G']` tốc độ đều), Plan.md:164.
- Cú khựng ở H chính là khoảnh khắc "ơ, hết đường" — nó dạy khái niệm "đường không dẫn đến đích" bằng cảm giác chứ không bằng lời. Tốc độ đều làm mất cái "ơ".
- **Fix gọn** (không sửa TravelerDot): vì điểm H nằm tại progress ≈ (len(AG)+len(GH))/total của polyline, dùng route 2 pha là sạch nhất — thêm prop tùy chọn `holdAt?: {t: number; ms: number}` cho TravelerDot: trong `useAnimationFrame`, nếu progress vượt `t` lần đầu thì giữ `t` trong `ms` mili-giây (cộng bù vào startRef). Khoảng 10 dòng, vẫn thuần ref.

### m7. Nét "pruned" của ED/DB quá kín đáo — plan muốn "nhánh cắt flash xám-đỏ"

- **File**: `src/graph/GraphEdge.tsx:37` (pruned = đỏ mờ 0.45, tĩnh), kịch bản `S2Pruning.tsx:44-48`; bằng chứng `prune-1.png` — phải nhìn kỹ mới thấy 2 đoạn hơi đỏ sau D.
- Đây là beat "CẮT NHÁNH" — hành động cắt phải nhìn thấy được từ hàng ghế cuối stream. Đề xuất: khi edge chuyển sang `pruned`, animate keyframe `opacity: [1, 0.2, 0.45]` + `stroke: [var(--red), var(--red-dim)]` (flash một nhịp rồi lịm), và/hoặc vẽ dấu ✕ nhỏ tại trung điểm đoạn bị cắt. Chỉ cần trong `GraphEdge` nhánh style `pruned` dùng `animate` dạng mảng là đủ.

### m8. Fallback gate hint của HUD chứa "đỉnh trên đồ thị" — không slide nào định nghĩa `gateHint` nên đây là chuỗi THẬT sẽ hiện ở các gate S3

- **File**: `src/deck/ProgressHUD.tsx:64` (`slide.gateHint ?? 'click đỉnh trên đồ thị'`); grep toàn `src/sections` không có `gateHint:` nào.
- Với Phần 1–2: không có gate → không lộ, không vi phạm. Nhưng gate đầu tiên (S3FogWalk) nằm SAU beat morph đặt tên nên hiện tại "thoát nạn" nhờ may mắn thứ tự. Quy tắc thuật ngữ là luật cứng — đừng để nó phụ thuộc thứ tự beat.
- **Fix**: đổi mặc định thành `'click một điểm trên hình'` (trung tính, đúng ở mọi phần).

---

## NIT

### n1. PruneCounters: vòng rAF không tự tắt sau khi đếm xong

- `S2Pruning.tsx:141-148` — điều kiện `state.current.v < BIG_TOTAL` chỉ được đọc lúc render; đếm xong không có re-render nào nên loop chạy suốt beat 2, mỗi frame ghi lại cùng một textContent (mutate text node → việc vặt cho compositor). Thêm `if (s.v >= BIG_TOTAL) return` đầu callback là đủ lịch sự.

### n2. TravelerDot khi `pinToEnd` vẫn sample đường mỗi frame

- `TravelerDot.tsx:48-57` — `sample(1)` + set MotionValue 60 lần/giây cho một chấm đứng yên. Vô hại, nhưng có thể set một lần trong effect theo `[pinToEnd, d]`.

### n3. Chip tuyến thứ 4 sát đầu pin ĐÍCH (`tryall-5.png`)

- Cột chip (right:70, top:70) kết thúc ~y350; đầu pin B ~y357 — chạm nhau về thị giác dù chưa đè. Nếu thêm tuyến thứ 5 vào sổ là đè thật. Phòng xa: giảm `gap` 14→10 hoặc font 22→21.

### n4. Tổng 24/22/16 ở S2TryAll không có đơn vị — chủ ý đúng (chi phí trừu tượng sau beat CHI PHÍ), nhưng nên có 1 câu thoại đỡ

- Beat 4 của S1Maps đã hợp thức hóa "đo kiểu gì không quan trọng"; dù vậy lời dẫn beat 0 S2TryAll nên kèm nửa câu của presenter: "từ giờ ta đo bằng một con số chi phí chung". Không cần sửa code — ghi vào script nói.

### n5. Đồng hồ "đã đi: 18" tại D vô tình lộ đúng trọng số cạnh A–D=18 trước Phần 3

- Quy tắc "KHÔNG hiện trọng số từng cạnh" (Plan.md:164) bị hé một góc vì tuyến đóng băng chỉ gồm đúng 1 cạnh. May là nhất quán: S3FogWalk beat 3 sẽ công bố chính D=18, không mâu thuẫn, không phá gate nào. Chấp nhận được; nếu áp fix M2 (đồng hồ nhảy dần) thì cảm giác "số đo trên đường" còn át luôn cảm giác "trọng số cạnh".

### n6. `useRafLoop(running && !settled && !state.current.done, …)` đọc ref lúc render

- `ExplosionScene.tsx:82` — vòng lặp chỉ dừng được nhờ chuỗi `onDone → setDoneRun → settled` ở cha; nếu mai này ai dùng ExplosionScene mà không truyền `onDone`, loop sẽ chạy rỗng vĩnh viễn. Thêm 1 dòng comment cảnh báo, hoặc cho `s.done` chặn ngay trong callback là đủ (đã có `if (s.done) return`).

---

## PASS — những điểm đã kiểm và đạt

**Kỹ thuật**
- `useRafLoop` StrictMode-safe: cleanup hủy frame, `cbRef` luôn bản mới (`useRafLoop.ts:7-28`) ✓
- Pool 8 path tái sử dụng, counter ghi `ref.textContent`, KHÔNG setState trong vòng rAF ✓; bước nhảy `+8 mod 828` không bao giờ cho 2 slot trùng tuyến cùng lúc ✓
- Counter ramp 1.2/s → trần 2000/s (~33/frame), kẹp đúng **828**, `onDone` bắn đúng 1 lần (`s.done` guard) ✓; tổng thời gian đếm ~6s — nhịp tốt cho live
- Số liệu trung thực 100%: 828/819 từ enumeration thật; logic `simulatePruning` (cắt khi prefix ≥ best theo đúng thứ tự duyệt, best chỉ cập nhật sau khi đi trọn) là mô hình đúng của thử-tất-cả-có-cắt-nhánh ✓
- Path đo của TravelerDot dùng `opacity: 0`, không `display:none` (`TravelerDot.tsx:82`) ✓; `pinToEnd` đúng ngữ nghĩa lùi ở cả S1Maps (`direction === -1`), S2TryAll (`direction === -1`), S2Pruning (`beat > 0 || direction === -1`) ✓; PREV xuyên slide rơi vào beat cuối với direction −1 → mọi beat lùi của S1/S2 đều lắng (trừ M1)
- Chip delay 2.2–2.45s vs duration 2400–2600ms: các failure mode đã soi (bấm `→` giữa run, lùi giữa run) đều rơi về trạng thái hợp lệ nhờ AnimatePresence keyed ổn định — chỉ còn M3 ở trên
- `scene.weights` falsy ở mọi scene Phần 1–2 (sceneBase không set, không chỗ nào truyền `weights: true`); `GraphEdge` chỉ vẽ chip số khi `showWeight` ✓ — không trọng số cạnh nào lọt ra
- Grep UI text Phần 1–2: không "đỉnh/cạnh/đồ thị" (chỉ trong comment code), không "Dijkstra", không "frontier", không "sai" ✓ (trừ fallback m8 thuộc HUD chung)

**Sư phạm (đi từng beat trong vai Minh)**
- S1Maps: 3 thước đo cụ thể (THỜI GIAN/QUÃNG ĐƯỜNG/TIỀN XĂNG) đi TRƯỚC, "gọi chung là CHI PHÍ" đến SAU — đúng nguyên tắc tên-gọi-sau-khái-niệm; beat "Vậy… làm thế nào?" phủ tối toàn màn là một dấu chấm hỏi treo đúng nghĩa ✓
- S2TryAll: "thử tất cả" được đặt như phản xạ tự nhiên đầu tiên ✓; ngõ cụt A→G→H dạy "đường không dẫn đến đích" bằng hình ✓; "Ghi sổ: tốt nhất hiện tại" lập sổ kỷ lục tường minh (móng của pruning) ✓; beat 4 thú nhận trung thực "muốn chắc chắn… vẫn phải thử nốt" ✓
- S2Explosion: con số 828 là số THẬT đếm trước mắt khán giả, cú sốc có nền tảng; beat ngoại suy chỉ nói định tính "nhân lên / không lớn theo kịp" — không bịa số ✓; lời bình được GIẤU đến khi counter đếm xong, không phá twist ✓
- S2Pruning: mẫu HỎI-TRƯỚC đạt — b0 chỉ hỏi "còn đáng đi tiếp không?" (đưa đủ dữ kiện 18 vs 16 để suy luận, không đưa kết luận), b1 mới chốt "CẮT NHÁNH" ✓; b2 ăn mừng bằng số thật, b3 lập tức tự vấn lại — đường dây dẫn sang StillSlow mạch lạc ✓
- S2StillSlow: chuyển đúng tội từ "đôi chân chậm" sang "CÂU HỎI sai" — đây là cú pivot trí tuệ thật sự của Phần 2; "đừng hỏi về những con đường nữa" dừng đúng một bước trước khi lộ "hỏi về các điểm" — không spoil S3; teaser "quay ống kính" khớp lời mở S3LookFromB ✓
- Nhịp: ~16 beat cho cả Phần 2, không beat nào rỗng; beat đếm 6s và beat đóng băng là 2 điểm dừng thở tốt cho presenter
