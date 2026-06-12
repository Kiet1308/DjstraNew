# Visualizer + Slide thuyết trình: "Tự nghĩ ra thuật toán Dijkstra"

> Plan đã qua 2 vòng review bởi sub-agent (Fable 5, effort cao nhất):
> - **Vòng 1 (kỹ thuật + toán)**: xác nhận toán đồ thị bằng chạy tay; sửa 3 lỗi critical (spoiler, thứ tự beat show-cost, lỗ hổng phản ví dụ gate 1) + 8 vấn đề major
> - **Vòng 2 (audit sư phạm — giả lập khán giả "Minh" chưa học DSA đi qua từng beat)**: vá 9 chỗ đứt mạch suy luận, 6 chỗ "phát kiến thức thay vì dẫn dắt", chuẩn hóa thuật ngữ theo nguyên tắc "tên gọi đến SAU khái niệm"

## Bối cảnh

Web app vừa là slide thuyết trình vừa là visualizer tương tác cho bài thuyết trình về Dijkstra theo `NoiDung.md`. **Tinh thần tối thượng**: dẫn dắt người không biết gì về thuật toán (chưa học cấu trúc dữ liệu giải thuật) TỰ NGHĨ RA thuật toán bằng suy luận — không phải dạy để học thuộc. Mọi khái niệm phải có NHU CẦU xuất hiện trước, TÊN GỌI đến sau. Thuyết trình qua livestream trên PC (1920×1080, không cần mobile).

Quyết định đã chốt với người dùng:
- **Tech**: React + Vite + Motion (framer-motion), TypeScript
- **Theme**: Dark — thẩm mỹ "bản đồ đêm trong sương" (night cartography), khớp ghi chú "Đứng dưới làn sương" trong NoiDung.md
- **Điều khiển**: phím →/Space/← tiến lùi từng "nhịp" (beat) như PowerPoint + click trực tiếp vào đỉnh ở các đoạn tương tác
- **Đồ thị**: Phần 1–3 kiểu bản đồ thành phố cách điệu (TOÀN BỘ phần "nghĩ ra thuật toán" ở trên bản đồ); morph sang đồ thị node-cạnh trừu tượng CHỈ diễn ra ở slide mở màn Phần 4 (S4Morph) — khi sắp viết code thì máy mới cần dữ liệu trần

## Quy tắc CHỐNG SPOILER (luật tối thượng — NoiDung.md dòng 3)

Chuỗi "Dijkstra" **chỉ được render duy nhất ở slide S5Reveal**:
- `<title>` index.html: "Tìm đường ngắn nhất" (tab trình duyệt HIỆN trên livestream)
- Tiêu đề landing: CHỈ nêu đề bài, không spoil hành trình. Eyebrow "Một tấm bản đồ · một điểm đi · một điểm đến", H1 "TÌM ĐƯỜNG NGẮN NHẤT", tagline "— từ A đến B —", tên "Nhóm 2". (KHÔNG nhắc "tự mình nghĩ ra" — chính việc khán giả tự nghĩ ra là twist của finale; KHÔNG nhắc "làn sương/cách nghĩ" — fog là công cụ chỉ xuất hiện ở Phần 3)
- OverviewMenu + ProgressHUD: nhãn trung tính ("Phần 5 — Nhìn lại")
- package.json, console.log, comment hiển thị được: không chứa tên thuật toán

## Quy tắc THUẬT NGỮ (tên gọi đến SAU khái niệm — bảng tra cứu khi viết lời dẫn)

| Từ | Quy tắc dùng |
|---|---|
| điểm / đoạn nối | Dùng XUYÊN SUỐT Phần 1–3 (cả Phần 3 — không còn beat morph ở đó). KHÔNG nói "đỉnh/cạnh" trước S4Morph |
| đồ thị, đỉnh, cạnh | Đặt tên đúng 1 lần tại beat 2 slide S4Morph (mở màn Phần 4): "bỏ hết trang trí — hình tối giản còn lại dân lập trình gọi là ĐỒ THỊ, mỗi điểm là một ĐỈNH, mỗi đoạn nối là một CẠNH. Tên gọi thôi — nó vẫn là tấm bản đồ của ta". Sau đó dùng tự do |
| chi phí → cost | Phần 1–2 dùng "chi phí". Cost badge ra đời MUỘN trong FogWalk (b10, sau 2 lần chốt tay + beat trí-nhớ-quá-tải): "ghi vào góc mỗi điểm cho ĐỠ PHẢI NHỚ — gọi tắt là cost, lát viết code cũng dùng tên này". Trước b10 lời dẫn chỉ nói "con số / chi phí tốt nhất đã biết" |
| CHỐT | Đặt tên khi C được xác nhận: "C xong hẳn, đóng dấu ✓ — gọi là CHỐT" |
| MỞ | Đặt tên khi E xuất hiện (b5 FogWalk — bằng miệng, chưa có badge): "điểm thấy rồi mà chưa chắc, gọi là ĐANG MỞ" |
| đỉnh kề | Pseudocode dùng "các điểm nối với nó". Sang code mới đặt tên biến `đỉnh kề` kèm 1 câu "kề = nối trực tiếp" |
| độ phức tạp, O(n²), log n | Phần 5: ĐẾM BƯỚC trước, ký hiệu sau (xem S5) |
| frontier | Tên nội bộ trong code. TUYỆT ĐỐI không lọt ra UI — mọi nhãn hiển thị là "đang mở" (thêm vào checklist verify) |
| "chưa chắc được" | Chữ dùng khi click đỉnh không chốt được ở gate. KHÔNG dùng chữ "sai" — chọn để loại trừ là phương pháp suy luận, không phải lỗi |

## Stack & dependencies (tối giản)

