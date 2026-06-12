# Phân tích & thiết kế lại S3Dependencies — tách nhỏ chuỗi phụ thuộc, bỏ ý "quay vòng"

> Agent phân tích, 2026-06-12. Phạm vi: `src/sections/s3-reverse/S3Dependencies.tsx`.
> Feedback gốc: đoạn "B cần D, mà D lại cần B — câu hỏi quay vòng" khó hiểu cả text lẫn hình →
> tách thành nhiều bước, coi phụ thuộc là MỘT CHIỀU, bỏ hẳn ý circular.
> Ràng buộc song song: Phần 3 giữ variant **map** xuyên suốt (không morph), thuật ngữ chỉ dùng
> "điểm / đoạn nối".

---

## 1. Hiện trạng — 6 beat (đối chiếu code + screenshot `tools/shots/s3/deps-*.png`)

Tất cả các beat: mọi đoạn nối (cạnh) ở trạng thái `dimmed` (mờ gần như tàng hình), câu chuyện
do **mũi tên phụ thuộc** (tím, cong, nét đứt, bay phía trên) kể. H luôn `fogged`.

| Beat | Visual | Lời dẫn (tóm) | Vấn đề |
|---|---|---|---|
| 0 | B `current`; D/E/F `frontier`; A/C/G `fogged`. 3 mũi tên B→D, B→E, B→F | Định nghĩa cách đọc mũi tên: "cần biết trước" — muốn tốt nhất đến B cần D, E, F trước | Ổn. Đây là beat móc nối với S3LookFromB |
| 1 | D `current`; A, C lộ ra (`idle`). Thêm **4 mũi tên cùng lúc**: D→A, D→C, D→E và **D→B (flip)** | "Muốn tốt nhất đến D? Cần A, C, E… và khoan, **cả B nữa?!** B cần D, mà D lại cần B — câu hỏi **quay vòng**. Phải tìm một đầu mối chắc chắn mà đứng" | **Tâm bão.** (a) 2 ý nhồi 1 beat: "D phụ thuộc gì" + "phát hiện vòng lặp". (b) Cặp mũi tên ngược chiều B→D / D→B đè gần nhau (xem `deps-1.png`) — người xem phải tự giải mã chiều từng mũi tên giữa 7 mũi tên. (c) Kết luận "phải tìm đầu mối chắc chắn" nhảy cóc: từ "quay vòng" không suy thẳng ra "tìm chỗ đứng" |
| 2 | Web đủ: +4 mũi tên E→C, F→G, C→A, G→A (bỏ D→B). Tổng 10 | "Quy luật lộ ra: đường ngắn nhất đến MỘT điểm luôn phụ thuộc … các điểm ngay trước nó" | 4 mũi tên mới + phát biểu quy luật trong cùng 1 nhịp. Các nhánh E/F/C/G chưa từng được HỎI — chúng hiện ra như "được phát", không phải khán giả tự lần |
| 3 | A `current`, web dim (0.22), 3 mũi tên D→A, C→A, G→A sáng. **D→B flip vẫn còn (dim)** | "Hỏi mãi… mọi câu hỏi dồn về A. Mà A→A? Bằng 0, khỏi nghĩ. Điểm DUY NHẤT chắc chắn từ đầu" | 2 insight gộp 1 beat: (i) quan sát "mọi mũi tên đổ về A", (ii) suy luận "A = 0, không cần ai". Mũi tên vòng D→B còn sót lại trong nền |
| 4 | Đảo chiều: 3 mũi tên **liền nét** A→C, A→G, A→D | "Lật ngược ván cờ… (6 mệnh đề)" | Lời quá dài; nhắc lại "quay vòng cả tấm bản đồ" — sẽ phải bỏ theo feedback |
| 5 | Sương phủ, chỉ còn A | "Vào vai người đứng ở A… Sương xuống" | Ổn — giữ |

### Chẩn đoán vì sao khó hiểu

