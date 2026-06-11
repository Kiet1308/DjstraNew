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
- **Đồ thị**: Phần 1–2 kiểu bản đồ thành phố cách điệu, Phần 3–4 morph sang đồ thị node-cạnh trừu tượng

## Quy tắc CHỐNG SPOILER (luật tối thượng — NoiDung.md dòng 3)

Chuỗi "Dijkstra" **chỉ được render duy nhất ở slide S5Reveal**:
- `<title>` index.html: "Tìm đường ngắn nhất" (tab trình duyệt HIỆN trên livestream)
- Tiêu đề landing: "TÌM ĐƯỜNG NGẮN NHẤT — thử tự mình nghĩ ra cách giải" (KHÔNG nhắc "thuật toán nổi tiếng" — sẽ bắn trước twist của finale)
- OverviewMenu + ProgressHUD: nhãn trung tính ("Phần 5 — Nhìn lại")
- package.json, console.log, comment hiển thị được: không chứa tên thuật toán

## Quy tắc THUẬT NGỮ (tên gọi đến SAU khái niệm — bảng tra cứu khi viết lời dẫn)

| Từ | Quy tắc dùng |
|---|---|
| điểm / đoạn nối | Dùng XUYÊN SUỐT Phần 1–3. KHÔNG nói "đỉnh/cạnh" trước beat morph |
| đồ thị, đỉnh, cạnh | Đặt tên đúng 1 lần tại beat morph: "bỏ phố xá đi, chỉ giữ các điểm và đoạn nối — hình tối giản này dân lập trình gọi là ĐỒ THỊ, mỗi điểm là một ĐỈNH, mỗi đoạn nối là một CẠNH. Tên gọi thôi — nó vẫn là bản đồ của ta". Sau đó dùng tự do |
| chi phí → cost | Phần 1–2 dùng "chi phí". Tại beat show-cost: "gọi tắt là cost — lát viết code cũng dùng tên này" |
| CHỐT | Đặt tên khi C được xác nhận: "C xong hẳn, đóng dấu ✓ — gọi là CHỐT" |
| MỞ | Đặt tên khi E xuất hiện: "thấy điểm mới, ghi tạm chi phí tốt nhất đã biết — gọi là MỞ" |
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
  explosion/         enumeratePaths.ts, ExplosionScene.tsx, useRafLoop.ts
  codepanel/         types.ts, codeScript.ts, buildCodeState.ts, CodePanel.tsx,
                     CodeLineRow.tsx, tokenize.ts
  debugger/          trace.ts, DebuggerSlide.tsx, VarsPanel.tsx
  sections/          s1-intro/  s2-brute/  s3-reverse/  s4-code/  s5-finale/
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
- **Gate tương tác**: click đỉnh không chốt được → state cục bộ hiện overlay phản ví dụ "chưa chắc được" (tự xóa, không lọt deck state). Khi NEXT bị chặn: HUD hint kín đáo "● click đỉnh trên đồ thị · Enter để bỏ qua" + đỉnh ứng viên pulse nhẹ (chống presenter đứng hình). Hit-area ≥ 48px
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
- Morph map→abstract: trong S3LookFromB (~1.2s), xem kịch bản bên dưới

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
- **Checklist 3 câu pseudocode PIN góc màn hình suốt S4Build** (`pseudoStep` của CodeBeat điều khiển): câu đang được dịch thành code sáng lên — ngoại hóa trí nhớ, Minh không phải nhớ 3 câu suốt ~50 beat (tương đương NoiDung lặp lại nguyên văn ở dòng 102/107/129)
- `buildCodeState(script, beat)` = pure fold → lùi beat miễn phí. Dev-validator: fold toàn kịch bản lúc khởi động, assert mọi `afterId/targetId` — bắt typo trước khi lên sóng
- Render HTML (Motion layout OK); exit collapse `height:0`; typewriter trick width `0ch→Nch` (NFC, `"đỉnh kề".length===7`); placeholder tiếng Việt (`if ChốtHết break`) nghiêng màu hổ phách = "TODO chữ, chưa phải code"
- **Beat cầu nối mở đầu Phần 4** (3 nhịp): (1) ánh xạ 3 trạng thái sương ↔ dữ liệu: chưa thấy = `Cost==null` / đã mở = `Cost!=null` / đã chốt = `Visited=true`; (2) **map là gì**: mini-bảng `map[C] = {A:4, D:12, E:6}` cạnh đồ thị — "toàn bộ tấm bản đồ gói trong một bảng: tra tên điểm → nhận danh sách điểm nối kèm chi phí"; (3) mảng index bằng tên: "coi như mỗi điểm có một ngăn tủ mang tên nó — `Cost['C']`"
- Kịch bản bám NoiDung 87–229 (~50-60 CodeBeat): khai báo Cost/Visited → `Cost[start]=0` → `while(true)` + 2 placeholder → vòng for tìm min → replace placeholder 1 → replace placeholder 2 thành `if min == end break` (**callout trỏ ngược về khoảnh khắc "thấy B=16 mà chưa dám dừng" ở FogWalk: "nhớ lúc thấy đích mà chưa dám dừng không? Chính là dòng này — dừng khi đích được CHỐT, không phải khi vừa thấy"**) → `Visited[min]=true` → vòng các điểm nối (đặt tên biến `đỉnh kề` tại đây, kèm "kề = nối trực tiếp") → `newCost` → **wrap** thành if → `return Cost[end]`. Kèm 1 beat "xét lại A: 4+4=8 > 0 → điều kiện if lo hết, không cần code thêm". Slide S4Prev: "biết độ dài, chưa biết đường" → Path[] đầy đủ → "thừa quá" → Prev[] → chèn 2 dòng + morph return
- Layout: 55% code trái / 45% phải = mini GraphView + Callout + checklist pseudocode
- **Debugger cuối Phần 4** (`trace.ts`): thuật toán thật có instrument → ~30-40 `TraceFrame {lineId, scene, vars{Cost,Visited,Prev,min}, note}` tại các câu lệnh đáng nói. Frame đầu note: "Cost[start]=0 khiến A tự động là đỉnh chốt đầu tiên — ý 'xuất phát từ A' nằm gọn trong 1 dòng code". **3 frame cuối: trace ngược Prev** — từ B hỏi "trước mày là ai?" → E → C → A, mỗi cú nhảy thắp sáng một đoạn trên đồ thị, lật ngược lại ra [A,C,E,B] — khép tròn "tư duy ngược" của Phần 3. Phím `P` autoplay 800ms/frame (dừng khi bấm tay). Mọi frame là snapshot đầy đủ → tua lùi an toàn