- Runtime: `react`, `react-dom`, `motion`
- Fonts (bundle offline, KHÔNG CDN): `@fontsource/be-vietnam-pro` (static, weight 400/600/800 — **không có bản variable**) + `@fontsource/jetbrains-mono`. Render-test chuỗi có dấu (`ố ề ỉ đ ư ơ`) ngay phase 0, cả 2 font
- Dev: `vite`, `@vitejs/plugin-react`, `typescript`
- KHÔNG zustand/redux (Context + useReducer đủ); KHÔNG lib syntax highlight (tokenizer regex ~50 dòng, `\p{L}` flag `u` vì `\w` không khớp `đ`/`ề`; mọi chuỗi codeScript `.normalize('NFC')`)

Palette (CSS vars trong `theme.css`): nền mực đêm `#0B1220`-ish, sương xanh xám; **cyan** = đang mở, **vàng hổ phách** = đã chốt, **đỏ ấm** = chưa chắc/cắt nhánh, đường đi cuối = gradient sáng. Body dark inline trong index.html (tránh chớp trắng khi load).

**Cỡ chữ tối thiểu livestream** (1920×1080): body ≥ 20px, code ≥ 22px, badge ≥ 18px, callout ≥ 28px.

## Cấu trúc dự án (tại `D:\Djstra3\`)

```
index.html, package.json, vite.config.ts, tsconfig.json
src/
  main.tsx, App.tsx
  styles/            theme.css, global.css
  deck/              types.ts, deck.ts, DeckProvider.tsx, useKeyboardNav.ts,
                     DeckShell.tsx, OverviewMenu.tsx, ProgressHUD.tsx, beatTable.ts
  components/        Stage.tsx (khung 1920×1080 scale transform), Callout.tsx, KeyHint.tsx...
  graph/             types.ts, layouts.ts, GraphView.tsx, GraphNode.tsx, GraphEdge.tsx,
                     CostBadge.tsx, FogLayer.tsx, TravelerDot.tsx,
                     usePointAlongPath.ts, decorations.tsx
  explosion/         enumeratePaths.ts, ExplosionScene.tsx, SnipScene.tsx, useRafLoop.ts
  codepanel/         types.ts, codeScript.ts, buildCodeState.ts, CodePanel.tsx,
                     CodeLineRow.tsx, tokenize.ts
  debugger/          trace.ts, DebuggerSlide.tsx, VarsPanel.tsx
  sections/          s1-intro/  s2-brute/  s3-reverse/  s4-code/ (S4Morph, S4Build, S4Prev, S4Layout, AsidePanel)  s5-finale/
```

`Stage.tsx`: mặt phẳng thiết kế cố định 1920×1080, scale bằng `transform: scale()` — layout dùng pixel tuyệt đối, không responsive.

## Đồ thị mẫu (đã verify chạy tay 2 vòng độc lập)

`cityGraph` dùng xuyên suốt Phần 1→4:

**Đỉnh**: A (xuất phát), C, G, D, E, F, H, B (đích)
**Cạnh (vô hướng)**: A–C=4, A–G=6, A–D=18, C–D=12, C–E=6, E–D=4, E–B=6, D–B=6, G–F=12, G–H=14, F–B=4

(Thang trọng số này để **mọi phản ví dụ ở mọi gate đều tồn tại với SỐ NGUYÊN**: click G ở gate 1 → giả định C–G=1 cho 5 < 6.)

Diễn tiến chuẩn (mọi phần phải khớp): chốt C=4 → G=6 → E=10 → D=14 → B=16. Relax D: 18→16 (qua C) →14 (qua E). Khi chốt D: 14+6=20 > 16 → B không đổi. Đường cuối A→C→E→B = 16. Đủ 8 đường đơn A→B (cho S2): ACEB=16, ACEDB=20, ACDB=22, AGFB=22, ADB=24, ACDEB=26, ADEB=28, ADCEB=42. B có đúng 3 điểm liền trước {D, E, F}.

Thêm `bigGraph` (~12 đỉnh, dày cạnh) cho explosion Phần 2; đồ thị mini **CÓ HƯỚNG** cho cạnh âm Phần 5: X→Y=2, X→Z=3, Z→Y=−4.

## Những điểm CỐ Ý lệch NoiDung.md (để người thuyết trình cập nhật lời thoại)

1. **Đích thống nhất là B** (NoiDung lẫn lộn B/K); `Path[K]` → `Path[B]`
2. **B chốt CUỐI CÙNG, đỉnh chốt thứ hai là G** (không phải B như dòng 71) — B là đích phải chốt cuối thì `if min == end break` mới có kịch tính
3. **Frontier gate 3 là {D, F, H}** chứ không phải "F,G,D" (dòng 74)
4. **Trọng số nhân đôi** so với NoiDung — để phản ví dụ số nguyên tồn tại ở mọi gate
5. **"gần 100 năm" → ~70 năm** (Dijkstra nghĩ ra 1956)
6. **Visited = "đã chốt"** (NoiDung dòng 85 viết nhầm "đã mở")
7. **Màn "Thử D/Thử G" là kịch bản bắt buộc** chứ không phó mặc click ngẫu nhiên (xem S3FogWalk)

## Engine slide theo "nhịp" (beat)

**Nguyên tắc vàng: mỗi slide render thuần túy từ số nguyên `beat`** — lùi = giảm beat, không timeline imperative. Lùi về beat cũ hiện trạng thái "đã lắng đọng"; URL hash `#slide.beat` khôi phục vị trí khi refresh (bảo hiểm livestream).

```ts
type SlideDef = { id: string; section: 1|2|3|4|5; beats: number;
                  gateBeats?: number[]; component: ComponentType<SlideProps> }
type SlideProps = { beat: number; direction: 1|-1; gateResolved: boolean; resolveGate: () => void }
```

