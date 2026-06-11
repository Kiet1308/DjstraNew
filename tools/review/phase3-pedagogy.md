# Audit sư phạm Phase 3 — giả lập "Minh" (sáng dạ, tò mò, chưa học DSA) xem livestream 1920×1080

Nguồn đối chiếu: `Plan.md` (Quy tắc thuật ngữ, kịch bản beat S3, Verification cuối), `NoiDung.md`,
code 5 slide trong `src/sections/s3-reverse/`, ảnh chụp `tools/shots/s3/`.

Tinh thần chấm: mỗi beat phải SUY RA được từ beat trước; khái niệm có NHU CẦU trước TÊN GỌI;
ở gate phải SUY LUẬN được, không đoán mò; hình phải trả lời "vì sao", không trang trí.

**Tổng kết: 1 CRITICAL · 4 MAJOR · 9 MINOR.**

---

## CRITICAL

### C1. Beat "đường lẻn" (cut property) — hình vẽ NGƯỢC với lập luận đang nói
**Vị trí**: `S3FogWalk.tsx` beat 8 (`phantom.points`, `mathOverlays`) + tái dùng ở `S3Invariant.tsx` beat 2 (`replayScene`). Ảnh: `fog-8.png`, `invariant-2.png`.

Đây là beat "VÌ SAO" duy nhất của cả màn sương — được show 1 lần rồi nhắc lại 2 lần (đáp án gate 3, quy luật ở Invariant). Nó phải thuyết phục tuyệt đối. Nhưng:

- **Lời** nói: *"vùng tối chỉ có một lối vào: chui qua một điểm sáng đang mở (E=10 hoặc D=16)"*.
- **Hình** lại vẽ: đường đỏ xuất phát từ A **lặn thẳng xuống vùng tối** (vòng dưới G, men đáy màn hình) — tức là nó vào vùng tối mà KHÔNG qua cửa nào — rồi mới "chui ra" ở D, với overlay *"chui ra ở đây → đã tốn ≥ 16"*.

Minh nhìn hình sẽ hỏi đúng câu chí mạng: *"Ơ, đường này lẻn vào vùng tối ngay từ A, có qua cửa E/D nào đâu?"* — chính bức hình phản chứng lại quy tắc nó đang minh họa. Tệ hơn, hình còn mâu thuẫn với luật chơi đã thiết lập: đứng ở A ta đã **thấy hết** các đoạn rời A (beat 2: "thấy 3 đoạn nối rời A"), nên không thể có lối ẩn rời A đi thẳng vào sương. Lời nói "lối **vào**", overlay nói "chui **ra**" — vào/ra lẫn lộn nốt.

(Plan.md dòng 194 tả đúng chiều: đường lẻn "BẮT BUỘC chui ra khỏi **vùng sáng** tại một điểm đang mở" — tức rời vùng sáng qua cửa, RỒI mới lang thang trong tối. Code làm ngược lại.)

**Sửa (hình)**: cho phantom đi đúng kịch bản suy luận:
1. Rời A bằng cạnh đã biết, đi trong vùng sáng: A → C → E (bám theo cạnh thật).
2. `crossAt` đặt tại **E** [1070, 265] — khoảnh khắc "bước qua cửa".
3. Từ E mới lặn vào vùng tối, vòng vèo (vd [1450, 420] → [1300, 760] → [900, 900]) rồi đâm về G [545, 815].
4. `mathOverlay` đặt tại E: `"bước qua cửa này → đã tốn ≥ 10"`.

Áp dụng y hệt cho `replayScene` trong `S3Invariant.tsx`.

**Sửa (lời)** — giữ giọng mộc:
> "Cho một đường <đỏ>'lẻn'</đỏ> từ A đến G xem. Muốn lang thang trong vùng tối thì trước hết phải **chui được vào** — mà vùng tối **không có cửa sau**: lối vào duy nhất là bước qua một điểm sáng đang mở (E=10 hoặc D=16). Mới đặt chân đến cửa đã tốn ≥ 10 > 6 rồi, đi tiếp chỉ dài thêm — nên G=6 **không thể bị soán ngôi**."

Lời ở Invariant beat 2 ("mọi ngả khác đều phải chui qua một điểm đang mở có cost **không nhỏ hơn**") đã chuẩn, giữ nguyên — chỉ cần hình khớp.

