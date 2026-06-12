# 04 — Thiết kế lại S3FogWalk + S3Invariant

> Nhiệm vụ: (Ý 1) hoãn show-cost — làm 2–3 lần chốt "bằng tay" trước, hiện cost khi NHU CẦU "đỡ phải nhớ" thật sự xuất hiện; (Ý 2) quy luật "chốt điểm đang mở rẻ nhất" phải được KHÁM PHÁ NGAY TRONG LÚC ĐI (lập luận đường-lẻn nằm tại các gate), không phải tổng kết kiểu "nhìn dãy số tăng dần" ở slide sau.

---

## 1. Hiện trạng (đã đọc code + screenshot)

### 1.1. S3FogWalk — 16 beat, gate tại b3 / b7 / b10 (`src/sections/s3-reverse/S3FogWalk.tsx`)

| Beat | Nội dung | Cost badge? |
|---|---|---|
| b0 | Lý do bịt mắt ("Nhìn từ trên cao, mắt ta tự mò ra đáp án mà không biết VÌ SAO…") | — |
| b1 | Luật chơi ("CHỈ điền khi CHẮC CHẮN… XONG HẲN một điểm, không bao giờ quay lại") | — |
| b2 | Mở mắt tại A: 3 đoạn nối C=4, G=6, D=18 (trọng số trên cạnh, KHÔNG badge) | — |
| b3 | **GATE 1** — thử D ("biết đâu C–D… giữ lấy nghi ngờ này"), thử G ("C–G=1?"), C đúng | — |
| b4 | Đặt tên CHỐT (A + C nhận ✓) | — |
| b5 | **SHOW-COST** — *"Đầu óc bắt đầu phải nhớ nhiều rồi — đánh dấu vào góc mỗi điểm chi phí tốt nhất ĐÃ BIẾT tính đến giờ. Dân code lười viết dài, gọi tắt là cost…"* — badge A0/C4/G6/D18 | ✓ từ đây |
| b6 | Mở từ C + đặt tên MỞ + relax D (badge 18→16 flash, mathOverlay "4+12=16 < 18") | ✓ |
| b7 | **GATE 2** — "Ba điểm đang mở: G=6, E=10, D=16" — thử D (E–D=5?), thử E (G–E=2?), G đúng. Answer: *"G, cost 6 — nhỏ nhất trong các điểm đang mở. Nhưng lần này đừng tin ngay — thử phá nó xem có đứng vững không →"* | ✓ |
| b8 | Cut property — đường lẻn nét đứt đỏ xuyên vùng tối, overlay "bước qua cửa này → đã tốn ≥ 10" (cutScene CÓ badge) | ✓ |
| b9 | Mở từ G: F=18, H=20 | ✓ |
| b10 | **GATE 3** — thử D/F/H (ghost qua E), E đúng. Answer: *"E — cost 10, nhỏ nhất trong 4. Lập luận y màn trước: mọi ngả khác đều phải chui qua một cửa đắt hơn 10."* | ✓ |
| b11 | Mở từ E: THẤY ĐÍCH B=16 + relax D 16→14 | ✓ |
| b12 | Thấy đích — CHƯA được dừng ("D=14 còn đang mở kia… chỉ tin con số khi đã CHỐT") | ✓ |
| b13 | Chốt D, kiểm tra B: "14+6=20 > 16 → giữ nguyên" | ✓ |
| b14 | Chốt B = đích → dừng, đường A→C→E→B sáng ngược về A (finalScene) | ✓ |
| b15 | Beat nghỉ + dải chip C=4→G=6→E=10→D=14→B=16 (strip hardcode) | ✓ |

### 1.2. S3Invariant — 4 beat (`S3Invariant.tsx`)

- b0: đồ thị mờ 0.22 + dải chip — *"Năm lần chốt vừa rồi — có để ý ta luôn chọn theo kiểu gì không? Nhìn dãy số phía trên."*
- b1: *"Dãy số chỉ có tăng dần — vì ở mỗi bước, ta luôn chốt được điểm ĐANG MỞ có cost nhỏ nhất hiện tại."* ← **bị chê đích danh**
- b2: replay cutScene — *"Vì sao luôn chốt được? Nhớ đường 'lẻn': mọi ngả khác đều phải chui qua một điểm đang mở có cost không nhỏ hơn — rồi từ đó đi tiếp chỉ dài thêm."* ← **phải chuyển vào lúc đi**
- b3: focusB — *"Vậy muốn tìm đường ngắn nhất đến đâu — cứ chốt liên tiếp cho đến khi gặp nó. Gặp B là xong việc."*