1. **Ý "quay vòng" là một insight ngang hông**: nó đúng về toán nhưng không phục vụ mạch chính
   ("hỏi lùi mãi → đáy là A"). Nó còn gieo một câu hỏi không bao giờ được trả lời (vòng lặp xử
   lý thế nào?) — Dijkstra né vòng lặp bằng thứ tự chốt, nhưng điều đó mãi sau FogWalk mới sáng
   tỏ. Gieo nghi vấn mà 2 slide sau mới gỡ = đứt mạch.
2. **Hình không kể được "vòng"**: 2 mũi tên cong ngược chiều giữa B–D trông như 1 cái nơ rối —
   muốn thấy "vòng" phải soi đầu mũi tên giữa 7 đường cong tím (deps-1.png).
3. **Mỗi beat làm 2 việc**: b1 = lan tầng + phát hiện vòng; b2 = lan kín + quy luật; b3 = quan
   sát + suy luận. Trái nguyên tắc "mỗi beat một ý".
4. **Tầng 2 của các nhánh E/F không được hỏi mà được phát** — khán giả không tự đi bước đó.

---

## 2. Nguyên tắc thiết kế lại

- **Một chiều theo nghĩa đen của hình học**: mọi mũi tên phụ thuộc đều chĩa **về phía A (sang
  trái)** — `mapLayout` có sẵn gradient trái→phải (A x=300 … B x=1610). Không bao giờ vẽ 2 mũi
  tên ngược chiều trên cùng cặp điểm → bỏ `flip`, web là DAG theo cấu trúc, ý "quay vòng" biến
  mất khỏi cả hình lẫn lời.
- **Câu hỏi vật lý tái sử dụng** từ S3LookFromB: "bước cuối cùng VÀO X đến từ đâu?" — cùng một
  động tác hỏi, lặp lại 4 lần (B, D, F, G) để khán giả tự đoán trước được nhịp sau.
- **Khi liệt kê điểm phụ thuộc: chỉ liệt kê, không tuyên bố vét cạn** ("từ A, từ C, hay từ E?"
  thay vì "CHỈ có thể từ A/C/E") — các lối ngược về phía B/điểm-đã-hỏi được lờ đi một cách im
  lặng đúng yêu cầu chủ dự án; presenter có câu trả lời bỏ túi (mục 8).
- **Tầng-hóa độ sáng mũi tên**: tầng đang hỏi = sáng (0.95), tầng đã hỏi = soft (0.45), nền khi
  tổng kết = dim (0.22). Mỗi beat chỉ "mọc" 1–3 mũi tên, stagger ~0.6s.
- **Node state kể chuyện "nợ câu trả lời"**: điểm bị hỏi mà chưa trả lời được = `frontier`
  (viền cyan đứt). Đến beat tổng kết, **cả bản đồ đeo viền đứt — trừ A** → hình tự nói "chỉ A
  là có sẵn câu trả lời".

---

## 3. Chuỗi beat mới — 9 beat

Ký hiệu mũi tên: T1 = {B→D, B→E, B→F}; T2d = {D→A, D→C, D→E}; T2f = {F→G}; T3g = {G→A};
T4 = {E→C, C→A}. Tổng cuối = 10 mũi tên (bằng web hiện tại, không thêm).

| # | Ý DUY NHẤT của beat | Mũi tên | Node states (ngoài ra giữ nguyên) |
|---|---|---|---|
| 0 | Nhắc lại: B cần D, E, F | T1 sáng | B `current`; D/E/F `frontier`; A/C/G/H `fogged` |
| 1 | Hỏi sâu MỘT cửa: D cần A, C, E | T1 soft; T2d sáng, stagger | D `current`; B `frontier`; A/C lộ `idle`; E `frontier` |
| 2 | Cửa khác: F cần G | T2d soft; T2f sáng | F `current`; D về `frontier`; G lộ `idle` |
| 3 | Hỏi tiếp: G cần A — nhánh này lùi 2 bước là về tới A | T2f soft; T3g sáng | G `current`; F về `frontier` |
| 4 | Hai điểm còn lại y hệt → QUY LUẬT chung | T3g soft; T4 sáng (E→C trước, C→A sau ~0.7s) | E `current`; C `frontier`; G về `frontier` |
| 5 | Quan sát HƯỚNG: mọi mũi tên chĩa về một phía — A | tất cả dim, riêng D→A, C→A, G→A sáng | A `current`; mọi điểm khác `frontier` (cả bản đồ "nợ"); H `fogged` |
| 6 | A là đáy: A→A = 0, có sẵn, không cần hỏi ai | toàn bộ dim | như b5 + **cost badge A=0** pop-in |
| 7 | Lật ngược: xây từ A đi lên | web cũ biến mất; A→C, A→G, A→D **liền nét** (reversed), stagger | A `current`; C/G/D `frontier`; B/E/F `dimmed`; giữ badge A=0 |
| 8 | Chuyển cảnh: sương phủ, vào vai người ở A | — | `fog: {revealed:['A']}`, A `current`, bỏ badge |

