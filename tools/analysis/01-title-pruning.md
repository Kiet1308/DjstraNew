# Phân tích & đề xuất — Cụm A (S1Title) + Cụm B (S2Pruning)

> Agent phân tích, KHÔNG sửa code nguồn. Mọi số liệu trong tài liệu này là số THẬT,
> tính lại từ `bigGraph` bằng đúng logic `enumeratePaths` + `simulatePruning` (chạy Node độc lập).

---

# CỤM A — S1Title: gỡ spoil, đổi tên nhóm

## A1. Hiện trạng — quote CHÍNH XÁC mọi chuỗi đang hiển thị

File: `D:\Djstra3\src\sections\s1-intro\S1Title.tsx` (1 beat duy nhất, không có gì thay đổi theo beat).
Đã đối chiếu screenshot `D:\Djstra3\tools\shots\s12\title.png` — khớp code.

| Vị trí | Text hiện tại (nguyên văn) | Style |
|---|---|---|
| Dòng mào đầu (eyebrow, dòng 75) | `Một bài toán · một làn sương · một cách nghĩ` | cyan, uppercase, letter-spacing 0.34em, 22px |
| Tiêu đề H1 (dòng 91–93) | `TÌM ĐƯỜNG` ⏎ `NGẮN NHẤT` | 800, fs-title, glow cyan |
| Tagline (dòng 102–103) | `— thử tự mình nghĩ ra cách giải —` (cụm `tự mình nghĩ ra` in đậm màu amber) | 34px, fog-200 |
| Người trình bày (dòng 8 + 112) | `const PRESENTER = 'Trịnh Kiệt Vương'` | 23px, fog-400 |
| Hint đáy màn (dòng 129) | `nhấn → để bắt đầu` (→ trong KeyHint) | 21px, nhấp nháy |

Ngoài S1Title, chuỗi spoil **không xuất hiện ở đâu khác trong src** (đã grep: `tự mình nghĩ ra`,
`làn sương`, `Trịnh` → chỉ ra 3 dòng trên). Footer HUD hiện `PHẦN 1 — ĐẶT VẤN ĐỀ` (không spoil, giữ).

## A2. Vì sao 3 chuỗi này vi phạm tinh thần (theo đúng feedback)

1. **`thử tự mình nghĩ ra cách giải`** — lộ chính cái twist lớn nhất của bài: khán giả sẽ TỰ suy ra
   thuật toán. Cú đấm của S5Reveal ("mọi người vừa TỰ suy luận ra...") chỉ mạnh khi từ đầu không ai
   được báo trước rằng mình đang "tự nghĩ".
2. **`một làn sương`** — fog là CÔNG CỤ TƯ DUY được phát minh tại S3FogWalk ("ta phải tự bịt bớt mắt").
   Nhu cầu của nó phải xuất hiện TRƯỚC khi nó xuất hiện — nhắc ở trang bìa là phát công cụ trước nhu cầu.
3. **`một cách nghĩ`** — gợi sẵn "bài này dạy một cách nghĩ (tư duy ngược)" → spoil hướng của Phần 3.
4. Tên người trình bày → đổi `Nhóm 2` (đã được user chốt — memory note "PRESENTER cần user xác nhận" coi như đóng).

## A3. Bốn phương án viết lại

Cấu trúc trang giữ nguyên 4 tầng: eyebrow → H1 → tagline → tên. Chỉ thay chữ.

### PA1 — "Tối giản tuyệt đối"
- Eyebrow: **(bỏ hẳn)**
- H1: `TÌM ĐƯỜNG NGẮN NHẤT` (có thể tăng cỡ chữ bù khoảng trống)
- Tagline: **(bỏ hẳn)**
- Tên: `Nhóm 2`
- *Vì sao đúng tinh thần*: zero rủi ro spoil — đúng nghĩa đen feedback "chỉ muốn ghi tìm đường ngắn
  nhất thôi". Bản thân cái tên bài toán trần trụi giữa màn đêm đã là một lời mời tò mò.
- *Điểm trừ*: trang hơi trống, mất nhịp dàn trang 4 tầng đang đẹp; feedback nói "ghi cái khác vào" /
  "viết khác đi" → thiên về THAY chứ không XÓA.

