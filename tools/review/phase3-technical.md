# Phase 3 — Technical Code Review (deck engine + GraphView + S3 slides)

Reviewer scope: `src/deck/*`, `src/graph/*`, `src/sections/s3-reverse/*`, `src/components/*`, `src/styles/*`, screenshots `tools/shots/s3/*.png`. Source of truth: `Plan.md` + `CLAUDE.md`. `tsc -b` passes clean.

Tổng kết: **0 CRITICAL · 2 MAJOR · 9 MINOR · 7 NIT**. Toàn bộ số học đồ thị, thứ tự chốt, kịch bản gate, mô hình "chỉ biết cạnh khi mở từ đỉnh chốt" đều đúng với Plan.md (xem mục PASS cuối file).

---

## MAJOR

### M1. `MathOverlayChip`: `transform: translateX(-50%)` bị Motion ghi đè → mọi chip phép tính lệch phải ~nửa chiều rộng, chip b13 chỉ còn cách mép phải canvas ~8px

- **File**: `src/graph/decorations.tsx:177-199`
- Component đặt `style={{ ..., transform: 'translateX(-50%)' }}` **đồng thời** animate `y` và `scale` qua `initial/animate/exit`. Motion quản lý toàn bộ thuộc tính `transform` khi có transform value trong animation — chuỗi `translateX(-50%)` tĩnh trong `style` bị vứt bỏ ngay frame đầu. Kết quả: chip neo mép-trái tại `p.x + dx` thay vì căn giữa.
- **Bằng chứng trên screenshot**: `fog-13.png` — chip `14+6=20 > 16 → giữ nguyên` (B tại x=1590, dx=-60 → left=1530, bề rộng ~380px) kết thúc tại ~x=1912/1920. Chỉ cần text dài thêm 1 ký tự hoặc đổi font metric là tràn khỏi canvas. Các giá trị `dx` hiện tại (−30, −40, −60, +120…) thực chất đã được "tinh chỉnh đè" lên bug này.
- **Fix đề xuất** (giữ căn giữa thật sự, dx quay về vai trò tinh chỉnh nhỏ):
  ```tsx
  // decorations.tsx — MathOverlayChip
  initial={{ opacity: 0, y: 14, scale: 0.92, x: '-50%' }}
  animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
  exit={{ opacity: 0, y: -8, scale: 0.95, x: '-50%' }}
  // và xóa `transform` khỏi style
  ```
  Sau khi sửa phải rà lại các `dx` trong `S3FogWalk.tsx` (b6, b8, b9, b11, b13) vì chúng đang bù trừ cho bug.

### M2. Chip nhãn ghost-edge đè lên cost badge của D tại GATE 3 (phản ví dụ E–F)

- **File**: `src/graph/decorations.tsx:64-69` (nhãn đặt cứng tại trung điểm đoạn), dữ liệu tại `src/sections/s3-reverse/S3FogWalk.tsx:387-393`
- Trung điểm E(1070,265)–F(1230,845) = (1150, 555); cost badge của D nằm tại (1133, 570) (D=(1095,610), size 34). Hai hình chữ nhật giao nhau — xác nhận trên `fog-10-try-F.png`: chip đỏ `3?` chạm/đè lên badge `16` của D đúng lúc presenter đang lập luận "10+3=13 < 18" (badge 16 của D là thông tin đang được so sánh ở gate này).
- **Fix đề xuất**: `GhostEdge` thêm `labelT?: number` (vị trí tham số hóa dọc đoạn, mặc định 0.5) hoặc `labelDx/labelDy`; với `ghost-ef` đặt `labelT: 0.68` (kéo nhãn về phía F, thoát vùng D). Cách rẻ hơn: trong `GhostEdgeView` đẩy nhãn theo pháp tuyến của đoạn (như `GraphEdge` đã làm với weight chip ở `GraphEdge.tsx:49-57`).

---

## MINOR

### m1. `AnimatePresence` bên trong `<mask>` là no-op — exit animation của fog không bao giờ chạy, lùi beat fog "nhảy phụt"