- Reducer ~60 dòng trong `DeckProvider` (2 context tách state/dispatch): NEXT chặn tại gate chưa resolve; PREV về **beat cuối** slide trước; lùi/GOTO vào gate → auto-resolve; gate đã resolve **bền vững trong phiên**; phím `R` re-arm gate
- **Gate tương tác**: click đỉnh không chốt được → state cục bộ hiện overlay phản ví dụ "chưa chắc được" (tự xóa, không lọt deck state). Khi NEXT bị chặn: HUD hint kín đáo "● click điểm trên bản đồ · Enter để bỏ qua" + đỉnh ứng viên pulse nhẹ (chống presenter đứng hình). Hit-area ≥ 48px
- Phím: `→/Space/PageDown` tiến, `←/PageUp` lùi (hỗ trợ presenter clicker), `1-5` nhảy phần, `O` overview, `F` fullscreen, `R` re-arm, `Enter` ép resolve. `preventDefault` Space + `blur()` sau click, bỏ `e.repeat`
- `beats` luôn suy từ `BEATS.length` — không đếm tay

## GraphView (SVG, fully controlled — zero state)

```ts
type GraphSceneState = {
  variant: 'map' | 'abstract'
  nodeStates: Record<string, 'hidden'|'fogged'|'frontier'|'locked'|'current'|'onPath'|'dimmed'>
  edgeStates: Record<string, 'hidden'|'idle'|'active'|'pruned'|'onPath'|'hypothetical'|'relaxing'|'dimmed'>
  costs: Record<string, number|null>
  fog?: { revealed: string[] }
  traveler?: { route: string[]; runId: string }
  mathOverlay?: { at: string; text: string }   // phép cộng hiện cạnh đỉnh: "4+12=16 < 18"
}
```

- **RÀNG BUỘC: Motion `layout` KHÔNG hoạt động trên SVG.** Trong SVG chỉ animate thuộc tính (`cx`, `r`, `pathLength`, `d`, `opacity`...). Text dài/callout/code ở lớp HTML phía trên. Transform `<g>` cần `transformBox:'fill-box'`
- **Cạnh hỗ trợ CÓ HƯỚNG** (marker mũi tên) — chỉ dùng ở Phần 5
- **Fog of war**: SVG `<mask>` = rect đen + circle gradient trắng per đỉnh lộ (KHÔNG `feGaussianBlur`); đỉnh chưa lộ không render ("không góc nhìn thượng đế"). Khí quyển: ellipse mờ lớn trôi chậm CSS keyframes
- **Node** = `<motion.rect>` animate `rx`: vuông bo (map) ↔ tròn (abstract) → morph thật bằng attribute. Chốt: fill vàng + ✓; đang mở: viền cyan đứt; current: halo pulse CSS
- **Cost badge**: chip số ở góc đỉnh, pop-in AnimatePresence, **flash xanh khi giảm**. Chưa có giá trị = **ghost rỗng — TUYỆT ĐỐI KHÔNG dùng ∞** (mâu thuẫn mental model `Cost == null`)
- **Quy tắc visualize phép relax** (hình phải trả lời "tại sao đổi", không trang trí): đường 2 đoạn sáng lên (vd A–C–D) → `mathOverlay` hiện phép cộng "4+12=16 < 18" → badge mới đổi số + flash. Cả nhánh KHÔNG đổi cũng hiện phép cộng ("14+6=20 > 16 → giữ nguyên")
- **Mũi tên phụ thuộc** (S3Dependencies): cong, nét đứt, màu riêng, bay phía trên đồ thị — khác biệt thị giác rõ với cạnh, kẻo hiểu nhầm đồ thị có chiều
- **Cạnh**: `motion.path` vẽ bằng `pathLength 0→1` khi mở; marching-ants CSS trên overlay path riêng
- **TravelerDot**: hidden measure path (`opacity:0`, KHÔNG `display:none`) + `getPointAtLength` + MotionValue; lùi beat pin về cuối
- Morph map→abstract: tại S4Morph beat 2 (~1.1s, node tween x/y/rx + cạnh tween x1..y2 + chip trọng số trượt theo — GraphEdge dùng motion.line, KHÔNG animate chuỗi `d`)
- **prevArrows** (Phần 4 — Prev): mũi tên "tôi đến từ đây" NGẮN, THẲNG, LIỀN NÉT, màu xanh — khác hẳn mũi tên phụ thuộc tím cong nét đứt của Phần 3; đổi from = exit/enter theo key `node:from` (cú "xoay" của D khi relax tốt hơn)
- **costFlash** scene-driven (`worse` = đỏ): flash là dữ liệu cảnh khai báo, rewind-an-toàn — dùng cho màn "không có if thì sao"

## Code panel Phần 4 ("nói trước, code sau")

Code là **dữ liệu**: `CodeLine {id ổn định, text, indent, kind}` + kịch bản `CodeBeat[]`:

```ts
type CodeOp = { op:'insert'; afterId; lines } | { op:'replace'; targetId; lines }
            | { op:'morph'; targetId; text } | { op:'remove'; ids }
            | { op:'wrap'; targetId; before; after; indentDelta }   // bọc if quanh dòng có sẵn
type CodeBeat = { callout?: {text, tone:'need'|'insight'|'warn'}; ops?: CodeOp[];
                  highlight?: string[]; graphScene?: GraphSceneState; pseudoStep?: 1|2|3 }
```