### PA2 — "Chỉ nêu đề bài" ⭐ ĐỀ CỬ
- Eyebrow: `MỘT TẤM BẢN ĐỒ · MỘT ĐIỂM ĐI · MỘT ĐIỂM ĐẾN`
- H1: `TÌM ĐƯỜNG NGẮN NHẤT` (giữ)
- Tagline: `— từ A đến B —` (chữ `A` và `B` in đậm amber, thay cho cụm amber cũ)
- Tên: `Nhóm 2`
- *Vì sao đúng tinh thần*: cả eyebrow lẫn tagline chỉ phát biểu lại **đề bài** — thứ khán giả kiểu gì
  cũng biết sau 30 giây ở S1Maps — tuyệt đối không lộ phương pháp, không lộ fog, không lộ twist
  "tự nghĩ ra". Giữ đúng nhịp ba "một… · một… · một…" đang là chữ ký thẩm mỹ của trang; ăn khớp nền
  sẵn có (lưới bản đồ + chấm giao lộ + tuyến đường mờ). `A` và `B` gài đúng hai "nhân vật chính"
  xuất hiện xuyên suốt từ S1Maps đến S5 — trang bìa và toàn bài nói cùng một ngôn ngữ.
- *Điểm trừ*: eyebrow và tagline cùng nói về đề bài, hơi trùng ý (chấp nhận được vì một cái tả "cảnh",
  một cái tả "việc").

### PA3 — "Khoảng trống tò mò"
- Eyebrow: `TỪ A ĐẾN B`
- H1: giữ
- Tagline: `— câu hỏi nghe đơn giản hơn câu trả lời —` (cụm `câu trả lời` amber)
- Tên: `Nhóm 2`
- *Vì sao đúng tinh thần*: tagline tạo curiosity gap thật sự — hứa rằng có chuyện đáng nghe, nhưng
  không hé chuyện đó là gì (không nói tự nghĩ, không nói cách nghĩ, không nói sương). Hợp với arc
  của bài: tưởng khó → hóa ra tự suy ra được.
- *Điểm trừ*: hơi "dọa" — pre-frame bài là khó, trong khi tinh thần finale là "ai cũng nghĩ ra được".
  Nếu khán giả nhạy cảm với giọng thách đố thì PA2 an toàn hơn.

### PA4 — "Card phim"
- Eyebrow: `NHÓM 2 TRÌNH BÀY` (tên nhóm lên mào đầu, kiểu title card điện ảnh)
- H1: giữ
- Tagline: `— mang theo một tấm bản đồ và một câu hỏi —`
- Dòng tên dưới: **bỏ** (đã lên eyebrow)
- *Vì sao đúng tinh thần*: không lộ gì ngoài "có bản đồ, có câu hỏi" = đúng đề bài; giọng điện ảnh
  hợp theme bản-đồ-đêm; tên nhóm nổi bật hơn vị trí mờ dưới đáy.
- *Điểm trừ*: "NHÓM 2 TRÌNH BÀY" chiếm vị trí trang trọng nhất trang — hơi phô so với một trang bìa
  muốn tối giản; mất dòng tên ở vị trí quen thuộc.

### Đề cử: **PA2**
Lý do chốt: đáp ứng từng chữ của feedback (title chỉ còn tên bài toán; hai dòng phụ được VIẾT LẠI chứ
không xóa; tên = Nhóm 2), zero spoil (đề bài không phải bí mật — hành trình mới là bí mật), giữ nguyên
bố cục/animation/nhịp ba hiện có nên chi phí sửa ≈ 4 chuỗi text. Nếu muốn thêm vị tò mò, lấy tagline
của PA3 lắp vào PA2.

## A4. File cần sửa (Cụm A)

| File | Việc |
|---|---|
| `src/sections/s1-intro/S1Title.tsx` | Dòng 8: `PRESENTER = 'Nhóm 2'` (sửa luôn comment dòng 7 thành "tên nhóm"). Dòng 75: thay eyebrow. Dòng 102–103: thay tagline (cập nhật cụm `<strong>` amber cho từ nhấn mới) |
| `Plan.md` dòng 21 | Quy tắc chống spoiler đang ghi tiêu đề landing cũ "— thử tự mình nghĩ ra cách giải" → cập nhật theo phương án chốt, kẻo lần verify sau lại "sửa ngược" |
| `tools/shoot-s12.mjs` → `tools/shots/s12/title.png` | Chụp lại sau khi sửa |

Không cần đụng `index.html` (`<title>` = "Tìm đường ngắn nhất" — đã sạch).

---

# CỤM B — S2Pruning: làm THẤY được quy mô cắt nhánh