### 1.3. Hạ tầng liên quan

- **Gate** (`deck/DeckProvider.tsx`): NEXT chặn khi `gateBeats` chứa beat hiện tại và chưa resolve (tăng `nudge` → đỉnh pulse); PREV/GOTO rơi vào gate → **auto-resolve**; key = `${slideId}:${beat}` bền trong phiên; `R` re-arm. `GATE_BEATS` của FogWalk **suy tự động** từ bảng (`b.gate ? i : -1`) — đánh số lại beat KHÔNG phải sửa tay.
- **CostBadge**: `value:null` = chip ghost rỗng nét đứt; giá trị GIẢM → pop + lóe xanh; giá trị xuất hiện lần đầu (prev=null) → KHÔNG lóe (đúng: lần ghi đầu không phải relax); TĂNG (chỉ khi tua lùi) → đổi im lặng.
- **GraphView**: badge chỉ render khi `scene.costs` có key và đỉnh đã lộ; trọng số cạnh (`weights:true`) hiện trên MỌI cạnh đã biết — đây là "biển chỉ đường" vật lý, độc lập với badge.
- **mathOverlay**: chip HTML cạnh đỉnh, keyed `at:text`, enter/exit theo beat → dùng được làm "con số hiện rồi tan".
- **FINAL_BEAT = 14** hardcode (delay đường sáng ngược); strip beat cuối hardcode 5 nhãn.
- Script chụp `tools/shoot-s3.mjs` hardcode: 16 beat, gate 3/7/10, invariant 4 beat, lùi 37 nhịp. `tools/full-walk.mjs` hardcode tọa độ click theo hash `#s3-trong-suong.3/.7/.10`.

---

## 2. Chẩn đoán

**Ý 1 — show-cost ở b5 quá sớm và nhu cầu GIẢ.** Tại b5 mới phải nhớ 3 con số (4, 6, 18) mà cả 3 đều đang in sẵn trên cạnh — câu "đầu óc bắt đầu phải nhớ nhiều rồi" chưa có gì chống lưng, khán giả chưa hề THẤM cái mệt của việc nhớ. Khoảnh khắc nhu cầu thật là sau khi mở từ G: 4 điểm đang mở (E=10, D=16, F=18, H=20), trong đó **D vừa đổi giá một lần** (18→16) — con số đã-từng-đổi là thứ khó nhớ nhất. Đó mới là lúc "ghi ra cho đỡ phải nhớ" tự bật ra.

**Ý 2 — phát hiện quy luật bị đẩy ra slide sau, và bị suy từ "dãy số tăng dần".** Lập luận đường-lẻn ở b8 thực ra đã nằm trong lúc đi, nhưng (a) nó được đóng khung là "kiểm chứng lại sau khi đã chọn G vì nhỏ nhất" — tức tiêu chí "nhỏ nhất" được TUYÊN trước khi có lý do; (b) khoảnh khắc khái quát hóa "lần nào cũng vậy!" lại nằm tận S3Invariant, qua quan sát dãy số — kiểu quy nạp hậu nghiệm, không phải vỡ ra trong trận. Cần: tại mỗi gate, "nhỏ nhất" là **kẻ sống sót của trò thử-phá-từng-ứng-viên** (kể cả chính nó cũng bị thử phá); đến gate 3, sau 3 lần liên tiếp kẻ sống sót đều là kẻ rẻ nhất với CÙNG MỘT lý do → vỡ ra quy luật ngay tại đó; phần còn lại của màn sương (chốt D, chốt B) trở thành màn ÁP DỤNG luật — khán giả thấy ngay phần thưởng: khỏi thử từng ứng viên nữa.

Hai ý khớp nhau một cách may mắn: gate 1, gate 2 vốn **không cần badge** (mọi con số đều suy được từ trọng số cạnh đang hiện), còn gate 3 — gate đông ứng viên nhất — lại là gate đầu tiên ĐƯỢC badge phục vụ. "Ghi ra" và "vỡ ra quy luật" cùng đậu ở cụm gate 3, không giẫm chân nhau vì mỗi thứ một beat.

---

## 3. Thiết kế mới S3FogWalk — 18 beat, gate tại b3 / b6 / b11