- **Luật "nhu cầu trước, code sau"**: helper `need(callout, ops)` sinh 2 beat liên tiếp — beat k chỉ callout, beat k+1 mới chạy ops (code gõ máy chữ hiện ra)
- **Op `wrap`** cho khoảnh khắc đắt nhất (NoiDung 133-139): dòng `Cost[đỉnh kề] = newCost` giữ nguyên `id`, Motion layout trượt nó thụt vào khi `if (...) {` và `}` chèn quanh — khán giả THẤY "dòng cũ được bọc lại", không phải xóa-tạo-mới
- **Checklist 3 câu pseudocode PIN góc màn hình suốt S4Build** (`pseudoStep` của CodeBeat điều khiển): câu đang được dịch thành code sáng lên — ngoại hóa trí nhớ, Minh không phải nhớ 3 câu suốt ~50 beat (tương đương NoiDung lặp lại nguyên văn ở dòng 102/107/129); beat tổng kết dùng `pseudoStep:'all'` thắp cả ba — "25 dòng = 3 câu" nhìn thấy được
- `buildCodeState(script, beat)` = pure fold → lùi beat miễn phí. Dev-validator: fold toàn kịch bản lúc khởi động, assert mọi `afterId/targetId` — bắt typo trước khi lên sóng
- Render HTML (Motion layout OK); exit collapse `height:0`; typewriter trick width `0ch→Nch` (NFC, `"đỉnh kề".length===7`); placeholder tiếng Việt (`if ChốtHết break`) nghiêng màu hổ phách = "TODO chữ, chưa phải code"
- **Beat cầu nối mở đầu Phần 4** (3 nhịp — cả 3 đều có thẻ phụ để màn đứng yên một cỡ): (1) ánh xạ 3 trạng thái sương ↔ dữ liệu (thẻ `stateTable`: chưa thấy = `Cost==null` / đang mở = `Cost = số tạm` / đã chốt = `Visited=true`); (2) **map là gì**: mini-bảng `map[C] = {A:4, D:12, E:6}` cạnh đồ thị (thẻ `mapTable`) — "toàn bộ tấm bản đồ gói trong một bảng: tra tên điểm → nhận danh sách điểm nối kèm chi phí"; (3) mảng index bằng tên: "ngăn tủ mang tên nó" (thẻ `costCabinet`: 5 ngăn A·C·G·D·E, ngăn C soi đèn — `Cost["C"] = 4`)
- Kịch bản bám NoiDung 87–229: khai báo Cost/Visited → `Cost[start]=0` → `while(true)` + 2 placeholder → vòng for tìm min → replace placeholder 1 → replace placeholder 2 thành `if min == end break` (**callout trỏ ngược về khoảnh khắc "thấy B=16 mà chưa dám dừng" ở FogWalk**) → `Visited[min]=true` → vòng các điểm nối (đặt tên biến `đỉnh kề` tại đây) → `newCost` → ghi ngây thơ → **màn "máy lỗi chạy thật"** (xem mục Phần 4) → **wrap** thành if → "xét lại A: 4+4=8 > 0 → if lo hết" → `return Cost[end]`
- **MÁY QUAY THEO MÀN, KHÔNG THEO BEAT** (visualizer cũng là nhân vật chính — nhưng bố cục KHÔNG bơm phồng/xẹp mỗi click): `focus` là thuộc tính DÍNH (sticky như pseudoStep/graphScene) — kịch bản khai báo ở ranh giới màn, giữ nguyên trong cả màn; trong một màn không pixel nào đổi kích thước. Mode visual: đồ thị nở 1188×668 (crop-trước-scale 0.75 — badge ~16.5px đọc được trên livestream; màn có thẻ phụ thì 430px/scale 0.49, nội dung căn giữa khung `graphX` — AsidePanel có flexShrink:0, KHÔNG bao giờ bị flex nghiền mất dòng), code thu 600px nhưng GIỮ fs-code 23px (cắt + dải fade mép phải, KHÔNG scale nhỏ chữ), PseudoPin nén thành dải ngang. Mode code: code nở 1010px đọc trọn dòng, đồ thị 778×432 (crop+scale 0.485). Chuyển màn = cú chuyển cảnh có chủ đích `CAMERA` 0.7s; cỡ chữ callout cố định 29 (không reflow khi chuyển). LUẬT GOM THẺ: aside phải LIỀN MẠCH trong màn — không để thẻ vào/ra giữa màn làm đồ thị nhún 668↔430. BUILD = 4 màn, đúng 3 cú chuyển máy (b3 vào bàn gõ · b28 tai họa nở to · b34 quay về vá if); PREV = 0 cú (visual dính từ p0, code panel 600px đứng yên trọn slide — mấy dòng Prev đều ngắn, gõ ngay trong panel hẹp; comment `return Prev` rút gọn "// lần ngược là ra" để đọc trọn)
- **Debugger cuối Phần 4** (`trace.ts`): thuật toán thật có instrument → ~30-40 `TraceFrame {lineId, scene, vars{Cost,Visited,Prev,min}, note}` tại các câu lệnh đáng nói. Frame đầu note: "Cost[start]=0 khiến A tự động là đỉnh chốt đầu tiên — ý 'xuất phát từ A' nằm gọn trong 1 dòng code". **3 frame cuối: trace ngược Prev** — từ B hỏi "trước mày là ai?" → E → C → A, mỗi cú nhảy thắp sáng một đoạn trên đồ thị, lật ngược lại ra [A,C,E,B] — khép tròn "tư duy ngược" của Phần 3. Phím `P` autoplay 800ms/frame (dừng khi bấm tay). Mọi frame là snapshot đầy đủ → tua lùi an toàn

## Nội dung slide theo 5 phần (19 slide — kịch bản beat chi tiết)

### Phần 1 — Landing + đặt vấn đề (2 slide, đúng yêu cầu 2 trang)
- `S1Title`: CHỈ nêu đề bài — eyebrow "Một tấm bản đồ · một điểm đi · một điểm đến", H1 "TÌM ĐƯỜNG NGẮN NHẤT", tagline "— từ A đến B —", tên "Nhóm 2", hint "nhấn → để bắt đầu". Không spoil twist "tự nghĩ ra", không spoil fog
- `S1Maps`: bản đồ thành phố cách điệu, pin A và B; beats: các tuyến đường lần lượt sáng với chi phí khác nhau (thời gian, khoảng cách, **tiền xăng**) → "ta muốn tuyến chi phí nhỏ nhất" → câu hỏi treo "Vậy làm thế nào?"

