# Thiết kế lại S4Build ("viết code") — flow mới + 4 gadget visual

> Artifact mô tả thay đổi để review. KHÔNG đụng `S4Prev`/`PREV_SCRIPT`, `S4Debugger`, `cityGraph`,
> Phần 2/3. Đồ thị giữ nguyên (A,C,G,D,E,F,H,B; đường tối ưu A→C→E→B = 16).

## Vì sao đổi
Flow cũ khai báo `Visited` sẵn từ đầu và nhét `&& not Visited` vào điều kiện quét ngay lúc viết —
mất khoảnh khắc "tự nghĩ ra". Spec của chủ dự án muốn **Visited được PHÁT HIỆN như bản vá bug**:
viết vòng chọn min chỉ-so-số trước → thấy A (đã chốt, cost 0) cứ bị chọn lại → mới nghĩ ra cần
Visited để bỏ qua điểm đã xong. Đúng tinh thần CLAUDE.md "hướng dẫn người không biết gì NGHĨ RA
thuật toán". Chủ dự án cũng chọn "đổi flow + dựng gadget mới".

## 4 gadget mới (scene-driven, rewind-an-toàn — field optional trên `GraphSceneState`)
- **ProbeCursor** (SVG): vòng quét nét đứt xoay, chạy dọc `probe.route` rồi dừng ở đỉnh cuối =
  ứng viên min. Tái dùng cơ chế `TravelerDot`.
- **MinHolderCard** (HTML over-SVG): thẻ `min = X · v` neo trên đỉnh + dây nối. tone keep/warn/lose
  + `note` ("A đã chốt rồi?!"). Tái dùng pattern `MathOverlayChip`.
- **CostPacket** (SVG): viên thuốc ghi phép tính trượt dọc cạnh from→to, dừng trước tâm đỉnh đích.
- **DecisionTable** (HTML over-SVG, neo 1180,200 — trong vùng crop, tránh đỉnh): cửa vào → cổng so
  sánh → ô đang giữ. 5 phase: empty → receive → second → overwrite(đỏ, "16 bị mất") → gate(✗, giữ 16).
  Ô đang giữ là TRẠNG THÁI THẬT của beat (rewind-safe); chip chuyển động chỉ là hiệu ứng-vào.

## Flow mới (32 beat) — map sang spec
| Màn | Beat | Gadget / scene |
|---|---|---|
| 1 visual | 3 beat cầu nối (stateTable*, mapTable, costCabinet) | *StateTable bỏ tên Visited ở hàng "đã chốt" |
| 2 code | Khung → `fnOpen/Close` | scStart |
| | Cost → `Cost=[]`, `Cost[start]=0` | scStart |
| | Lặp → `while(true)` + 2 placeholder lời | scFrontier |
| | **Min** → vòng min **BARE** (chưa có Visited) | scMinScan (probe A→C→G→D, minHolder A·0) |
| | **Visited** (2 beat chung lời): thấy bug → insert `Visited=[]` + **morph** điều kiện quét | scMinBug (warn "A đã chốt rồi?!") → scMinFixed (probe bỏ A, minHolder C·4) |
| | Hết → sửa placeholder1 = `min==null` | scExhausted |
| | Đích → sửa placeholder2 = `min==end` | scSeeGoal |
| | Chốt → `Visited[min]=true` | scLockC (probe tone lock) |
| | Mở kề → vòng mở cạnh, gán THÔ | scOpenC (packets C→D 4+12=16, C→E 4+6=10) |
| 3 visual | **Chỉ khi rẻ** (5 tiểu-cảnh, nút Tiếp) | DecisionTable@B: empty→receive 16→second 20→overwrite(đỏ)→gate(✗) |
| 4 code | Vá → `wrap` `setcost` trong `if` | scKeepBetter |
| | Xét lại A | scBackToA |
| | return → `return Cost[end]` | scCostsNoPath |
| | Tổng kết | pseudoStep 'all' |

## Bất biến đã giữ
- Fold cuối `BUILD_SCRIPT` === `FULL_CODE` (dev-assert pass). Xử lý dòng `scan-if-open`: chèn bản
  bare `scanIfOpenBare`, beat Visited `morph` về `scanIfOpen.text` (bản đầy đủ trong FULL_CODE).
- `validateScript(BUILD_SCRIPT)` pass (không trùng id, highlight tồn tại).

## Files
`src/graph/types.ts` (4 field), `src/graph/decorations.tsx` (4 component), `src/graph/GraphView.tsx`
(render + assertSceneIds), `src/codepanel/codeScript.ts` (BUILD_SCRIPT + scene mới + scanIfOpenBare),
`src/sections/s4-code/AsidePanel.tsx` (StateTable mềm).

## Verify đã chạy
- `npx tsc -b` sạch.
- `node tools/shoot-s4.mjs` (DEV — chạy validateScript + FULL_CODE assert): 0 lỗi console, ảnh build-00..31.
- `node tools/full-walk.mjs`: xuôi 175 / ngược 175, dừng đúng, 0 lỗi console (rewind gadget OK).

## Đã áp dụng sau review (2 lăng kính: kỹ thuật + sư phạm người-mới)
Kỹ thuật: KHÔNG có blocker (rewind-safe, FULL_CODE khớp, motion-SVG hợp lệ, type sạch, màu/math đúng).
Sư phạm: flow đúng tinh thần; đã sửa các hụt:
- **Bug Visited diễn được cái "kẹt"**: giữ dấu ✓ của A (vẫn locked) + probe đi vòng A→C→G→D→**A** (quay lại A) → "duyệt hết vẫn lòi về A".
- **Tách lời** beat lộ-bug (chỉ nêu vấn đề) ≠ beat vá (mới ra đáp án Visited) — chừa khoảng lặng để tự nghĩ.
- **Placeholder mơ hồ đúng tầm**: `dừng khi nào? — tính sau (1/2)` thay vì dùng thuật ngữ "chốt hết/gặp đích" chưa được dạy.
- **Bảng quyết định**: nhãn `rẻ hơn?` hiện TỪ phase `second` (đặt câu hỏi trước), ✗ mới ở `gate` (trả lời); thêm gói `14+6=20` trượt từ D cho "20" có lai lịch; chip ứng viên đổi **cyan** (đang xét) thay amber.
- **Lời nói tự nhiên hơn**: bỏ "ca"/"thoáng thấy"/"cổng so sánh"; nối `Cost != null` với "đang mở"; sửa cách trắng `rồi?!`.

## Điểm còn để ngỏ (chưa làm — cần chủ dự án quyết)
- **Nâng cụm Min/Visited lên visual màn (đồ thị to)?** Hiện cụm này ở code màn (đồ thị scale 0.485)
  theo nguyên tắc "máy quay theo màn, không bơm/xẹp mỗi click" → probe/thẻ min nhỏ. Bảng quyết định
  (gadget công phu nhất) đã BIG ở visual màn. Cả 2 reviewer nghiêng "CÓ" nhưng đồng ý cái GỐC (diễn
  được sự kẹt + giữ ✓) quan trọng hơn kích thước — đã xử cái gốc. Việc nâng màn còn vướng: gõ dòng
  `if … < Cost[min]` (~44 ký tự) ở code-panel 600px của visual màn sẽ bị cắt đuôi. ⇒ để chủ dự án
  quyết có đáng đánh đổi không.