Nguyên tắc hiển thị con số TRƯỚC show-cost (3 tầng, không tầng nào là badge):
1. **Trọng số cạnh** — luôn hiện trên đoạn nối đã biết (biển chỉ đường vật lý, không phải trí nhớ).
2. **mathOverlay tại khoảnh khắc tính** — "4+6=10" hiện đúng beat đang mở/relax, beat sau TAN (con số rơi về trí nhớ).
3. **Lời dẫn nhẩm miệng** — presenter đọc to và NHỜ khán giả nhớ giùm ("E mười, D mười sáu") — chính hành vi nhẩm này là mồi cho nhu cầu ghi chú.

> Khán giả không bao giờ bị thiếu thông tin để suy luận: quên thì luôn cộng lại được từ trọng số cạnh đang hiện. Mệt-nhưng-làm-được chính là lập luận cho việc ghi ra.

| # | Tên beat | Visual | Lời dẫn (chốt chữ) |
|---|---|---|---|
| b0 | Lý do bịt mắt | giữ nguyên | giữ nguyên |
| b1 | Luật chơi | giữ nguyên | giữ nguyên |
| b2 | Mở mắt tại A | giữ nguyên (weights, KHÔNG costs) | giữ nguyên |
| b3 | **GATE 1** | giữ nguyên (counters D/G, ghost edges) | giữ nguyên — answer C đã chứa mầm lập luận: *"mọi đường khác rời A đều mở màn bằng đoạn ≥ 6, mà đi tiếp thì chỉ dài thêm chứ không ngắn lại"* |
| b4 | Đặt tên CHỐT | giữ nguyên | giữ nguyên |
| b5 | Mở từ C + đặt tên MỞ + relax D **bằng miệng** | fog R_C; AC+CD `relaxing`, CE `active`; mathOverlays "4+6=10" (E), "4+12=16 < 18" (D); **KHÔNG costs** | "Chốt C rồi thì từ C nhìn tiếp: thấy điểm mới **E** — đường tốt nhất đã biết đến nó: 4+6=**10**. Điểm thấy rồi mà chưa chắc, gọi là **ĐANG MỞ**. Và kìa — có đường C–D thật: 4+12=**16 < 18**. *Nghi ngờ lúc nãy là SỰ THẬT* — đến D qua C ngắn hơn! Chưa có giấy bút — cả nhà **nhớ giùm**: E mười, D mười sáu." |
| b6 | **GATE 2** | fog R_C; **KHÔNG costs, overlay đã tan**; counters giữ nguyên (D: ghost E–D=5?, E: ghost G–E=2?) | Hỏi: "Ba điểm đang mở. Nhẩm lại nào: G… **6**, E… **10**, D… **16** *(vừa đổi từ 18 đấy)*. Chắc chắn tiếp được điểm nào? Thử phá từng ứng viên như màn trước — click thử." — Answer khi click G (đổi hẳn, KHÔNG tuyên 'nhỏ nhất nên chọn' nữa): "Còn lại **G=6**. Nhưng công bằng thì G cũng phải bị thử phá như hai bạn kia: *biết đâu trong sương có đường nào đó đến G rẻ hơn 6?* Cho nó một cơ hội →" — patch gate: `G:'current'` (đang bị xét, CHƯA khóa) |
| b7 | Đường lẻn thử phá G → thất bại → CHỐT | cutScene **bỏ costs**, G `current`, E/D là cửa; phantom + overlay "bước qua cửa này → đã tốn ≥ 10" | "Cho một đường **'lẻn'** từ A đến G xem. Muốn lang thang trong vùng tối thì trước hết phải *chui được vào* — mà vùng tối **không có cửa sau**: lối vào duy nhất là bước qua một điểm đang mở (E hay D). Mới đặt chân đến cửa đã tốn **≥ 10 > 6** rồi, đi tiếp chỉ dài thêm. Không phá nổi → G=6 **CHẮC CHẮN. Chốt ✓**" |
| b8 | Mở từ G | fog R_G, G `locked`; GF/GH `active`; overlays "6+12=18" (F), "6+14=20" (H); **KHÔNG costs** | "G nhận dấu ✓, từ G nhìn tiếp: thấy **F** (6+12=18) và **H** (6+14=20). Sương lùi dần — nhưng B vẫn bặt tăm." |
| b9 | **Trí nhớ quá tải** (beat mới — nhu cầu) | như b8, overlay tan; thay bằng mathOverlays dấu hỏi tại 4 điểm đang mở: D "18 hay 16?", E "?", F "?", H "?" | "Kiểm tra trí nhớ cái nào: **D đang là bao nhiêu — 18 hay 16?** E? F? H?… Mới bảy điểm mà đầu đã muốn rối. Người quên thì cộng lại được — nhưng muốn thành **QUY TẮC cho máy làm theo** thì không được phép 'nhớ mang máng'. Phải **ghi ra** thôi." |
| b10 | **SHOW-COST** (chuyển từ b5 cũ về đây) | costs = {A:0, C:4, G:6, E:10, D:16, F:18, H:20} pop đồng loạt (locked = vàng, đang mở = cyan) | "Ghi vào góc mỗi điểm con số **tốt nhất ĐÃ BIẾT** — *cho đỡ phải nhớ*. Điểm đã chốt thì số ấy là vĩnh viễn; điểm đang mở thì mới là 'tạm thời tốt nhất'. Dân code lười viết dài, gọi tắt là **cost** — lát viết code cũng dùng đúng tên này. Từ giờ: mắt đọc bản đồ, không bắt não nhớ nữa." |
| b11 | **GATE 3** | costs giữ; counters D/F/H giữ nguyên (cả 3 ghost đều mượn đường qua E!) | Hỏi: "Bốn điểm đang mở: E=10, D=16, F=18, H=20 — *lần đầu con số nằm sẵn trên bản đồ*. Chắc chắn tiếp điểm nào? Click thử." — Answer: "**E** — thử phá nốt: mọi ngả khác đến E đều phải bước qua một trong các cửa đang mở còn lại: D=16, F=18, H=20. Cửa nào cũng đắt hơn 10 sẵn rồi, đi tiếp chỉ dài thêm — **không phá nổi. Chốt E ✓**. *(Để ý: cả 3 nghi ngờ vừa nãy đều phải mượn đường qua E — chính kẻ rẻ nhất.)*" |
| b12 | **VỠ RA QUY LUẬT** (beat mới — đỉnh điểm Ý 2) | scene gate-3 đã khóa E; dải 3 chip **C=4 ✓ → G=6 ✓ → E=10 ✓** hiện góc trên-PHẢI (né callout trái) | "Khoan… để ý không? Ba lần thử phá — kẻ sống sót **lần nào cũng là điểm đang mở RẺ NHẤT**. Mà lý do thì lần nào cũng đúng một câu: *mọi ngả khác phải bước qua một cửa đắt hơn nó, rồi đi tiếp chỉ dài thêm*. Rẻ nhất thì không ai phá nổi. Vậy từ giờ **khỏi thử từng ứng viên** — cứ điểm đang mở rẻ nhất là **CHỐT thẳng tay**." |
| b13 | Mở từ E: THẤY ĐÍCH + relax D lần 2 | fog R_E; overlays "10+6=16" (B), "10+4=14 < 16" (D); badge D **16→14 lóe xanh** — lần relax ĐẦU TIÊN có badge chứng kiến | "Mở từ E: **THẤY ĐÍCH B!** 10+6=16. Và đường E–D **có thật**: 10+4=**14** — nghi ngờ từ hai màn trước thành sự thật nốt. Nhìn góc điểm D kìa: con số *tự sửa* 16 → 14 — may mà đã ghi ra, khỏi ai phải nhớ." |
| b14 | Thấy đích — CHƯA được dừng (chạy lại bằng LUẬT) | B `current`, costs đủ | "Khoan — thấy đích rồi! B=16. Dừng được chưa? **…Chưa.** Hỏi luật vừa đúc: điểm đang mở rẻ nhất là **D=14**, đâu phải B. Nghĩa là chính B còn có thể bị phá — biết đâu vòng qua D lại rẻ hơn? 16 mới là 'tốt nhất ĐÃ BIẾT' — **chỉ tin con số khi đã CHỐT**." |
| b15 | Chốt D theo luật + kiểm tra B | như b13 cũ (D locked, DB active, overlay "14+6=20 > 16 → giữ nguyên") | "Áp luật — **khỏi đắn đo**: D=14 rẻ nhất → CHỐT. Kiểm tra ngả từ D sang B: 14+6=20 > 16 → **B giữ nguyên**. Vòng qua D không rẻ hơn — nghi ngờ cuối cùng tắt." |
| b16 | Chốt B = đích → GIỜ mới dừng | finalScene + edgeDelays sáng ngược B→A (FINAL_BEAT mới = 16) | "Rẻ nhất bây giờ là chính **B=16** → CHỐT B. B là đích — **GIỜ** mới được dừng. Đường ngắn nhất: **A → C → E → B = 16**." |
| b17 | Beat nghỉ | finalScene + strip 5 chip như cũ | (không lời) |