## B1. Hiện trạng — beat-by-beat (4 beat)

File: `D:\Djstra3\src\sections\s2-brute\S2Pruning.tsx`. Screenshot: `tools/shots/s12/prune-0..3.png`.
Nền: `cityGraph` 8 đỉnh dạng bản đồ (A..H) + `CityDecorLayer`.

| Beat | Visual | Text (nguyên văn) |
|---|---|---|
| **b0** | Traveler đỏ chạy A→D, đồng hồ `đã đi: 0→18` nhảy số cạnh D, vượt 16 thì lật đỏ thành `18 > 16` (FrozenMeter, rAF 1800ms) | "Đang thử tuyến mới, đi tới đây thì đồng hồ chỉ **18** — mà kỷ lục đang là **16**. Câu hỏi: tuyến này còn **đáng đi tiếp** không?" |
| **b1** | Cạnh `ED`, `DB` chuyển state `pruned` (flash đỏ → lịm xám-đỏ opacity 0.45 + dấu ✗ giữa cạnh), D thành `current` | "**Dừng!** Mới nửa đường đã đắt hơn kỷ lục — đi nốt kiểu gì cũng chỉ tốn thêm. **CẮT NHÁNH** ngay tại đây, khỏi đi tiếp." |
| **b2** | CityDecor + đồ thị mờ về 0.3; 2 counter to giữa-trên đếm rAF: `828 tuyến đã xét` (cyan) / `819 bị cắt giữa chừng` (đỏ) | "Áp dụng cho thành phố 12 ngã tư: trong **828** tuyến, có **819** tuyến bị cắt giữa chừng. Nhanh hơn hẳn!" |
| **b3** | Giữ nguyên 2 counter | "Nhưng để ý kỹ: muốn biết chỗ nào đáng cắt, ta vẫn phải **lần theo từng nhánh một** rồi mới biết. Số nhánh phải lần… vẫn là **828**." |

## B2. Chẩn đoán — vì sao "chưa thể hiện được đã cắt nhiều nhánh như nào"

1. **Nhát cắt ở b1 chỉ giết được "tuyến đang đi"** trong mắt khán giả. Hai cạnh lịm đi + 1 dấu ✗ —
   không ai thấy rằng phía sau D còn **cả một chùm tuyến CHƯA THỬ** vừa chết theo. Insight cốt lõi
   của pruning ("một nhát cắt sớm = khỏi thử cả trăm đường tương lai") chưa hề được vẽ ra.
2. **Bước nhảy b1 → b2 là một cú phát-kiến-thức**: từ "cắt 1 tuyến" nhảy thẳng đến "819 tuyến bị cắt"
   bằng… hai con số đếm. Khán giả phải TIN con số chứ không SUY ra được — trái tinh thần dự án.
   Tệ hơn, 828/819 sàn sàn nhau, nhìn lướt còn dễ hiểu nhầm "xét 828 lần ~ vẫn thế".
3. **Visual b2/b3 nói dối nhẹ**: callout nói "thành phố 12 ngã tư" nhưng nền là cityGraph 8 đỉnh
   (A..H) mờ mờ — bản đồ 12 ngã tư khán giả vừa thấy ở S2Explosion biến mất.
4. Con số đắt giá nhất của mô phỏng — **chỉ 9 tuyến phải đi trọn vẹn** — không được hiển thị ở đâu.

## B3. Số liệu THẬT để dựng cảnh (đã chạy lại bằng Node, đúng logic mã nguồn)

Mô phỏng thử-tất-cả-có-cắt trên `bigGraph` (12 ngã tư, S→T, duyệt đúng thứ tự DFS của `enumeratePaths`):

- Tổng: **828** tuyến; bị cắt giữa chừng: **819**; đi trọn vẹn: **chỉ 9**; kỷ lục cuối: 21.
- Gom các tuyến bị cắt theo **"nhát cắt"** (các tuyến liên tiếp chung tiền tố bị cắt tại cùng một chỗ):
  chỉ có **277 nhát cắt** cho 819 tuyến.
- **Nhát cắt to nhất**: tiền tố `S → n1 → n4 → n2 → n3 → n5`, chi phí cộng dồn tại n5 = **27**,
  kỷ lục tạm thời lúc đó = **26** → cắt tại n5 giết **23 tuyến chưa thử** cùng lúc
  (toàn bộ cây con sau n5: mọi đường n5→T qua {n6, n8, n7, n9, n10}).
