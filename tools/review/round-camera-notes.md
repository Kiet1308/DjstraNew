# Vòng sửa: "Máy quay theo màn" — khử bơm phồng/xẹp layout Phần 4

## Phản hồi của user (nguyên văn ý chính)
"Cái đoạn viết code, phần visualizer đang bị phóng ra thu lại liên tục rất khó chịu.
Cần redesign cho đỡ khó chịu — cứ mỗi bước visualizer phóng to lên rồi bé đi để viết code."

## Chẩn đoán
- Cũ: `focus` suy theo TỪNG beat (`ops` → code, không ops → visual). Kịch bản dùng
  cặp `need()` (nói → gõ) nên gần như MỖI cặp beat là một lần cả layout phồng/xẹp
  (~24 lần trong S4Build, ~6 lần trong S4Prev).
- Nguồn pump thứ hai: thẻ aside xuất hiện lẻ tẻ làm đồ thị nhún 668↔430 giữa chừng.

## Thiết kế mới
1. `focus` thành thuộc tính DÍNH (sticky) trong `buildCodeState` — như pseudoStep/graphScene.
   Khai báo ở ranh giới màn, giữ nguyên trong cả màn. Mặc định 'visual'.
2. S4Build 39 beat → 4 màn, 3 cú chuyển máy:
   - Màn 1 (b0–b2): cầu nối sương↔dữ liệu — visual + thẻ phụ cả 3 beat
     (thêm 2 thẻ MỚI: `stateTable` 3-tình-trạng, `costCabinet` tủ Cost — b1 sẵn có mapTable)
   - Màn 2 (b3–b27): gõ máy — code, đứng yên 25 beat
   - Màn 3 (b28–b33): máy lỗi CHẠY THẬT — visual, đồ thị nở to xem tai họa
     (beat nói của cặp bọc-if vẫn trong màn visual; máy quay về code ĐÚNG beat gõ)
   - Màn 4 (b34–b38): vá if + return + tổng kết — code
3. S4Prev 19 beat → code panel đứng yên 600px TOÀN slide (focus visual dính từ p0):
   - mấy dòng Prev đều ngắn, gõ ngay trong panel hẹp; comment `return Prev` rút còn
     "// lần ngược là ra" để đọc trọn trong 600px
   - khối thẻ Path gom liền p2–p6; ĐẢO p6↔p7: "đặt tên Prev" (có thẻ prevChain) đứng
     trước, "cây mũi tên chỉ về nhà" đứng sau — thẻ rút đi ĐÚNG lúc cây hiện, đồ thị
     nở to thành cú reveal. Chỉ 2 lần đổi chiều cao đồ thị, đều trùng ranh giới màn.
4. S4Layout: chuyển cảnh giữa màn chậm rãi 0.7s (hằng `CAMERA`); cỡ chữ callout cố định 29;
   nội dung đồ thị căn giữa khung khi scale nhỏ (`graphX`) — hết thừa mép phải.
5. CodePanel: transition 0.7s đồng bộ; cumDelay gõ 0.25→0.35.

## Bất biến phải giữ
- Số beat KHÔNG đổi (BUILD 39, PREV 19) — tools/full-walk, shoot-*, deck không lệch.
- Rewind thuần fold: sticky focus suy ngược từ kịch bản → tiến/lùi/GOTO đều cho cùng layout.
- Tinh thần: "hướng dẫn người không biết gì NGHĨ RA thuật toán" — visualizer vẫn là
  nhân vật chính (màn tai họa + toàn bộ PREV đồ thị lớn), code là nơi chép lại suy luận.

## Đánh đổi có chủ đích (cần reviewer phán xét)
- Trong màn code (b3–b27), các beat NÓI giờ cũng để đồ thị nhỏ 778×432 (trước phóng to).
  Đổi lấy: 25 beat không một pixel nhúc nhích. Các cảnh trong màn này (scMin/scRelax/
  scLockG…) vốn đơn giản, overlay vẫn đọc được ở scale 0.485 (đã dùng cỡ này từ trước).
- b35 "xét lại A" (scBackToA, overlay 4+4=8) giờ nằm trong màn code → đồ thị nhỏ.
- Trong màn visual, vài dòng code dài bị fade đuôi ở panel 600px (vốn có từ trước ở
  PREV p0–p1); highlight b29 (newcost) đuôi bị cắt — callout nói đủ phép tính.

## Verify đã chạy
- build ✓ · full-walk 180/180 WALK OK 0 lỗi console ✓
- shoot-s4: 39+19 beat chụp đủ — tools/shots/s4/build-*.png, prev-*.png,
  recheck-*.png (sau fix căn giữa)