### Lời dẫn chính xác từng beat (tiếng Việt, mộc, "tự hỏi")

- **b0** *(need — giữ nguyên hiện tại)*: «Mũi tên tím đọc là **"cần biết trước"**: muốn tốt nhất
  đến B — cần tốt nhất đến D, E, F trước đã.»
- **b1** *(need)*: «Thử hỏi sâu một cửa — **D**. Tốt nhất đến D? Câu hỏi y hệt lúc ở B: bước
  cuối cùng VÀO D — từ **A**, từ **C**, hay từ **E**? Vậy lại cần tốt nhất đến A, C, E trước đã.»
- **b2** *(need)*: «Sang cửa khác — **F**. Bước cuối vào F? Từ **G**. Vậy lại cần tốt nhất đến G.»
- **b3** *(need)*: «Mà tốt nhất đến G? Bước cuối vào G — từ **A**. Nhánh này lùi hai bước là về
  tới A.»
- **b4** *(insight)*: «Hai điểm còn lại cũng không khác: E cần C, C cần A. Quy luật lộ ra: tốt
  nhất đến **MỘT** điểm luôn cần tốt nhất đến **các điểm ngay trước nó**.»
- **b5** *(insight)*: «Giờ lùi ra nhìn cả tấm bản đồ: câu hỏi đẻ ra câu hỏi — nhưng mũi tên nào
  cũng chĩa về **cùng một phía**. Chuỗi câu hỏi nào, lần ngược mãi, cũng đổ về đúng một điểm: **A**.»
- **b6** *(insight)*: «Mà riêng A — "đường ngắn nhất từ A đến A"? **Bằng 0. Có sẵn, khỏi nghĩ.**
  Cả bản đồ đang nợ câu trả lời — chỉ duy nhất A là trả lời được ngay từ đầu.»
- **b7** *(need)*: «Vậy lật ngược lại: phía B toàn câu hỏi nợ nhau — phía A có sẵn câu trả lời.
  Đứng ở A, **XÂY câu trả lời lan dần ra**. Mũi tên lật theo, giờ đọc xuôi: **"A đã chắc — lan
  sang điểm bên cạnh"**. Điểm nào chắc chắn **TIẾP**?»
- **b8** *(need — giữ nguyên hiện tại)*: «Để trả lời cho công bằng, tự đặt mình vào vai người
  đứng ở A — **chỉ biết những gì mắt mình thấy**. Sương xuống.»

### Vì sao nhịp này tự đi được

- b0→b1: cùng động tác hỏi, chỉ đổi điểm. b2, b3: khán giả đã đoán trước được nước đi (mỗi beat
  1 mũi tên — nhịp nhanh dần, đúng cảm giác "à, cứ thế này mãi").
- b3 cho khán giả **nhìn thấy một chuỗi trọn vẹn chạm A** (F→G→A) trước khi khái quát.
- b4 mới phát biểu quy luật — đúng lúc pattern đã lặp 4 lần, khán giả tự bật ra trước khi đọc.
- b5 (quan sát hình) tách khỏi b6 (suy luận logic) — mỗi beat một bước nhỏ; b6 dùng luôn hình
  "cả bản đồ viền đứt, mình A không" làm bằng chứng thị giác.
- Không còn chữ nào về vòng lặp/quay vòng; "tìm đầu mối chắc chắn" được thay bằng kết luận tự
  nhiên hơn: "A là điểm duy nhất có sẵn câu trả lời" → lật chiều xây lên.