- **File**: `src/graph/GraphView.tsx:113-123`, `src/graph/FogLayer.tsx:32-58`
- `AnimatePresence` chỉ theo dõi **direct children**. Child duy nhất là `<FogMaskContent>` — không bao giờ unmount → các `motion.circle exit={{ r: 0 }}` / `motion.g exit={{ opacity: 0 }}` bên trong là dead code. Hệ quả: tua lùi (vd b6→b5: E biến mất khỏi `revealed`) circle/hành lang biến mất tức thì, không thu lại mềm. Trạng thái lắng cuối vẫn đúng (đạt yêu cầu Plan), nhưng chuyển cảnh lùi bị giật và code thể hiện intent không hoạt động.
- **Fix**: chuyển `AnimatePresence` vào **trong** `FogMaskContent`, bọc trực tiếp 2 danh sách (`litEdges.map`, `revealed.map`) — motion element trong `<mask>` vẫn animate bình thường. Hoặc chấp nhận hành vi và xóa các props `exit`/wrapper để code trung thực.

### m2. Hành lang fog mask tính theo "2 đầu đã lộ" thay vì "cạnh đã biết" — lệch mô hình tri thức

- **File**: `src/graph/FogLayer.tsx:22` (`litEdges = edges.filter(both endpoints revealed)`)
- C–D: từ b2–b5 hành lang C–D đã được "thắp" trong mask dù cạnh C–D chưa được biết (edge bị `hidden` nên hiện tại **không lộ gì** — đã kiểm tra hình học: không cạnh visible nào lọt vào hành lang này; tương tự F–B từ b11). Nhưng đây là bom hẹn giờ: chỉnh layout/radius hoặc thêm cạnh là vùng sáng "thừa" có thể lộ hình học bị che — đúng chỗ Plan coi là critical ("C–D phải ẩn đến beat 6").
- **Fix**: truyền danh sách id cạnh đã biết (chính là `known` của `es()`) xuống `FogMaskContent` qua `GraphSceneState.fog` (vd `fog: { revealed, litEdges? }`), fallback = hành vi hiện tại.

### m3. HUD hint hard-code "click **đỉnh** trên **đồ thị**" — rò thuật ngữ nếu sau này có gate trước beat morph

- **File**: `src/deck/ProgressHUD.tsx:64`
- Khớp nguyên văn Plan dòng 106, và mọi gate hiện tại (S3FogWalk) đều sau morph → **chưa** vi phạm. Nhưng hint này render cho *mọi* gate tương lai; nếu S1/S2 (trước khi đặt tên ĐỒ THỊ/ĐỈNH) thêm gate tương tác thì chữ "đỉnh/đồ thị" lọt ra trước beat morph — vi phạm Quy tắc THUẬT NGỮ.
- **Fix**: thêm `gateHint?: string` vào `SlideDef` (mặc định chuỗi hiện tại), HUD đọc từ slide.

### m4. `ALL_EDGES` chép tay 11 id cạnh, trùng lặp với `cityGraph` — typo sẽ làm cạnh **hiện** nhầm trong sương

- **File**: `src/sections/s3-reverse/S3FogWalk.tsx:22`; liên quan `src/graph/GraphView.tsx:57-61`
- Default của edge không có trong `edgeStates` là `'idle'` (HIỆN). Nếu một id trong `ALL_EDGES`/`K_*` gõ sai (vd `'CA'`), `es()` sẽ bỏ sót cạnh thật → cạnh đó mặc định `idle` và lộ ra giữa màn fog = spoiler. Hiện tại đã đối chiếu đủ 11/11 id khớp `data.ts`, nhưng không có lưới an toàn.
- **Fix**: `const ALL_EDGES = cityGraph.edges.map(e => e.id)`; thêm dev-assert trong `GraphView` (DEV only): mọi key của `scene.edgeStates`/`costs`/`nodeStates` phải tồn tại trong `graph`/`layout` — tinh thần giống dev-validator của code panel trong Plan.

### m5. Id `<defs>` toàn cục (`pathGrad`, `fogSoft`, `depArrowHead`, `edgeArrowHead`) sẽ đụng nhau khi 2 GraphView cùng mount