**Đối chiếu yêu cầu:** 2 lần chốt "bằng tay" (C, G) + gate 3 là lần đầu có ghi chú — đúng "2–3 cái bằng tay"; chữ "cho đỡ phải nhớ" nằm nguyên văn ở b10; mọi phản ví dụ script cũ giữ nguyên (kể cả "giữ lấy nghi ngờ này", "nghi ngờ này lát nữa cũng thành SỰ THẬT", "Sắp thấy ngay!"); "thấy đích chưa được dừng" giữ và còn MẠNH hơn vì suy ra từ luật; gate 1 & 2 vẫn đủ dữ kiện suy luận (trọng số cạnh + nhẩm miệng + tự cộng lại được).

**Vì sao b9 dùng mathOverlay dấu-hỏi chứ KHÔNG dùng chip ghost rỗng:** chip ghost (CostBadge value=null) đã được Plan dành riêng cho mental model "Cost == null = chưa thấy điểm" (Phần 4). Ở b9 các điểm đều ĐÃ thấy, chỉ là chưa ghi — dùng ghost sẽ làm nhiễu phép ánh xạ sương↔dữ liệu ở beat cầu nối S4. Dấu hỏi "18 hay 16?" theo nghĩa đen là trí-nhớ-đang-mờ, đúng ý hơn.