## Nội dung slide theo 5 phần (18 slide — kịch bản beat chi tiết)

### Phần 1 — Landing + đặt vấn đề (2 slide, đúng yêu cầu 2 trang)
- `S1Title`: tiêu đề "TÌM ĐƯỜNG NGẮN NHẤT — thử tự mình nghĩ ra cách giải" trong làn sương trôi, tên người trình bày, hint "nhấn → để bắt đầu"
- `S1Maps`: bản đồ thành phố cách điệu, pin A và B; beats: các tuyến đường lần lượt sáng với chi phí khác nhau (thời gian, khoảng cách, **tiền xăng**) → "ta muốn tuyến chi phí nhỏ nhất" → câu hỏi treo "Vậy làm thế nào?"

### Phần 2 — Ý tưởng tự nhiên: thử hết mọi đường (4 slide)
- `S2TryAll`: traveler dot đi thử từng đường trên cityGraph — **KHÔNG hiện trọng số từng cạnh, chỉ hiện tổng chi phí mỗi tuyến** (giảm thông tin khán giả "thuộc" trước Phần 3); có lượt vào **ngõ cụt A→G→H, chững lại, quay đầu** ("đường không dẫn đến đích" — NoiDung dòng 19); lưu "tốt nhất hiện tại"
- `S2Explosion`: bigGraph — pool 8 path tái sử dụng + counter `ref.textContent` tăng tốc (1 đường/s → 30/frame), 1 vòng rAF, không setState
- `S2Pruning`: **beat HỎI trước khi phát kiến thức**: freeze traveler giữa một tuyến, con số tổng đỏ dần vượt mốc best-so-far → "tuyến này còn đáng đi tiếp không?" → khán giả tự bật "dừng!" → mới chạy pruning: nhánh cắt flash xám-đỏ, 2 counter "Đã thử / Đã cắt sớm"
- `S2StillSlow`: "...nhưng vẫn phải duyệt hàng trăm đường" → cần một cách NGHĨ khác

### Phần 3 — Tư duy ngược → phát hiện phương pháp (5 slide, trái tim bài)

