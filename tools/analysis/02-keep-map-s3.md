# Phân tích: Giữ BẢN ĐỒ xuyên suốt Phần 3 — dời morph map→abstract sang đầu Phần 4

> Feedback chủ dự án: "Cái đoạn nghĩ ra thuật toán (Phần 3) tôi muốn vẫn giữ BẢN ĐỒ thay vì
> chuyển sang đồ thị. Phần chuyển sang đồ thị hãy để đến lúc VIẾT CODE (Phần 4) thì hãy làm."
>
> **Kết luận trước: HOÀN TOÀN KHẢ THI, độ rủi ro thấp–trung bình.** GraphView vốn là component
> fully-controlled, mọi tính năng Phần 3 (fog, badge, mathOverlay, dep-arrow, silhouette, gate,
> phantom) đều chạy theo `layout = layouts[scene.variant]` — không có code nào phụ thuộc cứng vào
> variant `abstract`. Việc chính là: (1) đổi `variant` các scene Phần 3 sang `'map'`, (2) gỡ beat
> morph khỏi S3LookFromB, (3) thêm 1 slide morph mới mở màn Phần 4, (4) quyết định cách xử lý
> decor phố xá khi sương phủ (phân tích ở mục 5), (5) cập nhật Plan.md + tools.

---

## 1. Variant `map` khác `abstract` thế nào về render? (câu hỏi 3a)

Soi `GraphView.tsx`, `GraphNode.tsx`, `GraphEdge.tsx`, `layouts.ts`, `mapDecor.tsx`:

| Khía cạnh | `map` | `abstract` | Ghi chú kỹ thuật |
|---|---|---|---|
| **Tọa độ đỉnh** | `mapLayout` | `abstractLayout` | **KHÔNG cùng tọa độ nhưng CÙNG bộ id A..H** (`layouts.ts:10-31`). Lệch nhau nhỏ, ~25–40px mỗi đỉnh (vd C: map (635,300) vs abstract (610,330)). GraphView tự chọn: `const layout = layouts[scene.variant]` (`GraphView.tsx:70`) |
| **Hình đỉnh** | vuông bo (`rx = size*0.42`) | tròn (`rx = size`) | Duy nhất 1 chỗ trong codebase rẽ nhánh theo variant: `GraphNode.tsx:91`. `motion.rect` animate `x/y/rx` với tween 1.1s → đổi variant giữa 2 beat trong cùng slide = morph mượt tự động |
| **Decor phố xá** | `CityDecorLayer` (mapDecor.tsx) | không có | **QUAN TRỌNG: decor KHÔNG nằm trong GraphView.** Nó là một `<svg>` RIÊNG do từng slide tự render bên dưới GraphView (S1Maps:127, S2TryAll:140, S2Pruning:248, S3LookFromB:198). Gồm: đường phố rộng 30px dọc theo TỪNG CẠNH đồ thị + khối nhà + phố cụt + đèn |
| **Nhãn trọng số cạnh** | như nhau | như nhau | Điều khiển bằng `scene.weights`, **độc lập variant** (`GraphEdge.tsx:145`). P1–P2 cố ý không bật; FogWalk bật — bật trên map chạy bình thường |
| **MapPin (ghim giọt nước)** | slide tự thêm | không | Chỉ S1/S2 dùng, không liên quan P3 |
| **Mọi thứ khác** (fog mask, cost badge, ghost edge, phantom, dep arrow, mathOverlay, chaos rays, traveler) | giống hệt | giống hệt | Tất cả nhận `layout` làm tham số → tự chạy đúng trên map |

**Trả lời gọn:** khác nhau đúng 3 thứ — bộ tọa độ (lệch nhẹ, cùng id), hình đỉnh vuông↔tròn,
và lớp decor do slide tự vẽ ngoài GraphView. Morph giữa 2 variant cần cả 2 layout có cùng id
đỉnh — **đã thỏa**.

## 2. Tính năng Phần 3 có chạy trên variant `map` không? (câu hỏi 3b)