---

## 4. Số phận S3Invariant — đề cử: GIỮ slide, viết lại thành "Nhìn lại + đúc quy trình" (3 beat)

| Phương án | Mô tả | Đánh giá |
|---|---|---|
| **A (đề cử)** | Giữ slide (id `s3-quy-luat`), viết lại 3 beat: recap động tác → bằng-chứng-lời-hứa → điểm dừng | Churn thấp nhất: deck giữ 18 slide, hash/Overview/HUD không đổi, vẫn có nhịp THỞ giữa màn sương dài 18 beat và S3Pseudocode |
| B | Gộp 2 beat vào cuối FogWalk, xóa slide | FogWalk phình 20 beat; deck còn 17 slide → sửa deck.ts, OverviewMenu, full-walk, memory "18 slide"; mất nhịp thở. Không đáng |
| C | Giữ nguyên 4 beat, chỉ sửa chữ | Không đạt: b1–b2 cũ vẫn là "phát kiến thức hậu nghiệm" — đúng cái bị chê |

**Kịch bản A — 3 beat** (đổi title hiển thị: "Quy luật lộ ra" → **"Nhìn lại hành trình"**):

- **b0** — finalScene mờ 0.22 + dải 5 chip: "Cả màn sương vừa rồi, gói lại chỉ còn **MỘT động tác** lặp đi lặp lại: *chốt điểm đang mở rẻ nhất → mở các điểm nối từ nó → lặp*." (recap luật ĐÃ vỡ ra ở b12 FogWalk — không suy diễn gì mới)
- **b1** — bằng chứng lời hứa (đảo chiều suy luận so với bản cũ — luật ⇒ dãy tăng, không phải dãy tăng ⇒ luật): "Và để ý món quà: dãy số chốt **4 → 6 → 10 → 14 → 16** chỉ có đi lên — không số nào phải quay lại sửa. Đúng **lời hứa đầu màn sương**: mỗi bước xong hẳn một điểm — *không một bước lãng phí*." → trả nợ trực tiếp câu hỏi "vì sao nhanh hơn thử-tất-cả" của b1 FogWalk. *(Beat này CÓ THỂ cắt nếu chủ dự án vẫn dị ứng mọi nhắc nhở "dãy tăng dần" — cắt xong slide còn 2 beat vẫn đứng được.)*
- **b2** — focusB (giữ từ b3 cũ): "Muốn tìm đường đến đâu — **chốt liên tiếp** đến khi gặp nó. Gặp **B** là xong việc." → bắc cầu sang S3Pseudocode ("Phát biểu thành lời — đúng 3 câu").

Bỏ hẳn beat replay cutScene (b2 cũ) — lập luận đường-lẻn giờ sống ở b7/b11/b12 của FogWalk, replay lại là dạy-học-thuộc.

---