- **File**: `src/graph/GraphView.tsx:76-112`
- `maskId` đã được namespace bằng `useId` (đúng), nhưng 4 id còn lại thì chưa. Phần 4 theo Plan có "mini GraphView" cạnh code panel — khi slide transition `mode="wait"` hai slide không chồng nhau, nhưng chỉ cần một beat nào đó render 2 GraphView (S4 layout 55/45 + overview/preview) là gradient/marker nhân đôi id (HTML invalid, phần tử đầu trong DOM thắng — có thể sai `gradientUnits` theo layout của graph kia vì `pathGrad` dùng tọa độ A/B của từng layout).
- **Fix**: dùng cùng prefix `useId` cho cả 4 id như đã làm với mask.

### m6. `depArrows.reversed` là dead field — beat "mũi tên đảo chiều" không có animation đảo chiều thật

- **File**: `src/graph/types.ts:59` (khai báo), `src/sections/s3-reverse/S3Dependencies.tsx:167-174` (set `reversed: true`), `src/graph/GraphView.tsx:211-221` (không đọc)
- Beat 5 của S3Dependencies viết arrows đã đảo tay (`A→C` thay vì `C→A`) nên hình đúng; flag `reversed` không ai dùng. Hiệu ứng thực tế: mũi tên cũ exit, mũi tên mới enter (key đổi) — chấp nhận được, nhưng "lật ngược ván cờ" (khoảnh khắc đinh của mạch suy luận) chỉ là fade out/in.
- **Fix tối thiểu**: xóa field. Fix đẹp: key DepArrow theo cặp không thứ tự (`[from,to].sort().join('-')`) và animate đầu mũi tên đổi đầu (markerStart↔markerEnd + đảo `d`) để khán giả THẤY mũi tên quay đầu.

### m7. Tọa độ phantom path hard-code, trùng lặp 2 nơi — desync nếu chỉnh layout

- **File**: `src/sections/s3-reverse/S3FogWalk.tsx:306-316`, `src/sections/s3-reverse/S3Invariant.tsx:58-68`
- `[280,540]`, `[1095,610]`, `[545,815]`… chính là `abstractLayout.A/D/G`. Đổi layout một chút là đường "lẻn" không còn chạm đúng đỉnh, `crossAt` lệch vòng đỏ.
- **Fix**: build từ `abstractLayout` (`const P = (id) => [abstractLayout[id].x, abstractLayout[id].y]`), chỉ giữ các điểm trung gian "vùng tối" là số tay; export scene replay dùng chung cho cả 2 file (hiện cũng duplicate cả `finalScene` ↔ FogWalk b15).

### m8. b14 "đường sáng dậy **ngược về A**" chưa đúng kịch bản — 3 cạnh đổi sang `onPath` đồng loạt

- **File**: `src/sections/s3-reverse/S3FogWalk.tsx:478-516`; `src/graph/GraphEdge.tsx:90-108`
- Plan b15: "Đường A→C→E→B sáng dậy ngược về A". Hiện tại EB/CE/AC cùng lúc đổi stroke → cảm giác "bật công tắc" thay vì lan ngược từ đích — mất đúng cú twist "tư duy ngược" mà beat này phải chốt.
- **Fix**: thêm prop `delay?: number` cho `GraphEdge` (truyền vào `transition.default.delay`), beat table khai báo `EB: 0s, CE: 0.35s, AC: 0.7s` (chỉ áp khi vào beat theo hướng tiến; lùi vào b14 thì delay 0 — dùng `direction` prop đang sẵn trong `SlideProps`).

### m9. Tua lùi vào beat có stagger dài replay từ đầu — "trạng thái lắng" đến chậm 1–1.2s

- **File**: `src/sections/s3-reverse/S3LookFromB.tsx:211-216` (scenario chips delay 0.25+i×0.45), screenshot `lookfromb-4.png` chụp lúc chip thứ 3 chưa hiện (xem NIT n7)
- Lùi từ b5 về b4 (hoặc GOTO) chips remount và chạy lại stagger 1.15s. Không sai trạng thái cuối, nhưng Plan yêu cầu lùi = "đã lắng đọng". `S3Invariant` đã xử lý đúng mẫu này (`delay: beat === 0 ? … : 0`, S3Invariant.tsx:182).
- **Fix**: nhân delay với `direction === 1 ? 1 : 0` (prop có sẵn) hoặc theo mẫu của S3Invariant.