---

## 4. "Cây câu hỏi" text ở góc màn hình — khuyến nghị: KHÔNG làm

Lý do:

1. **Bản đồ + mũi tên đã LÀ cái cây**: `mapLayout` trải trái→phải (A trái, B phải), mọi mũi tên
   chảy về trái — cấu trúc tầng đọc được ngay trên hình, không cần bản sao ký hiệu.
2. **Hai locus thị giác cạnh tranh**: khán giả livestream phải chọn nhìn map hay nhìn cây; cây
   text dạng `B? ← D?, E?, F? ←…` bắt học một quy ước ký hiệu mới — ngược tinh thần trực quan.
3. Callout góc trên-trái + HUD dưới đã chiếm đất; thêm khối text tầng = rối khung 1920×1080.
4. Thêm component mới = thêm diện tích verify (tiến/lùi beat, AnimatePresence) không cần thiết.

Thay thế đã nằm trong thiết kế: tầng-hóa opacity (sáng/soft/dim), node `frontier` = "nợ câu trả
lời", stagger mũi tên theo tầng.

---

## 5. Thay đổi code cụ thể

### 5.1 `src/graph/types.ts` — mở rộng `DepArrowDef`

```ts
export type DepArrowDef = {
  from: NodeId
  to: NodeId
  dim?: boolean      // 0.22 — nền mạng nhện (b5–b7)
  soft?: boolean     // MỚI: 0.45 — tầng đã hỏi xong, còn đọc được
  delay?: number     // MỚI: stagger trong-beat (giây)
  flip?: boolean     // giữ type, S3Dependencies không dùng nữa
}
```

### 5.2 `src/graph/decorations.tsx` — `DepArrow`

- opacity: `dim ? 0.22 : soft ? 0.45 : 0.95`; strokeWidth có thể 3 khi soft.
- `transition={{ duration: 0.55, ease: 'easeOut', delay }}`.

### 5.3 `src/graph/GraphView.tsx` (~dòng 247)

Truyền thêm `soft={a.soft}` và `delay={a.delay}` xuống `DepArrow`. **Lưu ý rewind**: để "lùi
beat = trạng thái lắng", slide nên ép `delay = 0` khi `direction === -1` — xử lý ở S3Dependencies
(map lại scene trước khi render), không đụng GraphView:

```ts
const scene = direction === 1 ? def.scene : stripDepDelays(def.scene)
```

### 5.4 `src/sections/s3-reverse/S3Dependencies.tsx` — bảng BEATS mới (skeleton)

```ts
const VARIANT = 'map' as const // theo thay đổi song song: Phần 3 không morph

const T1  = (soft = false) => [
  { from: 'B', to: 'D', soft }, { from: 'B', to: 'E', soft }, { from: 'B', to: 'F', soft }]
const T2d = (soft = false, dl = 0) => [
  { from: 'D', to: 'A', soft, delay: dl },
  { from: 'D', to: 'C', soft, delay: dl + 0.15 },
  { from: 'D', to: 'E', soft, delay: dl + 0.3 }]
// T2f = F→G; T3g = G→A; T4 = E→C (0s), C→A (0.7s) — tương tự
```

- b0: như beat 0 hiện tại (+`variant`).
- b1: `arrows: [...T1(true), ...T2d()]`; D `current`, A/C `idle`, B `frontier`.
- b2: `[...T1(true), ...T2d(true), {from:'F',to:'G'}]`; F `current`, G `idle`, D `frontier`.
- b3: như b2 nhưng T2f soft + `{from:'G',to:'A'}` sáng; G `current`, F `frontier`.
- b4: các tầng trước soft + `{from:'E',to:'C'}, {from:'C',to:'A',delay:0.7}`; E `current`.
- b5: toàn bộ `dim:true` trừ `D→A, C→A, G→A`; A `current`, B/C/D/E/F/G `frontier`.
- b6: như b5, tất cả dim, `costs: { A: 0 }`.
- b7: `arrows: [A→C, A→G {delay:.15}, A→D {delay:.3}], reversed: true`; giữ `costs: {A:0}`;
  C/G/D `frontier`, B/E/F `dimmed`.