## 5. Thay đổi code chi tiết

### 5.1. `src/sections/s3-reverse/S3FogWalk.tsx` (sửa chính)

1. **Bảng BEATS 16 → 18 mục** theo mục 3. Cụ thể:
   - XÓA b5 cũ (show-cost) khỏi vị trí; b5/b6 mới (mở-từ-C, gate 2) bỏ `costs`, bỏ overlay ở beat gate.
   - THÊM b9 (trí nhớ quá tải — mathOverlays dấu hỏi, chỉnh `dx/dy` né badge/weights), b10 (show-cost), b12 (vỡ ra quy luật).
   - Hằng cost: xóa `COSTS_SHOW`, `COSTS_C` (không còn beat nào dùng); `COSTS_G` thành bộ badge đầu tiên (b10–b12); `COSTS_E` giữ (b13+).
2. **Gate 2** — `patch: { nodeStates: { G: 'current' } }` (thay `locked`); G chỉ `locked` từ b8. Lưu ý hệ quả: tua lùi từ b7+ về b6 (gate auto-resolve) sẽ thấy G `current` — đúng trạng thái "đang bị xét", chấp nhận được.
3. **Gate 1, 3** — giữ nguyên patch; chỉ thay text answer gate 3 như mục 3.
4. **`strip` tổng quát hóa**: `strip?: string[]` thay boolean (hiện hardcode 5 nhãn trong JSX). b12 dùng `['C=4', 'G=6', 'E=10']`, b17 dùng đủ 5. **Layout b12**: callout nằm trái (x70, w900) — strip 3 chip phải canh PHẢI (justifyContent flex-end + paddingRight ~80) kẻo đè; b17 không callout nên canh giữa như cũ → thêm prop vị trí hoặc suy từ "beat có callout hay không".
5. **`FINAL_BEAT`**: đừng sửa số tay lần nữa — thêm cờ `finalReveal?: true` vào b16 và suy `const FINAL_BEAT = BEATS.table.findIndex(b => b.finalReveal)`.
6. `GATE_BEATS` tự suy từ bảng → tự thành [3, 6, 11], không sửa tay.
7. **`gateHint`**: đổi `'click đỉnh trên đồ thị'` → `'click điểm trên bản đồ'` + xóa comment "các gate đều SAU beat morph…" (thay đổi song song: Phần 3 giữ map, morph dời sang Phần 4 — chữ "đỉnh/đồ thị" không còn được phép ở đây).

### 5.2. `src/sections/s3-reverse/scenes.ts`

- **`cutScene`**: (a) **XÓA `costs`** — b7 mới badge CHƯA tồn tại (đây là lý do S3Invariant không replay được nó nữa, tiện thể đúng ý feedback); (b) `G: 'current'` (đang bị thử phá) thay `locked`; E/D đổi `current` → `frontier` (cửa = điểm đang mở bình thường, đã có phantom `crossAt` + `cutOverlay` tô điểm cửa E rồi — 3 đỉnh cùng pulse sẽ loãng tiêu điểm). Giữ `cutOverlay` "bước qua cửa này → đã tốn ≥ 10" (con số 10 suy được từ lời + trọng số cạnh, không cần badge).
- **`finalScene`**: giữ nguyên.
- **Tương thích map-variant**: `cutPhantom.points` là tọa độ pixel theo `abstractLayout` — khi Phần 3 chuyển hẳn sang map phải tính lại theo `mapLayout` (việc của thay đổi song song, nhưng cần nhớ kẻo đường lẻn bay lạc).

### 5.3. `src/sections/s3-reverse/S3Invariant.tsx`

- Bảng BEATS 4 → 3 theo mục 4; bỏ import `cutScene`; bỏ beat `graphOpacity:1`; `title: 'Nhìn lại hành trình'`; giữ id `s3-quy-luat` (hash/Overview ổn định). CHIPS giữ nguyên.

### 5.4. Tools (bắt buộc, kẻo verify gãy)

- **`tools/shoot-s3.mjs`**: vòng FogWalk 16 → 18; mốc gate `b===3` giữ, `b===7` → `b===6`, `b===10` → `b===11`; điều kiện `b < 15` → `b < 17`; check `getByText('E–H = 5')` đi theo gate 3 mới; vòng Invariant 4 → 3; đoạn tua lùi 37 → 38 nhịp (6+6+18+3+5 = 38 beat Phần 3).
- **`tools/full-walk.mjs`**: key tọa độ click `'#s3-trong-suong.7'` → `.6`, `'.10'` → `.11`.
- Cập nhật mục S3FogWalk/S3Invariant trong `Plan.md` sau khi code xong (plan là nguồn chân lý lời dẫn).

