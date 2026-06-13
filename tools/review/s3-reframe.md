# Review artifact — Slide mới "Đổi bài toán" (S3Reframe), Phần 3

## Bối cảnh & yêu cầu người dùng
Phần 3 ("Tư duy ngược") dẫn người xem TỰ nghĩ ra Dijkstra. Sau bước chuỗi phụ thuộc
đổ ngược về A (mọi câu hỏi "ngắn nhất A→X" cuối cùng đều quy về A, và A→A = 0),
người dùng muốn thêm **một slide "đổi bài toán"**: bài toán chuyển thành *tìm đường
ngắn nhất từ A đến CÁC đỉnh*. Visualizer phải show: ngắn nhất tới A = 0, các đỉnh
khác để "?". "Làm sao cho phù hợp nhất là được."

## Thiết kế đã chọn
Chèn slide `S3Reframe` (id `s3-doi-bai-toan`) GIỮA S3Dependencies và S3FogWalk, 3 beat:
- **r0 — Đổi bài toán**: góc nhìn thượng đế, bảng đáp án nằm trên chính bản đồ —
  badge **A = 0** (vàng, đã chốt ✓), 7 đỉnh còn lại badge **"?"** (chip nét đứt xám).
  Băng-rôn lower-third "BÀI TOÁN MỚI · ngắn nhất từ A đến mọi điểm (không chỉ A→B)".
- **r1 — To hơn mà dễ hơn**: cùng bảng; chú thích trỏ vào B "đích ban đầu — giờ chỉ
  là một ô"; nhấn A=0 là chỗ bám, mỗi bước biến một "?" thành số thật.
- **r2 — Sương xuống**: fog chỉ lộ A (badge 0), bắc cầu sang FogWalk. (Beat này vốn là
  b8 cuối S3Dependencies — DỜI về đây để cảnh bảng "thượng đế" đứng TRƯỚC khi bịt mắt.)

## Các thay đổi
1. `src/sections/s3-reverse/S3Reframe.tsx` — slide mới (file chính cần soi).
2. `src/sections/s3-reverse/S3Dependencies.tsx` — bỏ beat b8 (sương xuống), đổi logic
   làm mờ phố từ `lastBeat ? 0 : 0.22` → `def.scene.fog ? 0 : 0.22` (b7 giờ là beat
   cuối, vẫn giữ phố 0.22 vì không có sương).
3. `src/graph/types.ts` + `src/graph/CostBadge.tsx` — mở rộng `costs` nhận `'?'`:
   chip ghost nét đứt xám CÓ dấu hỏi. Giữ triết lý "chưa biết, TUYỆT ĐỐI KHÔNG ∞".
   `decreased` được chặn bằng `typeof === 'number'` cả hai vế (an toàn khi value là '?').
4. `src/deck/deck.ts` — import + chèn S3Reframe (deck 19→20 slide).
5. `tools/shoot-s3.mjs` — cập nhật: Dependencies 9→8 beat, thêm Reframe 3 beat, rewind 41.

## Đã verify
- `tsc -b` pass; `vite build` pass.
- `node tools/shoot-s3.mjs`: walk cả Phần 3 + gate FogWalk PASS + tua lùi 41 nhịp về
  đúng `#s3-nhin-tu-b.0`. KHÔNG lỗi console.
- Ảnh: `tools/shots/s3/{deps-0..7, reframe-0..2, fog-*, ...}.png`.

## Cần review (2 lăng kính)
1. **Kỹ thuật**: pattern motion/React, rewind-an-toàn (scene-driven, không state ẩn),
   việc mở rộng type `'?'` có sạch & đúng phạm vi không, tính nhất quán với phần còn lại.
2. **Sư phạm (giả lập người mới hoàn toàn)**: cú "đổi bài toán" có TỰ NHIÊN bật ra từ
   chuỗi phụ thuộc không, hay bị áp đặt? Bảng A=0 / "?" có trực quan đúng ý không?
   Mạch với S3Dependencies (trước) và S3FogWalk (sau) có liền không? Lời thoại có
   "nói miệng" tự nhiên không (tránh giọng AI hoa mỹ)?