Rà từng tính năng:

| Tính năng | Chạy trên map? | Cần sửa gì |
|---|---|---|
| **Fog mask** (`FogLayer.tsx`) | ✅ — mask tính theo `layout` truyền vào, hành lang sáng theo cạnh đã biết | Không sửa. NHƯNG mask chỉ áp lên lớp cạnh CỦA GraphView (`<g mask=...>` GraphView.tsx:161) — **không che decor phố xá** vì decor là svg riêng → xem mục 5 |
| **Cost badge** | ✅ — nhận `x,y,size` từ layout | Không. Chip ở góc trên-phải đỉnh vuông thay vì tròn — chỉ khác thẩm mỹ vài px |
| **mathOverlay** | ✅ — chip HTML định vị `layout[at] + dx/dy` | `dx/dy` từng chip được tinh chỉnh trên abstractLayout; map lệch ≤40px → **phải chụp lại screenshot xác minh ~8 chip** (FogWalk b6, b9, b11, b13; cutOverlay) — khả năng cao vẫn ổn |
| **Mũi tên phụ thuộc** (DepArrow) | ✅ — nhận `layout` prop (`decorations.tsx:11`) | Không sửa code. Trên nền decor mờ thì màu tím + nét đứt vẫn nổi (decor rất tối #131e36) |
| **Silhouette** (node `fogged`/`dimmed`) | ✅ — style theo nodeState, không theo variant | Không. Cân nhắc dim decor xuống ~0.3 ở các beat silhouette để "3 cửa vào B" nổi hơn |
| **Gate click** | ✅ — hit-circle r=48 vẽ theo layout | Không sửa code. Tools click theo tọa độ cứng cần cập nhật (mục 7) |
| **Đường "lẻn" cut-property** (PhantomPath) | ✅ — nhận mảng điểm tuyệt đối | **Phải sửa `scenes.ts`**: `P()` đang đọc `abstractLayout` (scenes.ts:4) + 3 waypoint cứng `[1480,430],[1330,800],[950,940]` căn theo abstract. Đổi sang `mapLayout` + tinh chỉnh waypoint (lệch nhỏ, vùng trống bản đồ vẫn trống). `crossAt` phải là `mapLayout.E` để vòng đỏ "cửa" ôm đúng đỉnh |
| **Ghost edge "biết đâu có đường..."** | ✅ — endpoints theo layout, `labelT` né va chạm | Xác minh lại 6 ghost label trên map bằng screenshot (lệch ≤40px, gần như chắc chắn ổn) |
| **ChaosRays, edgeDelays, strip tổng kết** | ✅ | Không |

**Không có blocker nào.** Duy nhất `scenes.ts` là file PHẢI sửa logic; còn lại là đổi cờ
`variant` + xác minh thị giác.

## 3. Beat morph hiện tại ở đâu, gồm gì, gỡ ra có vỡ không? (câu hỏi 3c)

**Vị trí:** `S3LookFromB.tsx` — beat index **1** (beat thứ 2/6), dòng 45–59.

**Gồm 3 thứ xảy ra đồng thời:**
1. `scene: sceneBase({ variant: 'abstract' })` → GraphNode tự tween vị trí (map→abstract layout)
   + bo góc (vuông→tròn) trong 1.1s.
2. Decor phố xá tắt: `<CityDecorLayer ... opacity={beat === 0 ? 1 : 0}>` (dòng 198) — "bỏ phố
   xá đi theo nghĩa đen".
3. **Callout đặt tên thuật ngữ** (dòng 50–57): "Phố xá, tên đường — toàn thứ làm rối mắt mà
   không đổi được đáp án. Bỏ hết, chỉ giữ các điểm và đoạn nối. Hình tối giản này dân lập trình
   gọi là **ĐỒ THỊ** — mỗi điểm là một **ĐỈNH**, mỗi đoạn nối là một **CẠNH**. Tên gọi thôi —
   nó vẫn là bản đồ của ta."

**Gỡ ra có vỡ không? KHÔNG vỡ về cấu trúc:**
- Mỗi beat là một scene tự đứng (render thuần túy từ `beat`), không beat nào tham chiếu beat
  khác. Xóa phần tử khỏi mảng `BEATS` → `beats: BEATS.count` tự giảm 6→5, deck engine tự khớp.
- Không slide nào khác import gì từ S3LookFromB. Hash điều hướng theo **slide id** chứ không
  theo index (`#s3-nhin-tu-b.0`) → không lệch hash.
- Các beat sau (2→5) đang khai `variant: 'abstract'` tường minh — phải đổi thành `'map'`,
  nếu quên thì hình sẽ tự morph "vô cớ" giữa beat 0 và 1 (đây là chỗ dễ sót nhất).
- **Hệ quả thuật ngữ (quan trọng hơn hệ quả code):** sau khi gỡ, TOÀN BỘ Phần 3 chưa được đặt
  tên đồ thị/đỉnh/cạnh → mọi chữ trên UI Phần 3 phải dùng "điểm / đoạn nối". Rà soát ở mục 4.

## 4. Rà thuật ngữ Phần 3: chỗ nào đang dùng "đồ thị/đỉnh/cạnh"? (grep toàn bộ s3-reverse)

Tin tốt: lời dẫn Phần 3 vốn được viết bằng "điểm / đoạn nối" gần như sạch sẽ (di sản của quy
tắc cũ "trước beat morph không nói đỉnh/cạnh" — mà morph nằm rất sớm). Chỉ còn **2 chỗ hiện ra
màn hình** phải xử lý:

| File:dòng | Nội dung | Hiện ra UI? | Việc cần làm |
|---|---|---|---|
| `S3LookFromB.tsx:50-57` | Callout đặt tên ĐỒ THỊ/ĐỈNH/CẠNH | ✅ | **Xóa cùng beat morph** — dời nguyên văn sang slide morph mới ở P4 |
| `S3FogWalk.tsx:622` | `gateHint: 'click đỉnh trên đồ thị'` — hiện ở HUD khi NEXT bị chặn (thấy rõ trong shot `fog-3-blocked-hint.png`, `fog-3-try-D.png`) | ✅ | Đổi thành `'click điểm trên bản đồ'` + sửa comment dòng 621 ("các gate đều SAU beat morph..." giờ sai) |
| `S3Dependencies.tsx:192` | "...lan sang điểm **bên cạnh**" | ✅ (chữ "cạnh" nghĩa đời thường, không phải thuật ngữ) | Tùy chọn: đổi "lan sang điểm nối kề bên" → "lan sang các điểm nối với nó" để màn hình Phần 3 tuyệt đối không xuất hiện chữ "cạnh". Khuyến nghị: NÊN đổi (rẻ, an toàn tuyệt đối với quy tắc) |
| `S3LookFromB.tsx:45,197`, `S3FogWalk.tsx:26,536,621`, `S3Pseudocode.tsx:8` | comment code | ❌ không render | Cập nhật comment cho khớp thực tế mới (không bắt buộc nhưng nên, vì Plan coi comment là tài liệu) |

Các chỗ còn lại đã chuẩn: FogWalk dùng "điểm", "đoạn nối" xuyên suốt 16 beat + 3 gate;
S3Invariant dùng "điểm đang mở"; S3Pseudocode dùng "các điểm nối với nó"; S3LookFromB b3 dùng
"3 đoạn nối chạm vào B". `S3Pseudocode` không nhắc "đỉnh" ở UI (chỉ ở comment).

Ngoài s3-reverse: `ProgressHUD.tsx:64` fallback `'click một điểm trên hình'` — đã trung tính,
không đụng.

## 5. Câu hỏi gai nhất: S3FogWalk trên nền map — fog CÓ che decor phố xá không?

**KHÔNG.** Fog mask là SVG `<mask>` áp lên các lớp BÊN TRONG svg của GraphView
(`GraphView.tsx:161`). `CityDecorLayer` là một `<svg>` anh em nằm dưới, **hoàn toàn ngoài tầm
mask**. Nếu cứ để decor bật trong FogWalk thì toàn bộ mạng phố (= lộ luôn topology cạnh: thấy
rõ có đường C–D, E–B... trước khi "khám phá") sẽ xuyên sương — vừa phá fog-of-war vừa phá kịch
tính gate 1 ("biết đâu trong sương có đường C–D?" — trong khi con đường đó đang nằm chình ình).

Ba phương án:

- **Phương án A (KHUYẾN NGHỊ — rẻ, đúng kịch bản sẵn có):** sương nuốt cả thành phố. Beat cuối
  S3Dependencies đã có lời "Sương xuống." — decor fade về 0 đúng beat đó, FogWalk không render
  decor. Chất "bản đồ" trong FogWalk vẫn còn nguyên qua: mapLayout hữu cơ + **đỉnh vuông bo
  kiểu ô phố** (khác biệt thị giác rõ nhất giữa 2 variant) + hành lang sáng trong sương vốn dĩ
  trông như "đoạn phố được đèn rọi". Zero refactor GraphView. Lời dẫn đỡ sẵn: "tự bịt bớt mắt".
- **Phương án B (đẹp hơn, đắt hơn):** đưa decor VÀO trong nhóm bị mask của GraphView (refactor
  `CityDecorLayer` thành `<g>` con + prop `cityDecor` cho GraphView), **lọc đường phố theo
  `edgeVisible`** (chỉ vẽ phố cho cạnh đã biết — nếu không sẽ spoiler cạnh chưa khám phá ngay
  trong vòng sáng quanh đỉnh đã lộ). Khối nhà + đèn để mask che tự nhiên. Được "thành phố trong
  sương" đúng theme night-cartography, nhưng: refactor 3 slide đang dùng decor ngoài (S1, S2×2),
  thêm 1 nguồn lỗi cho 16 beat nhạy cảm nhất bài, và phải re-verify spoiler từng beat.
- **Phương án B′ (trung gian):** chỉ đưa KHỐI NHÀ + ĐÈN (không đường phố) vào nhóm bị mask —
  nhà cửa lờ mờ trong vùng sáng, không lộ thông tin cạnh. Đắt gần bằng B, hiệu quả thị giác vừa.

Khuyến nghị: **A cho lần sửa này** (giữ FogWalk ổn định — nó là trái tim bài và đã pass review
2 vòng), ghi B′ vào backlog polish. S3Invariant cũng theo A (cảnh nền `finalScene`/`cutScene`
đều có fog, hiện không decor — giữ nguyên, chỉ đổi variant).

**Đường "lẻn" cut-property trên map có ổn không?** Ổn — phantom vẽ phía trên mọi lớp cạnh,
màu đỏ nét đứt trên nền mực đêm; với phương án A nền FogWalk không có decor nên y hệt hiện tại,
chỉ cần dời điểm neo sang mapLayout (mục 2). Với S3LookFromB/Dependencies (decor bật, không
fog) không có phantom nên không xung đột.

## 6. Kế hoạch chi tiết

### 6.1 Phần 3 giữ `map` xuyên suốt (5 slide)

Tạo helper cục bộ trong s3-reverse (vd thêm vào `common.tsx`):
```ts
export const mapScene = (over: Partial<GraphSceneState> = {}) =>
  sceneBase({ variant: 'map', ...over })
```
KHÔNG đổi default của `sceneBase` (codeScript.ts, trace.ts, S5 đang dựa vào default `abstract`).

**S3LookFromB** (6 beat → 5 beat):
- Xóa beat index 1 (morph + đặt tên). Các beat còn lại: đổi `variant: 'abstract'` → dùng `mapScene`.
- Decor: `opacity={beat === 0 ? 1 : 0.3}` — beat 0 toàn cảnh, các beat silhouette dim để 3 cửa
  vào B nổi (con số 0.3 cần tinh chỉnh bằng mắt qua screenshot).
- Cập nhật comment dòng 26 ("chưa morph...") và 197.

**S3Dependencies** (6 beat, giữ nguyên số beat):
- Mọi scene → `mapScene`.
- Thêm `<CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={beat === 5 ? 0 : 0.3} />`
  (beat cuối "Sương xuống" → decor tắt hẳn, transition 1.1s sẵn trong CityDecorLayer).
- Tùy chọn chữ: "điểm bên cạnh" → "các điểm nối với nó" (b5).

**S3FogWalk** (16 beat, giữ nguyên):
- Mọi `sceneBase` → `mapScene` (16 chỗ). KHÔNG render decor (phương án A).
- `gateHint: 'click điểm trên bản đồ'`; sửa comment 621.

**scenes.ts**:
- `P()` đọc `mapLayout`; `cutScene`/`finalScene` thêm `variant: 'map'`.
- Tinh chỉnh `cutPhantom.points` waypoint giữa (gợi ý xuất phát: `[1500,410] → [1350,790] → [930,920]`,
  chốt bằng mắt); `crossAt = [mapLayout.E.x, mapLayout.E.y]`.
- `cutOverlay` dx/dy xác minh lại trên map-E (1045,240): chip "bước qua cửa này → đã tốn ≥ 10"
  hiện đang đặt dx 185 — trên map E cao hơn 25px, gần như chắc vẫn ổn.

**S3Invariant**: không sửa gì ngoài việc hưởng scenes.ts mới (cutScene/finalScene đã thành map).

**S3Pseudocode**: chỉ sửa comment dòng 8 (không có hình).

### 6.2 Morph + đặt tên ĐỒ THỊ/ĐỈNH/CẠNH dời sang ĐẦU PHẦN 4

**Vị trí đề xuất: slide MỚI `S4Morph`** chèn trước `S4Build` trong `deck.ts` (deck 18→19 slide).

Vì sao slide mới thay vì nhét vào beat cầu nối của S4Build:
- S4Build render qua `S4Layout` = 55% code panel + mini graph **768×432 scale 0.4** — morph diễn
  ra trong khung mini sẽ nhỏ xíu, mất hết sức nặng của khoảnh khắc "bản đồ cởi áo". Khoảnh khắc
  đặt tên xứng đáng full-screen 1920×1080.
- `CodeBeat` không có khái niệm full-screen graph; mở rộng schema đắt hơn 1 slide mới.
- BUILD_SCRIPT giữ nguyên index → codeScript.ts (file dài nhất, ~60 beat đã verify) không bị
  xáo trộn beat nào.

**Kịch bản beat S4Morph (3 beat — full-screen GraphView + CityDecorLayer, không code panel):**

- **b0 — thành phố hiện lại, thành quả còn sáng.** Scene: variant `map`, KHÔNG fog, decor
  opacity 1, đường A→C→E→B `onPath`, G/D `locked`, F/H `dimmed`, weights bật (tái dùng cấu trúc
  finalScene nhưng bỏ fog). Callout (need):
  > "Sương tan. Phương pháp đã tròn 3 câu — giờ đến lượt **MÁY** làm theo. Nhưng máy không có
  > mắt: nó không thấy thành phố, không thấy phố xá đèn đường — nó chỉ làm việc được với những
  > gì ta **ghi ra thành dữ liệu** được."
- **b1 — soi lại: suy luận thực sự cần gì?** Scene giữ nguyên, decor hạ 0.5. Callout (need):
  > "Mà nhìn lại cả hành trình xem — suy luận của ta có lúc nào đụng đến tên đường, nhà cửa
  > không? Không. Từ đầu đến cuối chỉ có **các điểm** và **các đoạn nối kèm chi phí**. Mọi thứ
  > còn lại chỉ là trang trí."
- **b2 — MORPH + đặt tên.** Scene: variant `abstract`, decor opacity 0 (nodes tự trượt sang
  abstractLayout + bo tròn trong 1.1s, phố xá tan). Callout (insight) — giữ gần nguyên văn cũ:
  > "Bỏ hết trang trí. Hình tối giản còn lại, dân lập trình gọi là **ĐỒ THỊ** — mỗi điểm là một
  > **ĐỈNH**, mỗi đoạn nối là một **CẠNH**. Tên gọi thôi — nó vẫn là tấm bản đồ của ta."

  (Nhu cầu xuất hiện trước ở b0–b1 — "máy cần dữ liệu, không cần trang trí" — tên gọi đến sau ở
  b2: đúng tinh thần. Có thể gộp b0+b1 nếu muốn nhịp nhanh, nhưng 3 beat cho khoảnh khắc này
  là xứng đáng.)

- `SlideDef`: `{ id: 's4-do-thi', title: 'Bỏ lớp trang trí', section: 4, beats: 3 }` — title
  trung tính, không spoiler.
- Sau đó S4Build b0 ("Trong sương, mỗi điểm chỉ có 3 tình trạng...") nối tiếp tự nhiên — mini
  graph abstract của codeScript.ts giờ ĐÚNG là hình khán giả vừa thấy full-screen. **codeScript
  không phải sửa beat nào** (các scene mini đã là abstract mặc định; chữ "điểm" trong lời dẫn
  P4 vẫn hợp lệ vì sau khi đặt tên được "dùng tự do", không bắt buộc đổi sang "đỉnh").
- Dòng code `for đỉnh in map` (xuất hiện giữa S4Build) giờ vẫn nằm SAU beat đặt tên → quy tắc
  thuật ngữ tiếp tục được tôn trọng. Tên "đỉnh kề" vẫn được đặt tại beat riêng của nó như cũ.

### 6.3 Danh sách file phải sửa + rủi ro từng file

| # | File | Thay đổi | Rủi ro |
|---|---|---|---|
| 1 | `src/sections/s3-reverse/S3LookFromB.tsx` | Xóa beat 1; mọi scene → map; decor opacity theo beat | Quên đổi 1 chỗ `'abstract'` → morph vô cớ giữa slide. Screenshot lại 5 beat |
| 2 | `src/sections/s3-reverse/S3Dependencies.tsx` | scene → map; thêm CityDecorLayer (0.3 → 0 ở beat sương); sửa "bên cạnh" | DepArrow tím trên decor — xác minh độ tương phản |
| 3 | `src/sections/s3-reverse/S3FogWalk.tsx` | 16 scene → map; gateHint mới; comment | mathOverlay/ghost offsets lệch ~30px — xác minh 4 beat có overlay + 6 phản ví dụ |
| 4 | `src/sections/s3-reverse/scenes.ts` | `P()`→mapLayout; waypoint phantom; `variant:'map'` 2 scene | **File duy nhất phải sửa số liệu**; vòng `crossAt` phải ôm đúng E trên map |
| 5 | `src/sections/s3-reverse/common.tsx` | thêm helper `mapScene` | — |
| 6 | `src/sections/s4-code/S4Morph.tsx` (MỚI) | slide morph 3 beat như 6.2 | Cạnh GraphEdge KHÔNG tween thuộc tính `d` (chỉ node tween) → khi morph, đường nối "nhảy" tới vị trí mới trong khi đỉnh trượt 1.1s. Lệch chỉ 25–40px nên hiện tại (S3LookFromB) không ai nhận ra — nhưng giờ morph là beat đinh full-screen, NÊN nâng cấp: đưa `d` vào `animate` của motion.path với cùng tween 1.1s (sửa nhỏ `GraphEdge.tsx`, lợi cả deck) |
| 7 | `src/deck/deck.ts` | import + chèn S4Morph trước S4Build | Deck 18→19 slide: HUD "x/18"→"x/19" tự cập nhật (đếm từ mảng), OverviewMenu tự thêm ô |
| 8 | `Plan.md` | Cập nhật: dòng 15 (P3 dùng map, morph đầu P4); bảng thuật ngữ dòng 30 (beat morph giờ ở P4); mục GraphView dòng 133; kịch bản S3LookFromB (5 beat, bỏ beat 2); mục Phần 4 thêm S4Morph; "18 slide" → 19 | **Bắt buộc** — Plan là "nguồn chân lý duy nhất cho lời dẫn"; không sửa thì agent sau revert |
| 9 | `tools/full-walk.mjs` | GATE_ANSWERS → tọa độ mapLayout: C `[635,300]`, G `[515,840]`, E `[1045,240]` | Tọa độ cũ tình cờ VẪN trúng (lệch ~39px < hit r=48) nhưng đừng dựa vào may mắn. `FORWARD_END` không đổi (hash theo id) |
| 10 | `tools/shoot-s3.mjs` | bảng `P` → mapLayout; số nhịp lookfromb 6→5; mốc "lùi 37 nhịp" −1 | Tên file screenshot lệch số beat — chạy lại toàn bộ |
| 11 | `tools/smoke-engine.mjs` | click `(610,330)` → `(635,300)` | Như #9 |
| 12 | `tools/shoot-s4.mjs` | thêm chụp 3 beat S4Morph | — |

Không phải sửa: `GraphView.tsx`, `GraphNode.tsx`, `FogLayer.tsx`, `mapDecor.tsx`,
`CostBadge.tsx`, `decorations.tsx`, `codeScript.ts`, `S4Build/S4Layout/S4Prev/Debugger`, S5
(`GraphEdge.tsx` chỉ sửa nếu nhận nâng cấp tween `d` ở #6).

### 6.4 Checklist verify sau khi sửa

1. `npm run build` + chạy `tools/full-walk.mjs` — WALK OK, 0 lỗi console.
2. Chụp lại s3 + s4 (shoot-s3/shoot-s4): soi mathOverlay không đè badge, ghost label không đè
   trọng số, vòng `crossAt` ôm đúng E, decor không che callout.
3. Đi xuôi S2Pruning → S3LookFromB: bản đồ + decor liền mạch, KHÔNG có cú morph nào cho đến
   S4Morph b2; lùi từ S4Build về S4Morph b0 → hình lắng về map đúng (morph đảo chiều mượt).
4. Grep UI Phần 1–3 không còn "đồ thị|đỉnh|cạnh" render được (trừ comment); grep "Dijkstra"
   ngoài S5Reveal; "frontier" không lọt UI.
5. Đối chiếu tinh thần: tại S4Morph, NHU CẦU ("máy chỉ ăn dữ liệu") đến trước TÊN GỌI (ĐỒ
   THỊ/ĐỈNH/CẠNH) — ✓ theo kịch bản 6.2.

## 7. Rủi ro lớn nhất (xếp hạng)

1. **Quên cập nhật Plan.md** → kịch bản trong plan (nguồn chân lý) mâu thuẫn code, vòng review
   sư phạm sau sẽ "sửa lại cho đúng plan" tức là revert đúng feedback của chủ dự án.
2. **scenes.ts (cutPhantom/crossAt)** — chỗ duy nhất có số liệu cứng theo abstractLayout; sai
   thì hình cut-property (lập luận VÌ SAO quan trọng nhất bài) kể sai câu chuyện.
3. **Decor × fog**: nếu lỡ bật decor trong FogWalk mà không mask → spoiler topology phá cả 3
   gate. Phương án A né hoàn toàn rủi ro này.
4. **Edge `d` không tween khi morph** — chấp nhận được (lệch nhỏ) nhưng nên fix vì morph giờ là
   khoảnh khắc đinh.
5. Sót một `variant: 'abstract'` trong S3LookFromB beats 2–5 → node morph vô cớ giữa chừng P3.
6. Offsets mathOverlay/ghost lệch nhẹ trên map — rủi ro thấp, bắt được bằng screenshot.