### Phần 2 — Ý tưởng tự nhiên: thử hết mọi đường (4 slide)
- `S2TryAll`: traveler dot đi thử từng đường trên cityGraph — **KHÔNG hiện trọng số từng cạnh, chỉ hiện tổng chi phí mỗi tuyến** (giảm thông tin khán giả "thuộc" trước Phần 3); có lượt vào **ngõ cụt A→G→H, chững lại, quay đầu** ("đường không dẫn đến đích" — NoiDung dòng 19); lưu "tốt nhất hiện tại"
- `S2Explosion`: bigGraph — pool 8 path tái sử dụng + counter `ref.textContent` tăng tốc (1 đường/s → 30/frame), 1 vòng rAF, không setState
- `S2Pruning` (7 beat — cảnh "một nhát cắt = cả chùm tương lai"): b0 HỎI trước khi phát kiến thức (freeze traveler, đồng hồ 18 > 16 → "còn đáng đi tiếp không?") → b1 CẮT (nhánh flash xám-đỏ) → b2 MỚI trên cityGraph: từ ✗ tại D vẽ mờ 3 tuyến tương lai chưa thử (D–B, D–E–B, D–C–E–B) chết theo + chip "−3 tuyến — 0 bước chân" (con số 3 đếm được bằng mắt) → b3 MỚI crossfade sang bigGraph: tiền tố đỏ S→…→n5 đã 27 > kỷ lục 26, 23 đường ghost tỏa ra từ điểm cắt + counter đếm dần (HỎI: "còn bao nhiêu tuyến chưa thử?") → b4 MỚI nhát kéo: ✕ đóng, cả 23 ghost flash đỏ rụng đồng loạt, chip "−23 tuyến — 0 bước chân" → b5 counter thật 828/819 + dòng chốt amber "chỉ 9 tuyến phải đi đến tận đích" (con số gây sốc thật) → b6 gài S2StillSlow: "kéo không tự biết chỗ cắt — ~286 lần lần-đường-rồi-cắt (số thật từ mô phỏng), bản đồ thật vẫn bùng nổ". Số liệu từ `computeSnipEvents` (deterministic, không hardcode)
- `S2StillSlow`: "...nhưng vẫn phải duyệt hàng trăm đường" → cần một cách NGHĨ khác

### Phần 3 — Tư duy ngược → phát hiện phương pháp (5 slide, trái tim bài)

**TOÀN BỘ Phần 3 trên BẢN ĐỒ (variant map)** — không morph. Thuật ngữ: chỉ "điểm / đoạn nối".

**`S3LookFromB`** (5 beat — đã bỏ beat morph):
1. *Động cơ nhìn ngược*: bên trái từ A tỏa chùm tia rối loạn (callback cảnh explosion), bên phải B chỉ có đúng 3 đường chạm vào — "Đứng ở A nhìn về B: hàng trăm ngả, càng nhìn càng rối — ta vừa nếm mùi rồi. Quay ống kính nhìn B: chỉ có đúng 3 lối dẫn VÀO. Phía nào dễ bắt chuyện hơn? Thử hỏi ngược từ B." (decor phố xá dim 0.3 từ beat 1 để silhouette nổi)
2. *Câu hỏi vật lý thay tuyên bố*: "Một người vừa đặt chân đến B. Bước CUỐI CÙNG của họ xuất phát từ đâu?" → silhouette: chỉ B + 3 đoạn nối vào từ D/E/F rõ nét, còn lại mờ khối
3. Khán giả tự trả lời → "đường ngắn nhất đến B CHỈ có thể qua 1 trong 3 cửa này"
4. *3 kịch bản hoặc/hoặc/hoặc* (KHÔNG dùng ký hiệu min): "tốt nhất đến D rồi sang B, HOẶC tốt nhất đến E rồi sang B, HOẶC tốt nhất đến F rồi sang B — chọn rẻ nhất trong 3"
5. "Bài toán mới: tìm đường tốt nhất đến D, E, F"

**`S3Dependencies`** (9 beat — MỘT CHIỀU, tách nhỏ từng tầng, KHÔNG còn ý "quay vòng"):
Mọi mũi tên phụ thuộc đều chĩa VỀ PHÍA A (sang trái) — không bao giờ có cặp ngược chiều; tầng-hóa độ sáng (đang hỏi 0.95 / đã hỏi soft 0.45 / nền dim 0.22); câu hỏi vật lý "bước cuối VÀO X đến từ đâu?" lặp lại 4 lần cho khán giả tự đoán được nhịp:
1. (b0) Nhắc lại: B cần D, E, F — "mũi tên tím đọc là 'cần biết trước'"
2. (b1) Hỏi sâu MỘT cửa: "Tốt nhất đến D? Bước cuối VÀO D — từ A, từ C, hay từ E? Lại cần tốt nhất đến A, C, E trước đã." (KHÔNG nhắc B — coi như một chiều)
3. (b2) Cửa khác: "F? Bước cuối vào F — từ G."
4. (b3) "G? — từ A. Nhánh này lùi hai bước là về tới A." (chuỗi đầu tiên CHẠM ĐÁY)
5. (b4) Hai điểm còn lại y hệt (E cần C, C cần A) → QUY LUẬT: "tốt nhất đến MỘT điểm luôn cần tốt nhất đến các điểm ngay trước nó" (phát biểu đúng lúc pattern đã lặp 4 lần)
6. (b5) Quan sát HƯỚNG: web dim, 3 mũi tên vào A sáng — "mũi tên nào cũng chĩa về cùng một phía. Chuỗi câu hỏi nào, lần ngược mãi, cũng đổ về đúng một điểm: A."
7. (b6) A là đáy: cả bản đồ đeo viền cyan đứt ("nợ câu trả lời"), riêng A pop badge 0 — "đường ngắn nhất từ A đến A? Bằng 0. Có sẵn, khỏi nghĩ."
8. (b7) Lật ngược: web cũ biến mất, 3 mũi tên LIỀN NÉT A→C/G/D — "Đứng ở A, XÂY câu trả lời lan dần ra. Điểm nào chắc chắn TIẾP?"
9. (b8) *Chuyển cảnh*: "tự đặt mình vào vai người đứng ở A — chỉ biết những gì mắt mình thấy. Sương xuống." (decor tắt hẳn)

