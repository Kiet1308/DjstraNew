# Review vòng "Máy quay theo màn" — Phần 4 (S4Build 39 beat, S4Prev 19 beat)

Reviewer: sub-agent (2 lăng kính: kỹ thuật + sư phạm giả lập "Minh").
Đầu vào: round-camera-notes.md · src/codepanel/* · src/sections/s4-code/* · tools/shots/s4/*.png

---

## Lăng kính 1 — Kỹ thuật

### 1.1 Bảng focus theo beat — XÁC NHẬN ĐÚNG

Lần tay toàn bộ fold (need() sinh 2 beat; đếm chéo bằng grep `...need(`: 14 cú trong
BUILD, 1 trong PREV → 3 + 14×2 + 8 single = **39 beat** ✓; PREV 8 + 2 + 9 = **19 beat** ✓).

**BUILD — 5 khai báo focus, đúng 3 cú chuyển máy:**

| Màn | Beat | focus | aside | codeW | graphH | scale |
|---|---|---|---|---|---|---|
| 1 cầu nối | b0–b2 | visual (b0, codeScript.ts:545) | stateTable / mapTable / costCabinet — **liền mạch cả 3 beat** | 600 | 430 | 0.49 |
| 2 gõ máy | b3–b27 | code (b3, codeScript.ts:605 — extras của need nên beat NÓI b3 đã chuyển) | không | 1010 | 432 | 0.485 |
| 3 tai họa | b28–b33 | visual (b28, codeScript.ts:794) | không | 600 | 668 | 0.75 |
| 4 vá máy | b34–b38 | code (b34, codeScript.ts:873 — nằm trong opsBeat nên beat nói b33 vẫn ở màn visual, đúng chú thích) | không | 1010 | 432 | 0.485 |

→ Chuyển máy đúng tại **b3, b28, b34**. Trong từng màn: codeW/graphH/scale **bất động
tuyệt đối** — aside chỉ tồn tại ở màn 1 và phủ kín cả 3 beat nên không có cú nhún 668↔430
nào giữa màn. Trong màn code, graphH=432 không phụ thuộc aside (S4Layout.tsx:51) — an toàn
kép. PseudoPin: pseudoStep sticky không đổi giữa màn 3 (giữ ②) → pin compact cũng không
reflow giữa màn.

**PREV — 1 khai báo focus duy nhất (p0, codeScript.ts:968), 0 cú chuyển máy:**
codeW=600 đứng yên cả 19 beat. graphH đổi đúng 2 lần: p1→p2 (668→430, khối thẻ Path vào)
và p6→p7 (430→668, thẻ rút = cú reveal cây mũi tên). Khối aside p2–p6 liền mạch
(pathFull→pathGrow→pathExplode→pathWaste→prevChain) ✓. Ghi chú notes viết "đều trùng ranh
giới màn" — p7 chính xác là ranh giới màn 3→cú reveal có chủ đích, chấp nhận đúng tinh thần.

Graph div không bao giờ unmount giữa slide (graphScene sticky khai báo từ b0/p0) — không
có cú giật do mount/unmount. Callout neo đáy bằng spacer flex:1 → độ dài lời thoại không
xô đẩy đồ thị/thẻ phía trên.

### 1.2 Tiến/lùi/GOTO — XÁC NHẬN THUẦN FOLD

`buildCodeState` (buildCodeState.ts:84–92) suy focus bằng quét ngược tìm khai báo gần
nhất — chỉ phụ thuộc CHỈ SỐ beat, không phụ thuộc hướng đi. pseudoStep/graphScene cùng cơ
chế. Thứ duy nhất phụ thuộc `direction` là máy chữ (freshIds chỉ gõ khi đi xuôi) — đúng
chủ đích, không ảnh hưởng kích thước. Lùi từ b34→b33 cho lại màn visual y như đi xuôi;
GOTO vào giữa màn cho cùng layout vì style khởi tạo = giá trị animate (không flash khi
mount). **Không tìm thấy trường hợp lùi beat cho layout khác đi xuôi.**

### 1.3 Độ rộng dòng gõ trong panel hẹp 600px (PREV)

Hằng số đo: border-box (global.css:4), border 1.5 + padding 18 + gutter 56 → chữ bắt đầu
tại 75.5 + indent×30; JetBrains Mono 23px → 1ch = 13.8px; fade phủ [510→600].

| Dòng | indent | ký tự | kết thúc tại | phán quyết |
|---|---|---|---|---|
| `Prev = []` (p9) | 1 | 9 | ~230px | sạch ✓ |
| `Prev[đỉnh kề] = min` (p12) | 4 | 19 | ~458px | sạch ✓ (trước fade 52px) |
| `Cost[đỉnh kề] = newCost` highlight p10/p11 | 4 | 23 | ~513px | chớm fade 3px — không nhận ra ✓ |
| `return Prev   // lần ngược là ra` (p13) | 1 | 32 | ~547px | **chữ "ra" nằm ở 10–41% dải fade** — đọc được (xác nhận trên prev-13.png) nhưng punchline hơi mờ → NIT-1 |

Dòng dài có sẵn (scanIfOpen, newcost b29…) bị cắt đuôi trong màn visual — đánh đổi đã
khai báo, callout b29 nói đủ "newCost = 14+6 = 20" ✓ chấp nhận.

### 1.4 Hai thẻ mới khớp dữ liệu cảnh — XÁC NHẬN ĐÚNG

- **StateTable ↔ scThreeStates**: cảnh có đúng 3 tình trạng cùng lúc — A,C locked (đã
  chốt ✓), G,D,E frontier kèm số tạm (đang mở), B,F,H chìm trong sương (chưa thấy = vùng
  tối bên phải khung). 3 dòng thẻ ↔ 3 nhóm trên hình, 1-1.
- **CostCabinet A0 C4 G6 D16 E10 ↔ scThreeStates.costs {A:0,C:4,G:6,D:16,E:10}** — khớp
  từng ngăn; ngăn C sáng đèn khớp callout `Cost["C"] = 4` và khớp số trên badge đồ thị.
  Số liệu tự nhất quán với bản đồ (D = 4+12 = 16, E = 4+6 = 10).
- mapTable b1: A→4, D→12, E→6 ↔ scMapC ba cạnh active AC/CD/CE đúng trọng số ✓.

Dev-assert FULL_CODE ≡ fold(BUILD) (codeScript.ts:1180) + validateScript chạy lúc khởi
động — lưới an toàn tốt.

---

## Lăng kính 2 — Sư phạm + UX (giả lập "Minh", soi ảnh chụp thật)

### 2.1 Nhịp điệu 39 beat BUILD — HẾT "bơm"

Đi tuần tự build-00→38: trong màn 2 (25 beat) khung hình đứng yên hoàn toàn, chuyển động
duy nhất là máy chữ + highlight + cảnh đồ thị đổi nội dung (sương scStart → scMin →
scSeeGoal → scRelax…) — đúng loại chuyển động kể chuyện, không phải chuyển động bố cục.
3 cú chuyển máy rơi đúng khoảnh khắc tâm lý:
- **b3**: sau 3 thẻ "phiên dịch sương→dữ liệu", máy quay vào trang giấy trắng — beat NÓI
  chuyển trước, beat GÕ theo sau, người xem kịp "ngồi vào bàn".
- **b28**: cú nở to đập vào mắt đúng lúc "Dòng vừa viết có kẽ hở" — lối sáng A–C–E–B
  hiện rõ (build-28), rồi bay màu (build-30) — tai họa được xem ở cỡ xứng đáng.
- **b34**: quay về code ĐÚNG beat đặt tay gõ if (build-34), beat nói b33 vẫn đứng trong
  hiện trường vụ án (build-33, overlay "14+6=20 > 16 → giữ nguyên" to rõ). Cú này là
  điểm ăn tiền của thiết kế mới.

### 2.2 Đồ thị nhỏ 778×432 ở các beat NÓI trong màn code

Đánh đổi nhìn chung ĐÚNG — các cảnh này đơn giản và đa số là callback của khoảnh khắc đã
dạy full-screen ở phần trước. Nhưng có một khe hở độ đọc (xem MINOR-1): chip toán
`MathOverlayChip` fontSize 24 trên mặt phẳng 1920 (decorations.tsx:243) × scale 0.485 =
**~11.6px hiệu dụng**; badge cost 22px → ~10.7px. Trên màn máy chiếu/livestream nén, cỡ
này ở ngưỡng dưới. Soi từng beat:
- b15–16 scMin "min: 6 < 10 < 16" — con số CHỈ có trên chip, callout không lặp lại →
  beat vẫn hiểu được nhờ lời ("ai bé hơn thì lên thay") nhưng mất ví dụ cụ thể nếu chip
  không đọc nổi.
- b19–20 scSeeGoal — then chốt là B=16 (callout có nhắc) và D=14 còn mở (chỉ trên badge).
  Là callback của cảnh đã dạy to ở phần sương → chấp nhận được.
- b25–26 scRelax "4+12=16 < 18", b34 scKeepBetter, b35 scBackToA "4+4=8 > 0" — callout
  đều nói đủ phép tính → an toàn.

### 2.3 Hai thẻ mới — DẠY ĐƯỢC, KHÔNG NHIỄU

- build-00/recheck-build-00 (StateTable): bảng dịch 2 cột "ngôn ngữ sương ↔ ngôn ngữ
  máy" là đúng cây cầu mà Minh cần để bước từ Phần 2-3 sang code; 3 dòng stagger vào lần
  lượt, không thừa chữ. Hình + thẻ + lời cùng nói MỘT điều ✓.
- build-02/recheck-build-02 (CostCabinet): ẩn dụ "ngăn tủ mang tên nó" được vẽ ra đúng
  nghĩa đen — 5 ngăn, ngăn C sáng, caption đọc cách phát âm `Cost["C"] = 4`. Đây là chỗ
  quyết định Minh có đọc nổi 25 dòng code sau đó không — đầu tư đúng chỗ.
- Sau fix căn giữa (recheck-*), nội dung đồ thị cân khung, hết thừa mép phải ✓.
- Quan sát nhỏ: cả màn 1 panel code bên trái trống trơn 3 beat — chấp nhận được như
  "trang giấy chờ", và tránh thêm một cú đổi kích thước ở b3 (panel đã đứng sẵn 600px).

### 2.4 PREV

- **Cú reveal p6→p7 ĐẮT**: thẻ prevChain rút đi đúng nhịp, đồ thị nở 430→668, cây mũi
  tên xanh "chỉ về nhà" hiện trên toàn bản đồ (prev-7). Đảo p6↔p7 (tên Prev trước, cây
  sau) làm câu "cả bản đồ hóa thành cây" có hình minh chứng ngay khi nói ✓.
- **Gõ trong panel hẹp KHÔNG khó chịu**: 3 dòng Prev đều ngắn, nằm gọn (prev-9, prev-12);
  máy chữ + highlight đủ dẫn mắt; đồ thị lớn vẫn giữ vai chính đúng như thiết kế.
- **Màn trace p14–18 ổn**: hỏi B→E→C→A từng beat một, mũi tên flare vàng + cạnh sáng dần,
  chốt scFull "A → C → E → B = 16. Khép tròn." — đúng vòng "tư duy ngược" của toàn deck.

### 2.5 Tinh thần "visualizer là nhân vật chính" — GIỮ ĐƯỢC

Code chỉ thật sự chiếm sân khấu ở màn gõ; mọi khoảnh khắc PHÁT HIỆN (3 thẻ cầu nối, tai
họa ghi đè, ngăn trống, cây mũi tên, truy ngược) đều diễn trên đồ thị lớn. Trong màn code,
đồ thị nhỏ nhưng không chết — cảnh vẫn đổi theo lời. Câu kết b38 "code không phát minh
điều gì mới; nó chép lại suy luận" được chính bố cục chứng minh.

---

## Phát hiện

### MINOR

- **[MINOR-1] Chip toán/badge quá nhỏ ở scale 0.485 trong màn code** —
  src/graph/decorations.tsx:243 (fontSize 24 → ~11.6px hiệu dụng), src/graph/CostBadge.tsx:97
  (22 → ~10.7px); ảnh build-15, build-19, build-35. Nặng nhất là b15–16: "min: 6 < 10 < 16"
  chỉ tồn tại trên chip. **Đề xuất**: truyền hệ số bù vào GraphView khi render mini (ví dụ
  chip scale 1.4× khi scale đồ thị < 0.6, hoặc fontSize 24→34 qua prop `mini`), GIỮ NGUYÊN
  khung 778×432 — không đụng gì đến sự ổn định bố cục vừa đạt được. (Phương án rẻ hơn:
  thêm "6 < 10 < 16" vào lời callout b15.)
- **[MINOR-2] p13 "return Prev" dùng cảnh cũ scPrevSwing kèm chip "10+4=14 < 16" vô can** —
  codeScript.ts:1117–1128 (beat morph ret, graphScene sticky từ p11); ảnh prev-13. Lời nói
  "trả về cả tấm bản đồ-bước-ngược" mà hình đang là cận cảnh relax với phép toán cũ — chip
  toán lạc đề gây nhiễu nhẹ đúng beat chốt ý. **Đề xuất**: khai báo `graphScene: scPrevTree`
  tại p13 — hình đúng nghĩa đen "thứ được return", và nối mượt sang màn trace p14.
- **[MINOR-3] b38 tổng kết "25 dòng = 3 câu trong sương" nhưng PseudoPin 3 câu đều mờ**
  (pseudoStep null) — codeScript.ts:916–927, CodePanel.tsx:118; ảnh build-38. Khoảnh khắc
  duy nhất cả deck mà 3 câu được gọi tên ĐỒNG THỜI lại không được thắp. **Đề xuất**: thêm
  biến thể `pseudoStep: 'all'` (hoặc prop riêng) thắp cả ①②③ ở b38 — khóa chặt liên kết
  "trang code trái ↔ 3 câu phải" bằng hình thay vì bằng lời.

### NIT

- **[NIT-1] Đuôi comment "// lần ngược là ra" chớm dải fade** — codeScript.ts:1126; chữ
  kết thúc ~547px, fade bắt đầu 510px → chữ "ra" mờ 10–41% (prev-13 vẫn đọc được).
  **Đề xuất**: rút 3 space trước `//` còn 1 (`return Prev // lần ngược là ra`, 30 ký tự,
  kết thúc ~519px — coi như sạch), khỏi đổi nội dung.
- **[NIT-2] Thẻ prevChain (AsidePanel.tsx:276–283) lộ trước đáp án màn trace** — dòng xanh
  "lần ngược: B → E → C → A — lật lại là ra cả con đường" tại p6 nói trước nguyên văn điều
  p14–p17 sẽ diễn. Là priming có chủ đích thì giữ; nếu muốn màn trace "ngon" hơn nữa, bỏ
  dòng xanh, giữ 3 dòng Prev + comment "chỉ MỘT bước".

### Đánh đổi đã khai báo — chấp thuận, không tính là lỗi

- Highlight `newcost` b29 cụt đuôi trong panel 600px — callout nói đủ phép tính (build-29 ✓).
- Beat nói trong màn code để đồ thị nhỏ — đổi lấy 25 beat bất động: ăn (kèm MINOR-1 để vớt
  nốt độ đọc).
- Panel code trống suốt màn 1 — "trang giấy chờ", tránh thêm cú đổi cỡ ở b3: hợp lý.

---

## Kết luận

- **Phản hồi "khó chịu vì phóng to thu nhỏ liên tục": ĐẠT.** Từ ~24 cú phồng/xẹp (BUILD)
  + ~6 (PREV) xuống còn đúng 3 cú chuyển màn có chủ đích trong BUILD (b3/b28/b34, 0.7s,
  rơi đúng khoảnh khắc kịch tính) và 0 cú trong PREV (2 lần đổi chiều cao đồ thị đều là
  nhịp kể chuyện: thẻ vào / cú reveal cây). Trong mỗi màn, không một pixel bố cục nào
  nhúc nhích — kiểm chứng bằng fold tay từng beat lẫn ảnh chụp. Cơ chế sticky thuần fold
  nên tiến/lùi/GOTO an toàn.
- **Tinh thần "hướng dẫn người không biết gì NGHĨ RA thuật toán": ĐẠT.** Chuỗi
  nhu-cầu-trước-code-sau còn nguyên; tai họa được CHẠY THẬT trên đồ thị lớn thay vì kể;
  hai thẻ mới bắc đúng cây cầu sương→dữ liệu; PREV giữ đồ thị làm nhân vật chính trọn
  19 beat. 3 MINOR + 2 NIT ở trên là vớt điểm, không chặn merge.