- Phân bố: 123 nhát giết 1 tuyến, 137 nhát giết 2–9, 15 nhát giết 10–19, 2 nhát giết 20+.
- Trên **cityGraph** (cảnh b0/b1 hiện tại): nhát cắt tại D (prefix A–D = 18 ≥ 16) giết đúng
  **3 tuyến tương lai**: `D→B` (=24), `D→E→B` (=28), `D→C→E→B` (=42) — khớp bảng 8 đường trong Plan.md.

→ Có đủ nguyên liệu thật cho đúng cú twist cần thiết: *một nhát = một chùm*, và *828 tuyến nhưng chỉ
9 lần phải đi đến đích*.

## B4. Đề xuất — cảnh mới "MỘT NHÁT CẮT = CẢ CHÙM TƯƠNG LAI" (3 beat mới, chèn giữa b1 và b2)

Mạch suy luận: cắt 1 tuyến (đã có) → **HỎI: nhát cắt này thực ra loại được mấy tuyến?** → thấy 3 trên
bản đồ nhỏ → phóng lên bản đồ 12 ngã tư: một nhát giết 23 → giờ con số 819 mới TIN được bằng mắt.

### Beat MỚI ① — "Không chỉ một tuyến" (vẫn trên cityGraph — ví dụ nhỏ, đếm được bằng mắt)
- **Visual**: từ dấu ✗ tại D, lần lượt vẽ mờ (ghost, nét đứt đỏ nhạt, pathLength 0→1, stagger ~0.35s)
  3 đường tương lai chưa thử: `D–B`, `D–E–B`, `D–E–C... (D–C–E–B)`. Mỗi đường vẽ xong, một ✗ nhỏ
  đóng lên nó + chip đếm cạnh D nhảy `1 → 2 → 3 tuyến bị loại`. Kết beat: 3 ghost lịm về opacity ~0.1.
- **Text** (tone insight): "Để ý: nhát cắt vừa rồi không chỉ bỏ MỘT tuyến. **Mọi tuyến tương lai**
  phải chui qua đoạn đắt này — chưa kịp thử — **chết theo cùng lúc**: 1 nhát = **3 tuyến**."
- *Vai trò sư phạm*: con số 3 đếm được bằng mắt trên đồ thị 8 đỉnh → khán giả TỰ kiểm chứng được
  mệnh đề "cắt tiền tố = giết cả cây con" trước khi tin con số lớn.

### Beat MỚI ② — "Soi một nhát cắt trên bản đồ 12 ngã tư" (chuyển sang bigGraph)
- **Visual**: crossfade (~0.6s) lớp cityGraph → lớp bigGraph (đúng hình nền S2Explosion, khán giả
  nhận ra ngay). Tiền tố `S→n1→n4→n2→n3→n5` vẽ đỏ đậm chạy vào (pathLength, ~1.2s); chip đồng hồ
  tại n5: `đã đi: 27 — kỷ lục: 26` (tái dùng phong cách FrozenMeter, lật đỏ). Rồi từ n5, **23 đường
  ghost tỏa ra** (suffix n5→T, nét mảnh 2.5px, opacity ~0.3, stagger 40–50ms/đường — mắt cảm nhận
  "nhiều" nhờ nhịp vẽ dồn dập) + counter cạnh n5 nhảy `…23 tuyến chưa thử`. Cả chùm phủ kín nửa phải
  bản đồ — hình ảnh "cả một vùng tương lai treo trên đoạn đường đắt này".
- **Text** (tone need — HỎI trước): "Thành phố 12 ngã tư: mới đi 5 đoạn đã đắt hơn kỷ lục. Câu hỏi:
  phía sau chỗ này còn **bao nhiêu tuyến chưa thử** — mà tuyến nào cũng phải chui qua **đúng đoạn
  đắt này**?" (counter tự trả lời: 23)
- *Vai trò*: phóng đại insight của beat ① lên quy mô gây choáng, vẫn cùng một lập luận.