**`S3LookFromB`** (~6 beat):
1. *Động cơ nhìn ngược* (chưa morph, vá ý NoiDung dòng 51 bị rơi): bên trái từ A tỏa chùm tia rối loạn (callback cảnh explosion), bên phải B chỉ có đúng 3 đường chạm vào — "Đứng ở A nhìn về B: hàng trăm ngả, càng nhìn càng rối — ta vừa nếm mùi rồi. Quay ống kính nhìn B: chỉ có đúng 3 lối dẫn VÀO. Phía nào dễ bắt chuyện hơn? Thử hỏi ngược từ B."
2. *Morph map→abstract* (~1.2s) + đặt tên ĐỒ THỊ/ĐỈNH/CẠNH theo Quy tắc thuật ngữ ("tên gọi thôi — vẫn là bản đồ của ta")
3. *Câu hỏi vật lý thay tuyên bố*: "Một người vừa đặt chân đến B. Bước CUỐI CÙNG của họ xuất phát từ đâu?" → silhouette: chỉ B + 3 cạnh vào từ D/E/F rõ nét, còn lại mờ khối
4. Khán giả tự trả lời → "đường ngắn nhất đến B CHỈ có thể qua 1 trong 3 cửa này"
5. *3 kịch bản hoặc/hoặc/hoặc* (lối nói NoiDung dòng 57, KHÔNG dùng ký hiệu min): "đi tốt nhất đến D rồi sang B, HOẶC tốt nhất đến E rồi sang B, HOẶC tốt nhất đến F rồi sang B — chọn rẻ nhất trong 3"
6. "Bài toán mới: tìm đường tốt nhất đến D, E, F"

**`S3Dependencies`** (~6 beat, vẫn silhouette):
1-2. Lan truyền ngược: muốn tốt nhất đến D lại cần các điểm trước D... mũi tên phụ thuộc (cong, nét đứt, màu riêng) lan dần → "đường ngắn nhất đến MỘT điểm luôn phụ thuộc đường ngắn nhất đến các điểm ngay trước nó"
3. *Mũi tên dồn về A, A phát sáng* (vá cú nhảy NoiDung 61→64 — mắt xích a): "Để ý: hỏi mãi, hỏi mãi… mọi câu hỏi đều dồn về đúng một điểm — A. Mà 'đường ngắn nhất từ A đến A'? Bằng 0. Khỏi nghĩ. Đây là điểm DUY NHẤT ta chắc chắn 100% ngay từ đầu."
4. *Mũi tên đảo chiều, tỏa từ A* (mắt xích b): "Vậy lật ngược ván cờ: thay vì đứng ở B hỏi xuống — chuỗi câu hỏi không có đáy — ta đứng ở A và XÂY câu trả lời đi lên. Đã chắc A. Câu hỏi: điểm nào chắc chắn TIẾP?"
5. *Chuyển cảnh*: "Để trả lời cho công bằng, tự đặt mình vào vai người đứng ở A — chỉ biết những gì mắt mình thấy." → sương bắt đầu phủ