**`S3FogWalk`** (18 beat, gate tại b3/b6/b11 — cost ra đời MUỘN, quy luật VỠ RA TẠI TRẬN):
Nguyên tắc hiển thị con số TRƯỚC show-cost (3 tầng, không tầng nào là badge): trọng số trên đoạn nối (luôn hiện), mathOverlay hiện-rồi-tan đúng beat tính, lời nhẩm miệng ("cả nhà nhớ giùm: E mười, D mười sáu").
1. (b0) *Lý do fog*: "Nhìn từ trên cao, mắt ta tự mò ra đáp án mà không biết VÌ SAO… tự bịt bớt mắt"
2. (b1) *Luật chơi*: "CHỈ điền khi CHẮC CHẮN… mỗi bước XONG HẲN một điểm, không bao giờ quay lại — không lãng phí một bước nào."
3. (b2) Hiện A + 3 đoạn nối: C=4, G=6, D=18
4. (b3) **GATE 1** — kịch bản bắt buộc: click D → G → C. D: "biết đâu có đường C–D ngắn hơn? (giữ nghi ngờ này)"; G: "biết đâu C–G=1 → 5 < 6?"; C đúng: "mọi đường khác rời A mở màn bằng đoạn ≥ 6, đi tiếp chỉ dài thêm chứ không ngắn lại" (dây dẫn nổ cho S5NegativeEdges)
5. (b4) *Đặt tên CHỐT*: "C xong hẳn, đóng dấu ✓ — gọi là ĐÃ CHỐT"
6. (b5) *Mở từ C BẰNG MIỆNG* (KHÔNG badge): E mới — "4+6=10, điểm thấy rồi mà chưa chắc gọi là ĐANG MỞ"; relax D qua mathOverlay "4+12=16 < 18" — "nghi ngờ lúc nãy là SỰ THẬT! Chưa có giấy bút — cả nhà NHỚ GIÙM: E mười, D mười sáu."
7. (b6) **GATE 2** — "Nhẩm lại nào: G…6, E…10, D…16 (vừa đổi từ 18 đấy). Thử phá từng ứng viên như màn trước." D: "E–D=5? (lát thành sự thật)"; E: "G–E=2?"; G → answer KHÔNG tuyên 'nhỏ nhất nên chọn': "Còn lại G=6. Nhưng công bằng thì G cũng phải bị THỬ PHÁ như hai bạn kia → cho nó một cơ hội" — patch G='current' (đang bị xét, CHƯA khóa)
8. (b7) *Đường lẻn = NHÁT PHÁ HỤT vào G* (cut property nằm TRONG suy luận chọn, cutScene KHÔNG costs): "vùng tối không có cửa sau — lối vào duy nhất là bước qua một điểm sáng đang mở (E=10 hoặc D=16). Mới đến cửa đã tốn ≥ 10 > 6, đi tiếp chỉ dài thêm. KHÔNG PHÁ NỔI → chốt G ✓"
9. (b8) Mở từ G: F (6+12=18), H (6+14=20) qua mathOverlay — "B vẫn bặt tăm"
10. (b9) **TRÍ NHỚ QUÁ TẢI** (beat nhu cầu — chip dấu hỏi tại 4 điểm đang mở): "D đang là bao nhiêu — 18 hay 16? E? F? H?… Người quên thì cộng lại được — nhưng muốn thành QUY TẮC cho máy thì không được 'nhớ mang máng'. Phải GHI RA thôi."
11. (b10) **SHOW-COST**: badge pop đồng loạt — "ghi vào góc mỗi điểm con số tốt nhất ĐÃ BIẾT — cho ĐỠ PHẢI NHỚ… gọi tắt là cost, lát viết code cũng dùng đúng tên này"
12. (b11) **GATE 3** — "Bốn điểm đang mở: E=10, D=16, F=18, H=20 — LẦN ĐẦU con số nằm sẵn trên bản đồ." D/F/H phản ví dụ như cũ; E → answer: "thử phá nốt: mọi ngả khác đến E đều phải bước qua cửa đắt hơn 10 — không phá nổi. Chốt E ✓. (Để ý: cả 3 nghi ngờ vừa nãy đều mượn đường qua E — chính kẻ rẻ nhất.)"
13. (b12) **VỠ RA QUY LUẬT** (strip 3 chip C=4→G=6→E=10 canh phải): "Ba lần thử phá — kẻ sống sót LẦN NÀO cũng là điểm đang mở RẺ NHẤT, lý do lần nào cũng đúng một câu. Vậy từ giờ KHỎI thử từng ứng viên — cứ rẻ nhất là CHỐT thẳng tay."
14. (b13) Mở từ E: THẤY ĐÍCH B=16 + relax D "10+4=14 < 16" → badge D tự sửa 16→14 lóe xanh (lần relax đầu tiên có badge chứng kiến — phần thưởng của việc ghi)
15. (b14) *Thấy đích — chưa được dừng* (suy từ LUẬT vừa đúc): "Hỏi luật: rẻ nhất là D=14, đâu phải B → chính B còn có thể bị phá. Chỉ tin con số khi đã CHỐT."
16. (b15) *Áp luật*: chốt D — kiểm tra B: "14+6=20 > 16 → giữ nguyên" (nhánh không-đổi cũng hiện phép tính)
17. (b16) Chốt B=16 = đích → GIỜ mới dừng; đường A→C→E→B sáng dậy ngược về A
18. (b17) Beat nghỉ: toàn cảnh + strip đủ 5 chip

**`S3Invariant`** (3 beat — "Nhìn lại hành trình"; quy luật ĐÃ vỡ ra ở b12 FogWalk, slide này chỉ nhìn lại, KHÔNG suy diễn mới, KHÔNG replay cut-property):
1. Recap MỘT động tác: "chốt điểm đang mở rẻ nhất → mở các điểm nối từ nó → lặp"
2. Bằng chứng lời hứa (chiều suy luận: luật ⇒ dãy tăng, không phải ngược lại): "dãy số chốt 4→6→10→14→16 chỉ có đi lên — không số nào phải quay lại sửa. Đúng lời hứa đầu màn sương: không một bước lãng phí."
3. Điểm dừng → bắc cầu pseudocode: "muốn tìm đường đến đâu — chốt liên tiếp đến khi gặp nó"