---

## MAJOR

### M1. Gate 3: overlay phản ví dụ NUỐT click vào H — màn loại trừ trên sân khấu bị gãy
**Vị trí**: `S3FogWalk.tsx`, div overlay phản ví dụ (`left: 360, right: 360, bottom: 86, zIndex: 25`). Bằng chứng: `fog-10-try-H.png` **giống hệt** `fog-10-try-F.png` (vẫn ghost E–F và lời "E–F = 3?").

H nằm ở [880, 965] — lọt đúng vùng overlay callout đáy màn hình. Khi presenter click F (callout F hiện ra) rồi click tiếp H theo kịch bản loại-trừ-từng-ứng-viên, cú click bị callout chặn: không có phản hồi gì, phản ví dụ của F vẫn treo. Trên livestream đây là khoảnh khắc đứng hình — và Minh sẽ tưởng phản ví dụ của F là "dành cho H".

**Sửa**: thêm `pointerEvents: 'none'` cho div bọc overlay (callout chỉ để đọc, không cần nhận chuột). Chạy lại `tools/shoot-s3.mjs` xác nhận `fog-10-try-H.png` hiện đúng ghost E–H "5?" và lời "10+5 = 15 < 20".

### M2. S3Dependencies beat 5: mũi tên đảo chiều nhưng "cách đọc" không đảo theo
**Vị trí**: `S3Dependencies.tsx` beat 5 (`reversed: true`). Ảnh: `deps-4.png`.

Beat 1 đã dạy Minh quy ước rất rõ: *"Mũi tên tím đọc là **'cần biết trước'**"*. Sang beat 5 mũi tên quay đầu (A → C, A → G, A → D) mà không ai nói lại cách đọc. Minh áp quy ước cũ sẽ đọc thành *"A cần biết C trước"* — ngược hẳn ý đồ. Một quy ước thị giác đã được đặt tên thì khi đổi nghĩa phải đặt tên lại.

**Sửa lời** beat 5:
> "Vậy lật ngược ván cờ: thay vì đứng ở B hỏi xuống, ta đứng ở A và **XÂY câu trả lời đi lên** — mũi tên cũng lật theo, giờ đọc xuôi: **'A đã chắc — lan sang điểm bên cạnh'**. Câu hỏi: điểm nào chắc chắn **TIẾP**?"

(Tùy chọn thêm: đổi màu/đầu mũi tên ở trạng thái reversed để mắt thấy "đây là loại mũi tên khác".)

### M3. S3Dependencies beat 4 vs beat 5: vừa tìm thấy "đáy" xong lại bảo "không có đáy"
**Vị trí**: `S3Dependencies.tsx` beat 4–5. Ảnh: `deps-3.png`, `deps-4.png`.

Beat 4 chốt: *"mọi câu hỏi đều dồn về đúng một điểm — A… điểm DUY NHẤT ta chắc chắn 100%"* — tức chuỗi câu hỏi CÓ điểm tựa, là A. Beat 5 mở màn: *"đứng ở B hỏi xuống — **chuỗi câu hỏi không có đáy**"*. Minh tinh ý sẽ vấp: "vừa bảo nó dồn hết về A — A chính là đáy còn gì?". Hai beat tự cãi nhau ngay tại khúc quặt quan trọng nhất (lý do phải đảo chiều).

**Sửa lời** beat 5 (bỏ "không có đáy", thay bằng hình ảnh câu hỏi đẻ câu hỏi):
> "Vậy lật ngược ván cờ: đứng ở B hỏi xuống thì **câu hỏi đẻ ra câu hỏi**, chồng chéo cả tấm bản đồ — trong khi chỉ có đúng MỘT chỗ cho sẵn câu trả lời: A. Vậy ta đứng ở A và XÂY câu trả lời đi lên…"

(Nếu nhận finding M4 bên dưới thì có thể dùng chữ "quay vòng" thay "chồng chéo" — càng đắt.)

### M4. S3Dependencies beat 2: "các điểm nối ngay trước nó — A, C, E" lờ tịt B đang hiện trên hình
**Vị trí**: `S3Dependencies.tsx` beat 2. Ảnh: `deps-1.png`.