---

## NIT

1. **`useKeyboardNav.ts:36-38`** — `Enter` không `preventDefault`; nếu focus đang nằm trên button (overview vừa đóng bằng chuột nhưng `blur()` đã gọi nên hiếm), Enter có thể "double-fire". Thêm `e.preventDefault()` cho nhất quán với các phím khác.
2. **`S3FogWalk.tsx:567-597`** — nhiều `gate!` non-null assertion; gán `const g = def.gate` sau guard sẽ sạch type-narrowing hơn.
3. **`GraphEdge.tsx:50-55` ↔ `decorations.tsx:22-26`** — logic lật pháp tuyến "hướng lên" lặp 2 nơi; extract `upNormal(a, b)`.
4. **`S3FogWalk.tsx:478-548`** — scene b14/b15 giống hệt nhau (chỉ khác `strip`); `S3LookFromB.tsx` lặp map 8 cạnh dimmed 4 lần — extract const.
5. **`placeholders.tsx:4`** — stub hardcode `beats = 2`; chấp nhận được cho stub nhưng ngược khẩu hiệu "beats luôn suy từ bảng" nếu ai copy mẫu này.
6. **`CostBadge.tsx:55-66`** — khi LÙI beat làm cost TĂNG (b6→b5: D 16→18) chip vẫn pop scale 1.15 — nhiễu nhẹ trên nguyên tắc "lùi là trạng thái lắng". Có thể truyền hướng deck xuống hoặc chỉ pop khi giảm.
7. **`tools/shots/s3/lookfromb-4.png`, `invariant-0.png`** chụp giữa stagger (chip kịch bản F và chip E=10/D=14/B=16 chưa hiện) — script `shoot-s3.mjs` nên đợi settle (~1.5s) trước khi chụp, kẻo review nhầm là bug.

---

## Screenshot audit (yêu cầu kiểm riêng)

| Shot | Kết luận |
|---|---|
| `fog-3-blocked-hint` | OK — 3 ứng viên C/G/D pulse, HUD hint kín đáo, không spoil đáp án |
| `fog-3-try-D`/`try-G` | OK — ghost C–D `?` / C–G `1?`; callout "Chưa chắc được… 4+1 = 5 < 6" đúng số, đúng chữ (không "sai") |
| `fog-7-try-E` | OK — ghost G–E `2?`, "6+2 = 8 < 10" đúng; chip cắt ngang cạnh CD hơi rối nhưng đọc được |
| `fog-10-try-F` | **Lỗi M2** — chip `3?` đè cost badge D=16 |
| `fog-6`, `fog-11` | OK — overlay relax `4+12=16 < 18`, `10+4=14 < 16` đúng vị trí tương đối, badge D đổi số |
| `fog-8` | OK — phantom lẻn A→(vùng tối)→D→G + vòng đỏ tại D + chip "đã tốn ≥ 16" không che đồ thị |
| `fog-13` | **Lỗi M1** — chip "14+6=20 > 16 → giữ nguyên" sát mép phải canvas (~8px) |
| `lookfromb-1` | OK — morph beat, đặt tên ĐỒ THỊ/ĐỈNH/CẠNH, không weight (không lộ số sớm) |
| `lookfromb-4` | Chụp giữa stagger (NIT 7); bố cục 2 chip + HOẶC đúng thiết kế |
| `deps-4`, `deps-5` | OK — mũi tên tím tỏa từ A khác biệt rõ với cạnh; cảnh sương phủ chỉ còn A đúng "không góc nhìn thượng đế" |
| `invariant-0`, `invariant-3` | OK — nền graph 22% làm phông, dãy chip tăng dần, focus B có glow; invariant-0 chụp giữa stagger |
| `pseudo-2` | OK — 2/3 câu, chữ 36px, sạch |
| `rewind-landing` | OK — lùi xuyên slide về stub S2 beat cuối, không vỡ hình |