### 5.5. Cách gate hoạt động với thiết kế mới (đã soi `DeckProvider.tsx`)

- Resolve theo click: slide gọi `resolveGate()` khi click đúng `gate.correct`; click ứng viên khác → state cục bộ `attempt` hiện phản ví dụ 7s, không lọt deck state. **Không đổi gì** — gate 2 mới vẫn resolve khi click G (chỉ khác patch/answer).
- PREV/GOTO rơi vào beat gate → auto-resolve; resolved bền trong phiên theo key `slideId:beat` → đánh số lại beat làm key cũ vô nghĩa nhưng vô hại (không persist qua reload, hash chỉ khôi phục beat + auto-resolve).
- `R` re-arm gate tại beat hiện tại → hoạt động nguyên trạng với chỉ số mới.

---

## 6. Rủi ro & kiểm tra

1. **Lùi beat quanh show-cost**: b10→b9 badge unmount qua exit AnimatePresence (costs b9 không có) — OK; b13→b12 badge D 14→16 TĂNG → CostBadge đổi số im lặng theo thiết kế — OK; b10 vào lần đầu prev=null → không lóe xanh (đúng, ghi lần đầu ≠ relax).
2. **Lóe xanh relax b13** cần badge D=16 sống liên tục b10→b12 (COSTS_G ở cả 3 beat) — giữ đúng kẻo mất hiệu ứng "tự sửa số".
3. **Gate re-arm tại b6**: re-arm xong G từ `current` quay về `frontier`? Không — scene b6 gốc render G `frontier`, patch chỉ áp khi `gateResolved` → re-arm tự đúng.
4. **Overlay phản ví dụ đáy màn hình** (left/right 360, bottom 86) `pointerEvents:'none'` — giữ nguyên kẻo nuốt click H (bug cũ đã vá, có check trong shoot-s3).
5. **mathOverlay key = `at:text`**: b8 "6+12=18"@F và b9 "?"@F là key khác nhau → exit/enter sạch. Tránh đặt text b9 trùng text b8.
6. **Strip b12 vs callout**: đè nhau nếu cùng canh giữa — bắt buộc canh phải (mục 5.1.4); chụp lại screenshot xác nhận ở 1920×1080.
7. **Hash cũ trong note presenter** (vd `#s3-trong-suong.10` từng là gate 3) trỏ sang nội dung khác sau đánh số lại — vô hại nhưng nên chạy lại `tools/full-walk.mjs` + shoot toàn bộ để cập nhật mốc.
8. **Thuật ngữ**: toàn bộ text mới chỉ dùng "điểm / đoạn nối / đường"; không ∞; không "frontier"/"sai" trên UI; "cost" chỉ được đặt tên tại b10 — lời dẫn b5–b9 phải nói "con số / chi phí tốt nhất đã biết", KHÔNG nói "cost" (rà kỹ: b6 hỏi gate 2 hiện tại đang viết "G=6, E=10, D=16" dạng số trần — hợp lệ).
9. **Sư phạm — kiểm lại bằng câu hỏi của tinh thần**: b9 (nhu cầu nhớ) đứng TRƯỚC b10 (tên "cost"); b7 (lý do) đứng TRONG gate 2 chứ không sau; b12 (quy luật) chỉ phát biểu điều khán giả vừa chứng kiến 3 lần. Sau khi sửa, spawn sub-agent audit sư phạm giả lập "Minh" đi từ b0–b17 theo đúng quy trình review của dự án.

---

## 7. Tóm tắt một dòng

Show-cost dời từ b5 → b10 (sau khi mở từ G, 7 điểm + D đã đổi giá khiến trí nhớ vỡ — "ghi ra cho đỡ phải nhớ"); mỗi gate là một trò "thử phá từng ứng viên, kể cả kẻ rẻ nhất"; đường lẻn = nhát phá hụt vào G ngay trong gate 2; sau gate 3 khán giả tự vỡ "kẻ sống sót lần nào cũng là kẻ rẻ nhất, cùng một lý do" → phần còn lại chạy bằng luật; S3Invariant teo thành 3 beat "nhìn lại + đúc quy trình" dẫn vào 3 câu pseudocode.