Trên hình, D có 4 đoạn nối: A, C, E **và B**. Lời chỉ kể "A, C, E". Minh nhìn hình tự kiểm được ngay và sẽ hỏi: *"Sao không cần tốt nhất đến B? D nối với B mà."* Chữ "ngay trước nó" đang ngầm giả định chiều đi về B — thứ chưa được định nghĩa. Đây là chỗ "phát kiến thức" trá hình: người dẫn tự lọc hộ khán giả.

**Hai phương án sửa** (khuyến nghị A — biến lỗ hổng thành động cơ):

- **(A)** Thừa nhận vòng lặp, dùng nó làm thuốc nổ cho beat 5:
  > "Mà muốn tốt nhất đến D? Lại cần tốt nhất đến các điểm nối quanh nó — A, C, E… và khoan, **cả B nữa**?! B cần D, mà D lại cần B — câu hỏi **quay vòng**, hỏi kiểu này không xong được. Càng thấy rõ: phải tìm một đầu mối chắc chắn mà đứng."

  (thêm mũi tên D→B mờ + dấu "?" trên hình; beat 5 đổi "chồng chéo" → "quay vòng" cho ăn khớp)
- **(B)** Tối thiểu — gạt B đi một cách có lý do:
  > "…các điểm nối quanh nó — A, C, E (còn B thì khỏi hỏi: chính B đang là đề bài)."

### M5. (đã gộp vào C1 phần Invariant — giữ số mục để tiện đối chiếu review trước)
Hình replay ở `S3Invariant.tsx` beat 2 kế thừa nguyên si lỗi hình C1; sửa C1 xong phải sửa cả `replayScene`, đừng quên — đây là lần "vì sao" được nhắc lại cuối cùng trước khi phát biểu quy luật.

---

## MINOR

### m1. Tên "cost" hiện ra mà không bắc cầu từ "chi phí"
**Vị trí**: `S3FogWalk.tsx` beat 5. Quy tắc thuật ngữ (Plan.md): *"chi phí → cost. Tại beat show-cost: 'gọi tắt là cost'"*. Lời hiện tại: "con số tốt nhất ĐÃ BIẾT… **Gọi tắt là cost**" — gọi tắt của cái gì? Chữ "chi phí" (đã dùng suốt Phần 1–2) không xuất hiện, "cost" thành từ tiếng Anh rơi từ trên trời.
**Sửa**: "…đánh dấu vào góc mỗi điểm **chi phí tốt nhất ĐÃ BIẾT** tính đến giờ. Dân code lười viết dài, gọi tắt là **cost** — lát viết code cũng dùng tên này."

### m2. Phản ví dụ "Thử D" ở gate 1 và gate 2 thiếu phép tính — lệch chuẩn với các phản ví dụ khác
**Vị trí**: `S3FogWalk.tsx` gate beat 3 (counter D) và beat 7 (counter D). Các counter G/E/F/H đều có số tự kiểm được trên màn ("C–G = 1? 4+1 = 5 < 6"), riêng hai counter D chỉ nói "biết đâu… ngắn hơn" — Minh phải tự nghĩ xem "ngắn hơn" nghĩa là bé hơn bao nhiêu.
**Sửa** (tránh số 12 và 4 thật để không cướp twist của beat 6/11):
- Gate 1, D: "Chưa chắc được — biết đâu trong sương có đường C–D? Chỉ cần C–D = 10 là 4+10 = **14 < 18** rồi. *(Giữ lấy nghi ngờ này — lát nữa có bất ngờ.)*" — ghost label `10?`
- Gate 2, D: "Chưa chắc được — biết đâu từ E có đường sang D? Chỉ cần E–D = 5 là 10+5 = **15 < 16**. *(Nghi ngờ này lát nữa cũng thành SỰ THẬT.)*" — ghost label `5?`

### m3. Ba chip "kịch bản" hiện quá chậm, chip F dễ bị trượt mất trên sóng
**Vị trí**: `S3LookFromB.tsx` beat 5 (`delay: 0.25 + i * 0.45`). Ảnh `lookfromb-4.png` chụp sau ~1,1s chỉ thấy 2/3 chip — presenter quen tay bấm tiếp là khán giả không bao giờ thấy kịch bản F, trong khi lời đang nói "chọn 1 trong 3". Chip cũng đè lên vùng node H mờ.
**Sửa**: stagger 0.45 → 0.25, delay đầu 0.25 → 0.1; cân nhắc `bottom: 92` → `110`.