Không phát hiện chữ nào < 18px tương đương trên canvas nội dung (weight chip 20px, badge 22px, callout 30px); contrast trên nền `#0b1220` đạt (cyan/amber/red đều nổi). Không phần tử nào off-canvas ngoài rủi ro M1.

---

## PASS — các ràng buộc đã xác minh (để khỏi review lại)

- **Không dùng Motion `layout` prop ở bất kỳ đâu** (grep toàn `src/`); SVG chỉ animate attribute/transform; `transformBox: 'fill-box'` dùng đúng chỗ scale (GraphNode ✓ check, CostBadge pop, halo CSS).
- **AnimatePresence không key theo `beat` quanh subtree lớn** — chỉ `DeckShell` key theo `slide.id`; callout key theo beat là phần tử nhỏ, đúng chủ trương.
- **`beats` luôn suy từ `BEATS.count`**, `gateBeats` suy từ bảng (`S3FogWalk.tsx:550-552`); `defineBeats.at()` clamp an toàn khi slide đang exit giữ props cũ.
- **Không có "∞"** trong toàn `src/` (chỉ 1 comment nhắc cấm); `CostBadge` value `null` → ghost chip nét đứt.
- **Chống spoiler**: "Dijkstra" không xuất hiện trong `src/`, `index.html` (`<title>` = "Tìm đường ngắn nhất"), `package.json` (`tim-duong-ngan-nhat`); "frontier" chỉ là tên enum/biến nội bộ, không lọt chuỗi UI; không từ "sai" trong UI (chỉ "Chưa chắc được"); "đỉnh kề" chỉ trong comment dev. Beat 0 S3LookFromB dùng "ngả/lối/điểm/đoạn nối" — sạch trước morph.
- **Toán & kịch bản khớp Plan 100%**: 11 cạnh đúng trọng số; chốt C=4→G=6→E=10→D=14→B=16; relax D 18→16→14 (flash xanh hoạt động đúng nhờ `prevRef` — remount khi rewind không gây false-flash vì ref reset về null); khi chốt D: "14+6=20 > 16 → giữ nguyên" hiện như nhánh không-đổi; mọi phản ví dụ gate (C–G=1→5<6; G–E=2→8<10; E–F=3→13<18; E–H=5→15<20) đúng số nguyên.
- **Mô hình tri thức fog đúng ở lớp cạnh**: `K_A…K_D` chỉ thêm cạnh khi đỉnh chốt được mở; **C–D ẩn suốt b2–b5 dù C lẫn D đã lộ** (chỉ hành lang mask bị thắp sớm — xem m2); F–B không bao giờ hiện (F chưa từng chốt), nhất quán giữa FogWalk b14/15 và Invariant `finalScene`.
- **Reducer/gate đúng đặc tả**: NEXT chặn + nudge; PREV về beat cuối slide trước; PREV/GOTO/hash-restore vào gate → auto-resolve; `R` re-arm; `Enter` ép resolve; resolved bền trong phiên; nudge reset mọi nhánh chuyển beat; `e.repeat` chặn; Space preventDefault; overview chặn nav.
- **State cục bộ gate không rò**: `attempt` clear theo `[beat]` (chạy trước paint của render kế tiếp nhờ guard `attempt.beat === beat` ngay trong render), timeout 7s có cleanup, Enter-skip ẩn counter ngay lập tức; ghost edge gắn vào scene phái sinh, không vào deck state.
- **getTotalLength/display:none**: `usePointAlongPath` (Phase 4) đã ghi đúng quy tắc `opacity: 0`; Phase 3 không dùng `getTotalLength`, không dùng rAF (ChaosRays là pseudo-random có seed, render-pure, StrictMode-safe).
- **Hiệu năng**: hiệu ứng lặp vô hạn đều là CSS (fog-drift, halo, ants, hud-dot); mask không dùng `feGaussianBlur`; không setState trong vòng animation; re-render per beat chỉ ~50 phần tử SVG — ổn cho trình chiếu.