- b8: giữ beat 5 hiện tại (fog revealed `['A']`, bỏ costs).

Xóa hoàn toàn: 2 chỗ dùng `{ from: 'D', to: 'B', flip: true }` (beat 1 và beat 3 cũ).

### 5.5 Việc kèm theo

- `tools/shoot-s3.mjs`: vòng `for` của deps `b < 6` → `b < 9` (FogWalk phía sau không đổi vì
  script đi bằng phím). Lưu ý nếu thay đổi song song chuyển Phần 3 sang map: tọa độ click `P`
  trong script đang là `abstractLayout` — phải đổi sang `mapLayout` cho các gate FogWalk.
- `Plan.md` mục **S3Dependencies** (~6 beat → 9 beat): cập nhật kịch bản — Plan là "nguồn chân
  lý duy nhất cho lời dẫn" (rủi ro #8 của Plan).
- Chạy lại `npm run build` + `node tools/full-walk.mjs` (tổng nhịp deck 159 → 162) +
  `node tools/smoke-engine.mjs`.

---

## 6. Tương thích với thay đổi song song (giữ map, không morph)

- Mọi scene đặt `variant: 'map'` qua hằng `VARIANT` (1 chỗ đổi nếu thứ tự merge ngược lại).
- `DepArrow` nhận layout từ `layouts[scene.variant]` — hoạt động nguyên trạng với `mapLayout`;
  hướng "mọi mũi tên chĩa về trái" vẫn đúng (đã kiểm tọa độ: mọi cặp from.x > to.x).
- Nếu slide này render `CityDecorLayer` (phố xá): để opacity ≤ 0.2 hoặc tắt — slide kể chuyện
  bằng mũi tên, phố xá chỉ gây nhiễu; các đoạn nối vẫn `dimmed` toàn bộ như hiện tại.
- Thuật ngữ trong toàn bộ lời dẫn mới: chỉ "điểm", "đoạn nối", "tấm bản đồ" — không
  đỉnh/cạnh/đồ thị. ✓
- b8 (sương) phải cùng variant với beat 0 của S3FogWalk sau thay đổi song song.

## 7. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| 10 mũi tên ở b5–b6 gây rối | Trung bình | 7 mũi tên dim 0.22, chỉ 3 mũi tên vào A sáng; đã có tiền lệ deps-3.png đọc được |
| Khán giả tinh ý hỏi "D còn nối B mà?" / "E còn nối D mà?" | Thấp | Không tuyên bố vét cạn trong lời; đoạn nối đều mờ; câu bỏ túi (mục 8) |
| Badge A=0 xuất hiện trước beat "show-cost" của FogWalk | Thấp | Đây là 1 con số có nhu cầu tại chỗ ("có sẵn câu trả lời: 0"); tên gọi "cost" + thao tác đánh-dấu-mọi-điểm vẫn được giới thiệu ở FogWalk. Nếu vẫn lo: bỏ `costs` ở b6–b7, thay bằng chữ "= 0" trong callout (1 dòng code) |
| Stagger delay replay khi tua lùi | Thấp | `stripDepDelays` khi `direction === -1` (mục 5.3) |
| 9 beat dài hơn 6 | Thấp | b2, b3 là beat 1-mũi-tên bấm nhanh; tổng thời lượng nói gần như cũ, chỉ chia nhỏ nhịp bấm |

## 8. Câu trả lời bỏ túi cho presenter (không đưa lên slide)

- *"D còn nối thẳng B mà, sao không tính?"* → «Mình đang lần ngược **từ B về A** — B là điểm
  đang chờ tính, không vòng lại chỗ vừa đứng. Cứ coi dòng câu hỏi là một chiều: luôn lùi về
  phía A.»
- *"E còn nối D nữa?"* → «D nằm trong danh sách hỏi rồi — câu hỏi đã đặt thì không cần đặt lại.»
- Hai câu này chỉ dùng khi bị hỏi; thiết kế chủ động không gợi chúng ra.