**`S3Pseudocode`**: phát biểu 3 câu (dùng "các điểm nối với nó", chưa dùng "đỉnh kề"): ① Chọn điểm đang mở có cost bé nhất để chốt ② Chốt xong, mở các điểm nối với nó ③ Lặp đến khi chốt hết hoặc gặp đích

### Phần 4 — Từ ý tưởng thành code (4 slide)
- `S4Morph` (MỚI — 3 beat full-screen, mở màn Phần 4): khoảnh khắc "bản đồ cởi áo" dời từ Phần 3 về đây. b0 "Sương tan… máy không có mắt — chỉ làm việc được với dữ liệu" (thành phố + decor, kết quả còn sáng) → b1 "suy luận của ta có lúc nào đụng tên đường, nhà cửa? Chỉ có các điểm và đoạn nối kèm chi phí" (decor dim 0.45) → b2 MORPH map→abstract (~1.1s) + đặt tên ĐỒ THỊ/ĐỈNH/CẠNH. Nhu cầu (b0–b1) trước, tên gọi (b2) sau
- `S4Build` (39 beat): 3 beat cầu nối (3 trạng thái sương ↔ Cost/Visited; map là bảng tra; ngăn tủ mang tên) → dựng code theo kịch bản need→ops, checklist pseudocode pin. **Khoảnh khắc if = "cho máy lỗi CHẠY THẬT"** (không kể suông): tua đến chốt D (B giữ 16 đẹp, lối A–C–E–B sáng mờ) → newCost 14+6=20 → dòng `Cost[đỉnh kề]=newCost` (chưa if — đúng code thật trên màn) thi hành: badge B 16→20 FLASH ĐỎ + lối sáng tắt phụt + highlight đỏ dòng setcost → "máy trả lời 20 ✗" → luật "chỉ ghi khi tốt hơn" → beat riêng nhánh `== null` (ô ghost trống → lần đầu cứ ghi, nên hỏi 'trống?' trước) → wrap if + chạy lại cùng tình huống "20 > 16 → giữ nguyên". Lời ≤ 2 câu/beat — visual là chính. Cuối BUILD dùng `scCostsNoPath` (biết GIÁ, KHÔNG đường sáng — không spoil câu hỏi của S4Prev)
- `S4Prev` (19 beat, 5 màn — visual là chính): (1) Câu hỏi: "16 — nhưng đi lối nào?" (không cạnh nào sáng) + 3 cửa vào B vô danh; (2) Ý ngây thơ: Path[] mọc dần trên bảng + đồ thị sáng theo → bảng PHÌNH TO với bản đồ 1.000 điểm (aside pathExplode tràn khung); (3) Quan sát TRÊN ĐỒ THỊ: 2 route chung hệt đoạn đầu, khác đúng BƯỚC CUỐI → đặt tên Prev (thẻ prevChain — khép khối thẻ liền mạch p2–p6) → thẻ rút đi ĐÚNG lúc cả bản đồ hóa CÂY MŨI TÊN xanh "tôi đến từ đâu" (prevArrows — khác hẳn mũi tên tím Phần 3): đồ thị nở to làm cú reveal; (4) Code hóa với cảnh diễn lại relax THẬT: D cắm mũi tên về C (4+12=16), rồi E relax 14 → mũi tên D XOAY C→E cùng lúc cost đổi → "cùng một khoảnh khắc, cùng một chỗ trong code" → chèn `Prev[đỉnh kề]=min` + morph return; (5) Truy ngược B→E→C→A thắp sáng từng đoạn → LẬT thành A→C→E→B — khép vòng "tư duy ngược". Đường sáng scFull CHỈ xuất hiện từ màn truy ngược
- `S4Debugger`: chạy toàn bộ — code + đồ thị + bảng biến; 3 frame cuối trace ngược Prev (B→E→C→A); autoplay `P`

### Phần 5 — Nhanh hay chậm? + finale (4 slide)
- `S5Counting` (~6 beat, đếm trước — ký hiệu sau): mở bằng "Thuật toán của ta NHANH hay CHẬM? Đếm thử xem nó tốn bao nhiêu bước" (KHÔNG mở bằng chữ "độ phức tạp"). Câu chuyển: "bản đồ thật có hàng nghìn điểm — phóng to tình huống lên 30 điểm xem" → lưới thao tác n≈30: mỗi lần chốt quét n điểm tìm min, lặp n lần → "cỡ n×n bước" (chú thích ngay trên hình: **n = số điểm, E = số đoạn nối**) → cộng E bước duyệt nối → beat E≤n²: "E nhiều nhất bao nhiêu? Mỗi cặp điểm một đoạn nối — n² là kịch trần. Vậy n²+E cùng lắm cỡ 2n² — vẫn là 'cỡ n²'" → GIỜ mới gắn tên: "việc đếm-cỡ-bước này gọi là đánh giá ĐỘ PHỨC TẠP; dân lập trình viết tắt 'cỡ n² bước' là **O(n²)** — ký hiệu tốc ký, không có gì bí hiểm"
- `S5HeapTeaser` (số cụ thể thay log): "Bước nào đang tốn nhất? Quét tìm min: 1.000.000 điểm = 1.000.000 bước MỖI LẦN chốt. Nhưng nếu sắp xếp dữ liệu khéo léo, có cách lấy ra điểm bé nhất chỉ mất chừng… **20 bước**." (log₂10⁶ ≈ 20 — số thật, cảm giác 1.000.000 → 20 mạnh hơn mọi ký hiệu) → phụ chú nhỏ: "con số ~20 ấy dân toán gọi là log n" → O((n+E)log n) hiện như dòng "cho ai tò mò tra cứu thêm". KHÔNG đi sâu heap — đúng yêu cầu chỉ gợi mở
- `S5NegativeEdges` (~5 beat, 2 lời dẫn đỡ trước): (a) "Đồ thị này có thêm thứ bản đồ ta quen: đường MỘT CHIỀU — mũi tên chỉ được đi theo chiều đó, như phố một chiều" (mũi tên xuất hiện lần đầu phải được giới thiệu); (b) "Nếu 'chi phí' không phải mét đường mà là TIỀN? Có đoạn được trợ giá — đi qua còn được NHẬN thêm: chi phí −4." → demo đồ thị có hướng X→Y=2, X→Z=3, Z→Y=−4: thuật toán chốt Y=2 sớm → lộ ra X→Z→Y=−1 < 2 nhưng Y đã chốt → vỡ trận — "nhớ lập luận 'đi tiếp chỉ dài thêm chứ không ngắn lại' ở màn sương mù không? Cạnh âm phá đúng câu đó" → điều kiện tiên quyết: không có cạnh âm
- `S5Reveal`: finale — "Từ đầu đến giờ, mọi người vừa TỰ suy luận ra một thuật toán hoàn chỉnh. Thuật toán này chính là thuật toán tìm đường nổi tiếng nhất thế giới: **Dijkstra** — phát biểu lần đầu cách đây ~70 năm (1956). Ông ấy chỉ là người nói ra đầu tiên — còn suy luận thì, như mọi người vừa thấy, ai cũng làm được."