### m4. Beat morph: bỏ phố xá đi mà chưa kịp nói VÌ SAO bỏ
**Vị trí**: `S3LookFromB.tsx` beat 2. "Bỏ phố xá đi, chỉ giữ các điểm và đoạn nối" — mệnh lệnh, thiếu nửa câu nhu cầu (nguyên tắc nhu-cầu-trước).
**Sửa**: "Phố xá, tên đường — toàn thứ làm rối mắt mà không đổi được đáp án. Bỏ hết đi, chỉ giữ các điểm và đoạn nối. Hình tối giản này dân lập trình gọi là **ĐỒ THỊ**…"

### m5. "Đi tốt nhất đến D rồi sang B" — viên gạch ngầm chưa được đặt
**Vị trí**: `S3LookFromB.tsx` beat 5. Vì sao kịch bản qua cửa D lại nhất định là "**tốt nhất** đến D, rồi D → B"? (tính chất con-đường-con tối ưu — đang được mặc định).
**Sửa** — thêm một vế vào callout: "…chọn 1 trong 3, không còn cửa nào khác. Mà đã qua cửa D thì đoạn đầu phải là đường **tốt nhất** đến D — đoạn đầu còn rút ngắn được thì cả tuyến rút ngắn được."

### m6. Câu ② pseudocode giấu mất chuyện "ghi đè cost" mà khán giả vừa tận mắt thấy 2 lần
**Vị trí**: `S3Pseudocode.tsx`, câu ②: "Chốt xong, mở các điểm nối với nó." Nhưng D có được "mở" mới đâu — nó được **sửa số** (18→16→14), hai khoảnh khắc đắt nhất màn sương. Minh thuộc 3 câu này rồi sang Phần 4 sẽ thấy câu ② không tả nổi việc mình từng làm.
**Sửa**: "② Chốt xong, **mở** các điểm nối với nó — ghi cost tốt nhất đã biết." (vẫn 1 câu; chữ "tốt nhất đã biết" chừa đất cho màn `if newCost < Cost` tự vỡ ra ở Phần 4.)

### m7. "Mọi câu hỏi dồn về A" — mạng nhện biến mất nên "dồn" phải nhớ chứ không thấy
**Vị trí**: `S3Dependencies.tsx` beat 3 → 4. Ảnh `deps-2.png` → `deps-3.png`: cả mạng mũi tên bốc hơi, chỉ còn 3 mũi tên vào A. "Dồn về" là chuyển động — nên giữ mạng nhện cũ ở opacity thấp và làm 3 mũi tên chặng cuối sáng dần lên, để mắt thấy dòng chảy đổ về A thay vì phải tin lời.

### m8. Dấu ✓ trên A xuất hiện trước khi khái niệm CHỐT có tên
**Vị trí**: `S3FogWalk.tsx` beat 2–3: A render `locked` (vàng + ✓) ngay từ khi sương mở, trong khi tên "ĐÃ CHỐT" đến beat 4 mới có. Beat 4 có vớt lại bằng "(như A, vốn chắc từ đầu)" nên chấp nhận được; nếu muốn chặt chẽ tuyệt đối, để A ở trạng thái `current` tại beat 2–3, sang beat 4 mới chuyển `locked` cùng C — khán giả thấy hai con dấu được đóng cùng một nhịp với cái tên.

### m9. Ghi chú cho người thuyết trình (không cần đổi code)
- **Câu hỏi xoáy dự phòng ở beat 8**: "Sao biết bước đến cửa E phải tốn ≥ 10? Biết đâu có đường tắt đến E?" → đáp 1 dòng: "Đường tắt đến E cũng phải chui vào vùng tối, mà vùng tối không có cửa sau — lại phải qua một cửa đang mở khác, cửa nào cũng ≥ 6 rồi. Xoay kiểu gì cũng không thoát con số nhỏ nhất."
- **Trùng ý nhẹ**: deps beat 6 ("tự đặt mình vào vai…") và fog beat 0 ("tự bịt bớt mắt…") cùng một ý ở hai slide liền nhau — giữ cả hai làm cầu chuyển cảnh được, nhưng nên nói lướt beat 6, dồn sức cho fog beat 0 (nó mang lý do "máy móc làm theo được").
- fog beat 1 là callout dày nhất màn (4 câu) — nên dừng lâu, đây là "luật chơi" mà cả 3 gate đứng trên.