**`S3FogWalk`** (~16 beat, 3 gate — kịch bản chi tiết):
1. *Lý do fog* (fog là công cụ tư duy, không phải hiệu ứng): "Nhìn từ trên cao, mắt ta tự mò ra đáp án mà không biết VÌ SAO. Muốn tìm ra QUY TẮC mà máy móc làm theo được, ta phải tự bịt bớt mắt — chỉ cho phép biết những gì đã khám phá."
2. *Luật chơi* (định nghĩa "chắc chắn" + vì sao chắc chắn = nhanh, trả nợ "sao nhanh hơn brute force"): "Với mỗi điểm, ta muốn điền một con số — độ dài đường ngắn nhất từ A đến nó. Nhưng CHỈ điền khi CHẮC CHẮN: dù sau này khám phá thêm bao nhiêu đường mới, con số đó không bao giờ phải sửa. Vì sao khó tính vậy? Cách thử-tất-cả chậm vì làm đi làm lại. Nếu mỗi bước ta XONG HẲN một điểm, không bao giờ quay lại — không lãng phí một bước nào."
3. Hiện A + 3 cạnh kề: C=4, G=6, D=18
4. **GATE 1** — "Chắc chắn được điểm nào?" **Kịch bản bắt buộc cho presenter: click D trước → click G → rồi mới C** (màn Thử-D/Thử-G LÀ phương pháp suy luận xét-từng-ứng-viên, không phải lỗi; UI hiện "chưa chắc được", không hiện "sai"): D → "biết đâu có đường C–D ngắn hơn? (giữ nghi ngờ này — lát nữa có bất ngờ)"; G → "biết đâu C–G=1 → 4+1=5 < 6?"; C → đúng: "mọi đường khác rời A bằng đoạn ≥ 6, mà **đi tiếp thì chỉ dài thêm chứ không ngắn lại** → không gì ngắn hơn 4 được" (câu mộc này là dây dẫn nổ cho S5NegativeEdges — KHÔNG nói "cost không âm")
5. *Đặt tên CHỐT*: "C xong hẳn, đóng dấu ✓ — gọi là CHỐT"
6. *Show-cost*: đánh dấu vào góc mỗi điểm chi phí tốt nhất đã biết — "gọi tắt là cost, lát viết code dùng luôn tên này"
7. *Mở từ C + đặt tên MỞ*: E hiện =10 ("thấy điểm mới, ghi tạm cost tốt nhất đã biết — gọi là MỞ"); relax D: đường A–C–D sáng 2 đoạn + mathOverlay "4+12=16 < 18" → badge 18→16 flash — "nghi ngờ lúc nãy là THẬT: có đường đến D ngắn hơn qua C!"
8. **GATE 2** — "Chắc chắn tiếp điểm nào?" Phản ví dụ đã script: D → "biết đâu từ E có đường sang D? (sẽ CÓ THẬT: 10+4=14)"; E → "biết đâu G–E=2? 6+2=8 < 10"; G → đúng, chốt G=6
9. *Cut property qua fog* (lập luận VÌ SAO chắc chắn — show 1 lần, các gate sau chỉ nhắc lời): đường giả định nét đứt cố "lẻn" từ A đến G xuyên vùng tối → animation cho thấy nó BẮT BUỘC chui ra khỏi vùng sáng tại một điểm đang mở (E=10 hoặc D=16) — "vùng tối chỉ có một cửa vào: xuyên qua một điểm sáng đang mở. Bước đến cửa nào cũng đã tốn ≥ 10 > 6 rồi, đi tiếp chỉ dài thêm — nên G=6 không thể bị soán ngôi."
10. Mở từ G: F=18, H=20
11. **GATE 3** — frontier 4 điểm {E=10, D=16, F=18, H=20}: D → phản ví dụ E–D (có thật); F → "biết đâu E–F=3? 10+3=13 < 18"; H tương tự; E → đúng, chốt E=10 ("10 nhỏ nhất trong 4 — lập luận y màn trước")
12. Mở từ E: B hiện =16 (mathOverlay "10+6=16") + relax D: "10+4=14 < 16" → badge 16→14
13. *Thấy đích — chưa được dừng* (gài cho `if min == end break`): "Khoan — thấy đích rồi! 16! Dừng được chưa? …Chưa. 16 mới là 'tốt nhất ĐÃ BIẾT'. D=14 còn đang mở kia — biết đâu vòng qua D lại rẻ hơn? Luật của ta: chỉ tin con số khi đã CHỐT."
14. Chốt D=14 → kiểm tra B: mathOverlay "14+6=20 > 16 → giữ nguyên" (nhánh không-làm-gì cũng phải hiện phép tính)
15. Chốt B=16 = đích → GIỜ mới dừng. Đường A→C→E→B sáng dậy ngược về A; F/H dim mờ — khung hình kết sạch
16. Beat nghỉ: toàn cảnh kết quả

**`S3Invariant`** (~4 beat — khán giả tự khái quát trước):
1. Hàng badge xếp theo thứ tự chốt: C=4, G=6, E=10, D=14, B=16 — "Năm lần chốt vừa rồi — có để ý ta luôn chọn theo kiểu gì không?" (số tăng dần tự lộ pattern)
2. Khán giả trả lời → quy luật hiện: "mỗi bước, LUÔN chốt được điểm đang mở có cost nhỏ nhất hiện tại"
3. Vì sao (nhắc lại hình cut-property thu nhỏ): "mọi đường khác phải chui qua một điểm đang mở có cost **không nhỏ hơn**" (chữ chính xác — không nói "lớn hơn")
4. "Muốn tìm đường đến đâu, cứ chốt liên tục đến khi gặp nó"

**`S3Pseudocode`**: phát biểu 3 câu (dùng "các điểm nối với nó", chưa dùng "đỉnh kề"): ① Chọn điểm đang mở có cost bé nhất để chốt ② Chốt xong, mở các điểm nối với nó ③ Lặp đến khi chốt hết hoặc gặp đích

### Phần 4 — Từ ý tưởng thành code (3 slide)
- `S4Build`: 3 beat cầu nối (3 trạng thái sương ↔ Cost/Visited; map là bảng tra; ngăn tủ mang tên) → dựng code theo kịch bản need→ops, checklist 3 câu pseudocode pin góc màn hình
- `S4Prev`: arc Path→Prev
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