## Chiến lược animation

- **Motion**: chuyển slide (AnimatePresence `mode="wait"`, trượt ngang theo hướng, <0.6s), layout code panel, tween thuộc tính SVG, traveler, badge/callout/mathOverlay enter-exit
- **CSS thuần**: mọi thứ lặp vô hạn (sương trôi, halo pulse, marching ants, caret nháy)
- KHÔNG AnimatePresence quanh subtree lớn keyed theo `beat` (remount cả đồ thị mỗi nhịp) — beat chỉ đổi props phần tử bền vững
- Không animate filter SVG; rAF StrictMode-safe; nghiệm thu với OBS đang capture

## Thứ tự triển khai (checkpoint REVIEW sub-agent theo CLAUDE.md)

Sau mỗi phase đáng kể: spawn sub-agent review code + đối chiếu tinh thần "dẫn dắt tự nghĩ ra" + UI/UX, sửa theo review trước khi sang phase sau.

1. **Scaffold**: Vite+React+TS, fonts (verify package khi install), theme, Stage → verify dev chạy + dấu tiếng Việt 2 font
2. **Deck engine**: reducer+nav+hash+Shell+HUD+Overview+3 slide giả (1 gate giả) → verify phím, PREV về beat cuối, gate hint/Enter/R/auto-resolve, refresh khôi phục
3. **GraphView abstract + Phần 3** (trước có chủ đích — trái tim nội dung, dùng hết tính năng engine, sai kiến trúc lộ sớm): fog, badge, mathOverlay, gates, silhouette, mũi tên phụ thuộc, đủ 5 slide với kịch bản beat chi tiết ở trên → verify mọi beat tiến/lùi y hệt, phản ví dụ không rò giữa beat → **REVIEW (kỹ thuật + sư phạm)**
4. **Map variant + Phần 1 + traveler + morph** → **REVIEW**
5. **Phần 2 explosion + pruning** (gồm beat hỏi-trước-pruning) → ≥55fps, lùi beat ra trạng thái lắng → **REVIEW**
6. **Code panel + kịch bản Phần 4** (dài nhất): buildCodeState + validator + tokenizer + typewriter + wrap + checklist pseudocode pin + toàn bộ codeScript.ts + mini graph scenes → verify tua lùi 20 beat rồi tiến lại y hệt, wrap không giật → **REVIEW**
7. **Debugger**: trace + VarsPanel + autoplay + 3 frame trace-ngược-Prev → verify trace khớp tính tay (A→C→E→B=16; D 18→16→14; B không update khi chốt D)
8. **Phần 5** (gồm GraphEdge có hướng, các beat dẫn nhập O/log/mũi tên) → **REVIEW tổng thể toàn bài (cả sư phạm)**
9. **Polish + tổng duyệt**: transition, chạy từ đầu đến cuối, `npm run build` + serve dist không mạng, grep dist: "Dijkstra" không lọt ra ngoài S5Reveal; "frontier" không lọt ra UI

## Rủi ro chính

1. Motion `layout` ≠ SVG → chỉ animate attribute trong SVG, text dài ở HTML
2. AnimatePresence exit chiếm chỗ → code line exit `height:0`
3. Space refire nút vừa click → preventDefault + blur()
4. `beats` suy từ độ dài bảng, không hardcode
5. `getTotalLength()` hỏng với `display:none` → `opacity:0`
6. Font dấu tiếng Việt + tokenizer `\p{L}` flag `u` + NFC normalize
7. Spoiler "Dijkstra"/"frontier" lọt ra UI trước S5Reveal
8. Lời dẫn trong code (callout) lệch khỏi kịch bản beat ở mục "Nội dung slide" — kịch bản ở plan này là nguồn chân lý duy nhất cho lời dẫn

## Verification cuối

- Đi hết deck bằng → rồi quay ngược ← từ cuối về đầu — không lỗi hình ở bất kỳ beat nào
- Click mọi đỉnh ở mọi gate → phản ví dụ đã script hiện đúng nội dung; Enter/R hoạt động
- Refresh giữa chừng → đúng slide.beat
- `npm run build` OK; mở dist không mạng → font + asset đúng
- Grep: không "Dijkstra" trước S5Reveal (cả `<title>`), không "frontier"/"sai" trên UI
- Đối chiếu từng slide với kịch bản beat trong plan + NoiDung.md + mục "Những điểm cố ý lệch"
- Tự kiểm bằng câu hỏi của tinh thần: tại mỗi khái niệm mới, NHU CẦU có xuất hiện trước TÊN GỌI không? Tại mỗi gate, khán giả có đủ thông tin để SUY LUẬN (không đoán mò) không?