---

## Mạch kịch tổng thể — đánh giá

Đường dây **đạt**: động cơ nhìn ngược (callback explosion) → 3 cửa vào B → chuỗi phụ thuộc → A=0 "khỏi nghĩ" → đảo chiều → luật sương (chắc-chắn = nhanh, trả nợ brute force) → 3 gate với phản ví dụ trả thưởng tăng dần → thấy-đích-chưa-dám-dừng → chốt B → quy luật tự lộ → 3 câu.

- **Hai arc gieo-gặt hoạt động đẹp**: nghi ngờ C–D gieo ở gate 1, nổ ở beat 6 ("Nghi ngờ lúc nãy là SỰ THẬT"); nghi ngờ E–D gieo ở gate 2, gieo lại ở gate 3, nổ ở beat 11 ("đúng như đã nghi ngờ ở hai màn trước"). Đây là xương sống cảm xúc của màn sương — giữ nguyên.
- **Beat 12 (thấy đích chưa được dừng)** gài đúng mìn cho `if min == end break` ở Phần 4 — lời khớp Plan.
- **Beat 13** hiện phép tính cho cả nhánh không-đổi (14+6=20 > 16 → giữ nguyên) — đúng quy tắc "hình trả lời tại sao".
- **Nhịp**: 16 beat sương + 3 gate là dài nhưng do presenter điều khiển nên ổn; beat nghỉ 15 + dải chip lặp lại ở Invariant beat 0 là echo có chủ đích khi sang slide, không thừa.
- **Fog đọc đúng nghĩa "hiểu biết có hạn"**, không phải trang trí: đỉnh chưa khám phá không render, cạnh chỉ hiện khi đã mở từ đỉnh chốt (comment trong `es()` còn ghi rõ "gặp C và D trong sương chưa có nghĩa là biết có đường nối thẳng C–D") — hư cấu nhất quán, chính là nền cho mọi phản ví dụ "biết đâu trong sương có đường…". Rất tốt.
- Điểm gãy duy nhất của mạch là **C1**: đúng lúc khán giả cần được thuyết phục "vì sao min an toàn" thì bức hình kể chuyện ngược.

## Checklist thuật ngữ (đã quét toàn bộ lời hiển thị Phần 3)

| Quy tắc | Kết quả |
|---|---|
| "điểm/đoạn nối" trước morph; ĐỒ THỊ/ĐỈNH/CẠNH đặt tên đúng 1 lần tại morph | ✅ |
| "cost" đặt tên tại show-cost (beat 5) rồi mới dùng ở gate | ✅ (m1: thiếu cầu "chi phí") |
| CHỐT đặt tên khi C xác nhận; MỞ đặt tên khi E xuất hiện | ✅ đúng thứ tự nhu cầu→tên |
| Không "đỉnh kề" trong Phần 3 (pseudocode dùng "các điểm nối với nó") | ✅ |
| Không chữ "sai" ở gate — toàn bộ là "Chưa chắc được" + khung loại-trừ-là-suy-luận | ✅ |
| Không "frontier" lộ UI; không "Dijkstra" | ✅ |
| "không nhỏ hơn" (không phải "lớn hơn") ở Invariant beat 2 | ✅ |

## Gate — kiểm tra "đủ thông tin để suy luận, không đoán mò"

- **Gate 1**: luật chơi (beat 1) + 3 trọng số trên màn + trực giác "đi tiếp chỉ dài thêm" (được phát biểu thành lời ở đáp án, làm dây dẫn cho cạnh âm Phần 5) → suy được C. Phản ví dụ dạy đúng phương pháp loại trừ. ✅ (m2: counter D nên thêm số)
- **Gate 2**: lặp lại khuôn gate 1 với cost đã hiện → suy được G; đáp án chủ động "đừng tin ngay — thử phá" mở sang beat vì-sao. ✅
- **Gate 3**: 4 điểm mở, "lập luận y màn trước" → suy được E. ✅ (M1: click H đang bị nuốt — phải sửa trước buổi diễn)