### Beat MỚI ③ — "Nhát kéo" (cao trào)
- **Visual**: ✗ lớn đóng tại n5 (pulse 1 nhịp). **Cả 23 ghost flash đỏ cùng lúc rồi rụng** — opacity
  0.3 → 0.5 → 0.06 đồng loạt trong ~0.8s (hoặc rụng theo sóng 20ms/đường cho cảm giác "gãy dây chuyền").
  Chip tại n5 lật thành đỏ: `−23 tuyến — 0 bước chân`. (Đây chính là "một nhát cắt = giết cả chùm
  đường tương lai" mà chủ dự án mô tả.)
- **Text** (tone insight): "**MỘT nhát cắt — 23 tuyến biến mất**, không tốn thêm một bước chân nào.
  Cắt càng **sớm**, chùm chết theo càng **to**."
- *Vai trò*: câu chốt "cắt 1 nhánh sớm = đỡ phải thử cả chùm đường" được TRẢ LỜI bằng hình, không bằng lời.

### Sửa 2 beat cũ cho khớp (b2, b3 cũ → b5, b6 mới)
- **b5 (counters)**: GIỮ cơ chế 2 counter nhưng (a) nền giữ luôn lớp bigGraph mờ (sửa lệch
  "12 ngã tư trên nền 8 đỉnh"); (b) thêm dòng chốt thứ ba xuất hiện sau khi 2 counter đếm xong:
  `chỉ 9 tuyến phải đi đến tận đích` (amber, to) — 9 mới là con số gây sốc, 819 chỉ là phần bù.
  Text đề xuất: "Cả bản đồ: **828** tuyến — **819** bị cắt giữa chừng bằng những nhát kéo như thế.
  Số tuyến phải đi trọn vẹn đến đích? **Chỉ 9.** Nhanh hơn hẳn!"
- **b6 (gài S2StillSlow)** — text hiện tại "Số nhánh phải lần… vẫn là 828" sẽ **mâu thuẫn lộ liễu**
  với cảnh mới (vừa cho thấy 23 tuyến bị loại mà không cần lần). Viết lại trung thực mà vẫn giữ đòn
  "vẫn chậm": "Nhưng kéo không tự biết chỗ cắt: ta vẫn phải **mò đến tận nơi** rồi mới biết là đắt —
  gần **300 lần** lần-đường-rồi-cắt, chỉ cho 12 ngã tư. Bản đồ thật hàng nghìn ngã tư: số lần mò…
  vẫn **bùng nổ**." (số 300 ≈ 277 nhát cắt + 9 lần đi trọn — số thật, có thể export từ mô phỏng).

Phiên bản tối thiểu (nếu muốn đúng "1–2 cảnh"): bỏ beat ① (giữ nguyên b1, chỉ thêm ② + ③) — vẫn đạt
mục tiêu; beat ① là lớp đệm sư phạm "đếm được bằng mắt trước khi tin số lớn", khuyến nghị giữ.

## B5. Implement sơ bộ

**Dữ liệu** — `src/explosion/enumeratePaths.ts`:
- Thêm `computeSnipEvents(paths)` (mô phỏng đúng thứ tự DFS như `simulatePruning`, gom các tuyến bị
  cắt liên tiếp chung tiền tố) → trả `{ events, walkedFull }`; export hằng module-scope
  `BIGGEST_SNIP = { prefix: ['S','n1','n4','n2','n3','n5'], prefixCost: 27, bestAtTime: 26, suffixes: NodeId[][] /*23 mảng, mỗi mảng bắt đầu từ n5*/ }`
  và `SNIP_STATS = { events: 277, walkedFull: 9 }`. Thuần, deterministic — không tính trong render.
- Suffix cityGraph cho beat ①: hardcode 3 route `['D','B']`, `['D','E','B']`, `['D','C','E','B']`
  (đã verify khớp 8 đường trong Plan.md) — không cần enumerate lại.

**Component mới** — `src/explosion/SnipScene.tsx`:
- Props: `{ phase: 'walk' | 'fanout' | 'snipped'; animate: boolean }` — render THUẦN từ phase
  (beat → phase qua bảng BEATS), `animate=false` (đến từ chiều lùi / re-render) = vẽ thẳng trạng thái lắng.
- Tách phần vẽ nền bigGraph (edges + nodes + nhãn A/B) trong `ExplosionScene.tsx` thành
  `BigGraphBase` dùng chung — tránh duplicate 60 dòng.
- Tiền tố: `<motion.path>` đỏ, animate `pathLength 0→1`; ghost: 23 `<motion.path>`
  (d = `routeToPathD([n5, ...suffix])` — hàm sẵn có), enter stagger `delay: i*0.045`;
  phase `snipped` → animate `opacity/stroke` sang trạng thái chết (KHÔNG remove khỏi cây — đổi props).
- Chip đồng hồ + counter "23 tuyến": lớp HTML absolute trên SVG (theo đúng quy ước text-trong-HTML);
  counter tick bằng `useRafLoop` (pattern sẵn của slide) gated bởi `animate`, ghi `textContent`
  — không setState mỗi frame.
- Dấu ✗: tái dùng motif `motion.text` của `GraphEdge` state `pruned` (flash đỏ → lịm) cho ngôn ngữ
  thị giác nhất quán.

**Lắp vào slide** — `src/sections/s2-brute/S2Pruning.tsx`:
- `Beat` thêm `snip?: 'fanout' | 'snipped'` và `cityGhosts?: boolean`; bảng BEATS 4 → 7 mục
  (`BEATS.count` tự cập nhật — không đếm tay, đúng quy tắc plan).
- Hai lớp cảnh chồng nhau, crossfade bằng `motion.div opacity` (KHÔNG AnimatePresence quanh subtree
  lớn keyed theo beat — tránh remount đồ thị, đúng cảnh báo trong Plan): lớp city (CityDecor +
  GraphView + traveler) opacity 0 khi `snip || counters`; lớp `SnipScene` mount từ beat ② đến hết
  slide, opacity 0.25 khi `counters` (làm nền cho b5 — sửa luôn lệch "12 ngã tư").
- `animate` truyền xuống = `direction === 1 && beat === <beat vào cảnh>` — cùng công thức FrozenMeter
  /PruneCounters đang dùng, lùi beat an toàn.

**Tools**: `tools/shoot-s12.mjs` đang bấm đúng 4 beat cho prune (dòng 57–66) → thêm 3 `next()+shot()`;
`tools/full-walk.mjs` nếu đọc `beats` từ deck thì tự khớp (cần check 1 lần).

## B6. Rủi ro kỹ thuật & cách né

| Rủi ro | Né |
|---|---|
| 23 ghost chồng đè thành một vệt bệt (suffix dùng chung nhiều cạnh) | Nét mảnh 2.5px + opacity ~0.3 + stagger vẽ-vào — mắt đếm bằng NHỊP xuất hiện chứ không bằng tách vệt; chip số "23" mới là nguồn chân lý. Tuyệt đối không cần offset song song (phức tạp, không đáng) |
| Motion `layout` không chạy trong SVG | Cảnh chỉ animate `pathLength/opacity/stroke` (attribute) — hợp lệ; mọi chip/counter/text nằm lớp HTML |
| Lùi beat giữa lúc ghost đang vẽ / đang rụng | Mọi thứ render từ `phase` + `animate=false` ⇒ vẽ thẳng trạng thái lắng; ghost không bao giờ bị remove theo beat (chỉ đổi opacity) nên không có exit-animation kẹt |
| `getTotalLength()` cho stagger/dasharray | Không cần đo: `pathLength` của Motion tự chuẩn hóa 0→1, không đụng dasharray tay như ExplosionScene |
| Crossfade city ↔ bigGraph làm CityDecorLayer vẫn bắt chuột | `pointerEvents: 'none'` cho lớp đang ẩn (slide này vốn không có gate/click nên rủi ro thấp) |
| Số 27/26 lệch "kỷ lục 16" khán giả vừa thấy | Khác bản đồ — callout beat ② phải nói rõ "kỷ lục TẠM trên bản đồ này đang là 26" (1 mệnh đề phụ là đủ) |
| b6 giữ text cũ "vẫn là 828" | BẮT BUỘC viết lại như B4 — nếu không cảnh mới sẽ tự mâu thuẫn với lời dẫn ngay sau nó |

## B7. Tóm tắt file cần sửa (Cụm B)

| File | Việc |
|---|---|
| `src/explosion/enumeratePaths.ts` | Thêm `computeSnipEvents` + export `BIGGEST_SNIP`, `SNIP_STATS` |
| `src/explosion/SnipScene.tsx` (MỚI) | Cảnh nhát cắt trên bigGraph (3 phase) |
| `src/explosion/ExplosionScene.tsx` | Tách `BigGraphBase` dùng chung |
| `src/sections/s2-brute/S2Pruning.tsx` | BEATS 4→7, beat ① ghost cityGraph, crossfade 2 lớp, text b5/b6 mới |
| `tools/shoot-s12.mjs` | Thêm shot cho 3 beat mới |
| `Plan.md` mục S2Pruning | Cập nhật mô tả beat cho khớp (nguồn chân lý lời dẫn) |
