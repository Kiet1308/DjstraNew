# Rà soát văn phong "nghe AI" — Phần 3 → 5

> Soát toàn bộ text hiển thị (callout, annotation code, narration debugger) từ Phần 3 trở đi.
> Mỗi nhóm file qua 2 lượt: 1 biên tập soát + 1 biên tập phản biện (giữ/sửa/bỏ + quét sót).
> **Chưa sửa file** — đây là danh sách gợi ý để bạn chọn. Phần 1–2 không động đến.

---

## TL;DR — 4 tật chính khiến câu "nghe AI"

1. **Tuyên ngôn trừu tượng chốt đoạn ("chốt câu cho oai").** Cuối một đoạn suy luận hay chèn một câu khẩu hiệu viết hoa/đanh thép — giọng *viết để in lên áo*, không phải câu người ta *nói*. Đây chính là tật của câu bạn chỉ đích danh.
   `Sương tan. Phương pháp đã tròn` · `khép tròn` · `Mọi thứ còn lại chỉ là trang trí` · `Nhánh "không làm gì" cũng là một quyết định` · `Ba câu này là toàn bộ phương pháp`
2. **Ẩn dụ hoa mỹ cây chồng nhiều tầng / đặt sai chỗ.** Chất "bản đồ đêm trong sương" là cố ý và đắt — lỗi là khi cây ẩn dụ chồng 3–4 tầng trong một câu, hoặc đè lên một ẩn dụ khác đã dựng.
   `lang thang trong vùng tối… không có cửa sau… chui được vào` · `tấm bản đồ-bước-ngược` (đè "cây mũi tên") · `đoàn tàu tên` (lệch ẩn dụ "ngăn tủ")
3. **Rào trước đón sau / mệnh đề phụ chèn giữa hai gạch ngang.** Lời nói miệng không rào như vậy; vế rào làm loãng trọng tâm và đứt nhịp.
   `Người quên thì cộng lại được — nhưng…` · `Để trả lời cho công bằng…` · `Nhưng vì mục đích giới thiệu nên chúng ta…`
4. **Lạm dụng gạch ngang (—) và bộ-ba song song.** Gạch ngang xuất hiện như một tic (mở đầu câu, ôm mệnh đề giữa, dồn 2–3 cái/câu). Kèm bộ-ba "không X, không Y, chỉ Z".

Cộng thêm: **lặp ý / lặp motif** ("thành SỰ THẬT" viết hoa 3 lần), **dramatize quá** ("…", "!", nhân-cách-hóa kiểu *"Con đường 16 — bay màu"*), và **tường thuật thừa** trên slide (chép lại nguyên cái sẽ nói bằng miệng).

**Hướng sửa chung:** kéo về **giọng người dẫn nói miệng** — cắt câu khẩu hiệu, nói thẳng ý kỹ thuật, mỗi đoạn giữ đúng một ẩn dụ, mỗi ý nói một lần, tối đa một gạch ngang/câu.

---

## ⚠ Phải sửa trước — lỗi ĐÚNG/SAI, không phải phong cách

- **S5Counting b5 — sai ký hiệu:** `Tổng kết lại ta cần N^2 + V bước…`
  → **`Tổng kết lại ta cần n² + E bước để chạy xong thuật toán.`**
  Lý do: cả slide dùng `n` (số đỉnh) và `E` (số đoạn nối) — b3 viết "n × n bước", b6 "E không bao giờ lớn hơn n²", chú thích "n = số điểm · E = số đoạn nối". `V` **không hề được định nghĩa** → khán giả hoang mang. Bắt buộc đổi.
- **Lỗi chính tả & khoảng trắng (S5):**
  - `đồ thì` → `đồ thị` (S5NegativeEdges b0)
  - `như nào` → `như thế nào` (S5Counting b0)
  - Khoảng trắng lạc trước dấu câu: `.Các bạn` → `. Các bạn`; `sẽ là :` → `sẽ là:`; `, ta` / `đỉnh ,` → bỏ space thừa trước dấu phẩy (rải khắp S5Counting, S5NegativeEdges).

---

## Nguyên tắc GIỮ (đừng sửa quá tay)

- **Giọng dân dã có chủ đích — giữ nguyên văn:** `cả nhà nhớ giùm: E mười, D mười sáu`, `khỏi đắn đo`, `click thử`, `nhẩm lại nào`, `nhớ mang máng`.
- **Lối hỏi Socratic là nhịp sư phạm:** `Dừng được chưa? …Chưa.` (chỉ gắn cờ nếu lạm dụng).
- **Chất sương/bản đồ khi mang nghĩa:** `Ngoài kia, sương mù`, `Sương xuống`, `Sương lùi dần`, `thắp sáng đoạn`, `cây mũi tên chỉ về nhà`, `Trả về Prev — bản đồ "bước-ngay-trước"`.
- **Ràng buộc cứng (mọi bản viết lại phải tuân):**
  - Không đưa `đỉnh / cạnh / đồ thị` trước **S4Morph b2** (beat đặt tên đầu tiên). Ở S5 thì hợp lệ.
  - `cost` chỉ từ **S3FogWalk b10**; trước đó dùng "con số / chi phí".
  - Không để lọt `frontier` ra UI — luôn "điểm đang mở / vùng tối / cửa đang mở".
  - Không dùng `đỉnh kề` ở Phần 3 — giữ "các điểm nối với nó".
  - `heap/min-heap` chỉ ở **S5HeapTeaser stage 3**, KHÔNG lộ ở stage 2. Tên `Dijkstra` chỉ ở S5Reveal.
  - Giữ các beat đặt tên viết hoa đúng vị trí: CHẮC CHẮN, XONG HẲN, CHỐT, MỞ, ĐÃ CHỐT.

---

# Chi tiết theo file

Ký hiệu mức độ: **[H]** cao (nghe AI rõ) · **[M]** vừa (gọn được) · **[L]** thấp (tút nhẹ).

## S3 · FogWalk — `src/sections/s3-reverse/S3FogWalk.tsx`

> File này nhìn chung viết đắt, giọng dân dã rất tự nhiên — **giữ**. Vấn đề tập trung ở vài callout dài (b1, b7, b9, b12) và motif lặp "thành sự thật / đi tiếp chỉ dài thêm".

- **[H] b1 — Luật chơi.** Callout dài nhất, gộp 4–5 mệnh đề, lặp ba lần phủ định cùng một ý.
  - Gốc: *Với mỗi điểm, ta muốn điền một con số — độ dài đường ngắn nhất từ A đến nó. Nhưng CHỈ điền khi CHẮC CHẮN: dù sau này khám phá thêm bao nhiêu, con số đó không bao giờ phải sửa. Vì sao khó tính vậy? Cách thử-tất-cả chậm vì làm đi làm lại. Nếu mỗi bước ta XONG HẲN một điểm, không bao giờ quay lại — không lãng phí một bước nào.*
  - Sửa: **Mỗi điểm muốn điền một con số: đường ngắn nhất từ A đến nó. Nhưng CHỈ điền khi CHẮC CHẮN — sau này khám phá thêm bao nhiêu cũng không phải sửa. Cách thử-tất-cả chậm vì cứ làm đi làm lại; nếu mỗi bước XONG HẲN một điểm thì khỏi quay lại.**
  - ⚠ Giữ cụm CHẮC CHẮN và XONG HẲN (nhịp đặt tên cho b4).

- **[H] b7 — Đường lẻn thử phá G.** Câu điển hình "nghe AI": chồng ẩn dụ "lang thang/cửa sau/chui vào/đặt chân đến cửa".
  - Gốc: *Cho một đường "lẻn" từ A đến G xem. Muốn lang thang trong vùng tối thì trước hết phải chui được vào — mà vùng tối không có cửa sau: lối vào duy nhất là bước qua một điểm sáng đang mở (E=10 hoặc D=16). Mới đặt chân đến cửa đã tốn ≥ 10 > 6 rồi, đi tiếp chỉ dài thêm. Không phá nổi → chốt G ✓.*
  - Sửa: **Thử cho một đường "lẻn" từ A đến G. Muốn vào vùng tối thì phải bước qua một điểm đang mở (E=10 hoặc D=16) — đã tốn ≥ 10 > 6 rồi, đi tiếp chỉ dài thêm. Không phá nổi → chốt G ✓.**
  - ⚠ Giữ "vùng tối"/"điểm đang mở" (không "frontier").

- **[M] b0 — Lý do bịt mắt.** "mà máy móc làm theo được" hơi lủng củng; "chỉ cho phép biết" trang trọng hơn cần.
  - Sửa: **Nhìn từ trên cao, mắt ta tự mò ra đáp án mà không biết VÌ SAO. Muốn rút ra QUY TẮC cho máy chạy theo, ta phải tự bịt bớt mắt: chỉ biết những gì đã khám phá.**

- **[M] b5 — "Nghi ngờ lúc nãy là SỰ THẬT!"** (gốc của motif lặp 3 lần). Hạ viết hoa + bớt cảm thán ở lần đầu để các lần sau khỏi trùng.
  - Sửa: **Nghi ngờ lúc nãy hóa đúng thật!**
  - ⚠ Giữ nguyên "cả nhà nhớ giùm: E mười, D mười sáu" ở cùng beat.

- **[M] b9 — Trí nhớ quá tải.** Vế "Người quên thì cộng lại được — nhưng…" là rào trước, gộp một nhịp được.
  - Sửa: **Kiểm tra trí nhớ cái nào: D đang là bao nhiêu — 18 hay 16? E? F? H? Mới bảy điểm mà đầu đã rối. Máy thì không được phép "nhớ mang máng" — phải ghi ra thôi.**

- **[M] b11 — GATE 3 answer.** Phần ngoặc cuối ("chính kẻ rẻ nhất") trùng ý với b12 ngay sau — cắt.
  - Sửa: **E — thử phá nốt: mọi ngả khác đến E đều phải qua một cửa đang mở còn lại (D=16, F=18, H=20), cửa nào cũng đắt hơn 10 rồi, đi tiếp chỉ dài thêm. Không phá nổi. Chốt E ✓.**

- **[M] b12 — Vỡ ra quy luật.** "Rẻ nhất thì không ai phá nổi" trùng ý câu trước; "đi tiếp chỉ dài thêm" lặp b7/b11. Đổi "Khoan…" → "Khoan,".
  - Sửa: **Khoan, để ý không? Ba lần thử phá, kẻ sống sót lần nào cũng là điểm đang mở RẺ NHẤT — vì ngả khác phải qua một cửa đắt hơn nó, đi tiếp chỉ dài thêm. Vậy từ giờ khỏi thử từng ứng viên: điểm đang mở rẻ nhất là CHỐT thẳng tay.**
  - ⚠ Đây là beat quy luật vỡ ra — giữ phần "vì ngả khác phải qua cửa đắt hơn" (lý do), đừng lược hết.

- **[L] b3 answer — "mở màn bằng đoạn".** "mở màn" = sân khấu, văn vẻ → **bắt đầu**.
  - Sửa: **C! Mọi đường khác rời A đều bắt đầu bằng đoạn ≥ 6, mà đi tiếp chỉ dài thêm chứ không ngắn lại — nên không gì phá nổi con số 4.**

- **[L] b3 counter D & b6 counter D — ngoặc rào dramatize.**
  - b3: `(Giữ lấy nghi ngờ này — lát nữa có bất ngờ.)` → **(Nhớ cái nghi ngờ này nhé, lát quay lại.)**
  - b6: `(Nghi ngờ này lát nữa cũng thành SỰ THẬT.)` → **(Nghi ngờ này lát nữa hóa đúng đấy.)**

- **[L] b8 — "bặt tăm".** Câu này memory ghi là đắt — có thể giữ nguyên; chỉ đổi "bặt tăm" → "chưa thấy" nếu thấy cũ. **Giữ gạch ngang + chất sương.**
  - Tùy chọn: *…Sương lùi dần — mà B vẫn chưa thấy.*

- **[L] b13 — relax D lần 2.** "nghi ngờ từ hai màn trước thành sự thật nốt" = lần 3 của motif; "may mà đã ghi ra, khỏi ai phải nhớ" lặp b10.
  - Sửa: **Mở từ E: THẤY ĐÍCH B! 10+6=16. Và đường E–D có thật: 10+4=14 — đúng nghi ngờ từ nãy. Nhìn góc D kìa, con số tự sửa 16 → 14 — may mà đã ghi ra.**

- **[L] b14 — Thấy đích mà chưa được dừng.** Giữ "Dừng được chưa? …Chưa." (Socratic). Gộp vế giải thích.
  - Sửa: **Khoan — thấy đích rồi! B=16. Dừng được chưa? …Chưa. Luật vừa đúc: rẻ nhất là D=14 chứ đâu phải B — biết đâu vòng qua D còn rẻ hơn. 16 mới là "tốt nhất ĐÃ BIẾT" — chỉ tin con số khi đã CHỐT.**

> **Để yên (đã đắt):** b2 ("Ngoài kia, sương mù"), b4 (đặt tên CHỐT), b10 ("Dân code lười viết dài, gọi tắt là cost"), b15, b16, b17, và các câu gate counter/hỏi gate.

## S3 · còn lại — Dependencies / Invariant / LookFromB / Pseudocode

- **[H] S3Dependencies b5 — "câu hỏi đẻ ra câu hỏi".** Văn chương/sáo rỗng, nhịp giật.
  - Gốc: *Giờ lùi ra nhìn cả tấm bản đồ: câu hỏi đẻ ra câu hỏi — nhưng mũi tên nào cũng chĩa về cùng một phía. Chuỗi câu hỏi nào, lần ngược mãi, cũng đổ về đúng một điểm: A.*
  - Sửa: **Lùi ra nhìn cả bản đồ: hỏi cái này lại lòi ra cái khác, nhưng mũi tên nào cũng chĩa về một phía. Lần ngược thế nào rồi cũng về A.**

- **[M] S3Dependencies b1 — hỏi sâu một cửa D.** Lặp công thức "bước cuối cùng VÀO" mà b0 đã đặt.
  - Sửa: **Hỏi sâu một cửa thôi — D. Bước cuối vào D: từ A, C hay E? Vậy lại cần tốt nhất đến A, C, E trước.**
  - ⚠ Không đưa "đỉnh kề" vào.

- **[M] S3Dependencies b6 — A trả lời được ngay.** "chỉ duy nhất A là trả lời được ngay từ đầu" nói lại chính ý "cả bản đồ đang nợ".
  - Sửa: **Riêng A thì khác: "đường ngắn nhất từ A đến A"? Bằng 0. Có sẵn, khỏi nghĩ. Cả bản đồ còn đang nợ câu trả lời, mỗi A là biết ngay.**
  - ⚠ Giữ "đường ngắn nhất từ A đến A" = 0 (base case).

- **[M] S3Dependencies b7 — lật ngược, xây từ A.** Vế đối xứng + nhiều gạch ngang liên tiếp.
  - Sửa: **Vậy lật ngược: phía B chỉ toàn câu hỏi, phía A đã có sẵn đáp án. Đứng ở A mà xây dần ra. Mũi tên lật theo, giờ đọc xuôi: "A đã chắc, lan sang các điểm nối với nó". Điểm nào chắc TIẾP?**
  - ⚠ Giữ "các điểm nối với nó" (không "đỉnh kề"), giữ "XÂY"/"TIẾP" viết hoa.

- **[M] S3LookFromB (beat 1) — động cơ nhìn ngược.** "càng nhìn càng rối — ta vừa nếm mùi", "dễ bắt chuyện hơn" làm màu.
  - Sửa: **Đứng ở A nhìn về B thì hàng trăm ngả, rối tinh mắt — ta vừa thấy rồi. Quay lại nhìn từ B: chỉ có đúng 3 lối vào. Bên nào dễ hơn? Hỏi ngược từ B xem.**

- **[M] S3LookFromB (beat 4) — ba kịch bản.** Vế sau nói vòng cùng một ý hai lần.
  - Sửa: **Đường ngắn nhất đến B là phương án rẻ nhất trong 3 kịch bản dưới — chọn 1 trong 3, hết cửa. Mà đã đi qua D thì đoạn đầu phải là đường tốt nhất đến D mới mong ngắn được.**

- **[M] S3Invariant b1 — "để ý món quà".** "để ý món quà" làm màu; hai gạch ngang; "không một bước lãng phí" lặp ý ngay trước.
  - Sửa: **Và để ý: dãy số chốt 4, 6, 10, 14, 16 chỉ có đi lên, không số nào phải quay lại sửa. Đúng lời hứa đầu màn sương: mỗi bước xong hẳn một điểm, không phí bước nào.**
  - ⚠ Giữ dãy 4/6/10/14/16 và "lời hứa đầu màn sương".

- **[L] S3Dependencies b8 — chuyển cảnh sương.** "Để trả lời cho công bằng" sách vở; "tự đặt mình vào vai" dài.
  - Sửa: **Giờ đứng vào vai người ở A đi — chỉ biết những gì mắt mình thấy. Sương xuống.**
  - ⚠ Bắt buộc giữ "Sương xuống".

- **[M] S3Pseudocode — câu đóng sang code.** "toàn bộ phương pháp" = tuyên ngôn to tát, đúng họ với câu bạn chê.
  - Gốc: *Ba câu này là toàn bộ phương pháp. Việc còn lại: dịch chúng thành code chạy được →*
  - Sửa: **Ba câu này là xong ý tưởng. Việc còn lại chỉ là dịch ra code chạy được. →**

- **[L] S3Pseudocode — eyebrow "Ý tưởng đã tròn".** Cùng họ "Phương pháp đã tròn".
  - Sửa: **Gom lại thành lời** (hoặc *Đủ rồi, nói ra thôi*). ⚠ Chỉ đổi eyebrow, giữ h1.

## S4 · callouts — `src/sections/s4-code/S4Morph.tsx` + AsidePanel

> Cửa ngõ Phần 4 — nơi câu bạn chỉ đích danh nằm. Trọng tâm là 2–3 câu đầu S4Morph.

- **[H] b0 — câu bạn chỉ đích danh.**
  - Gốc: *Sương tan. Phương pháp đã tròn — giờ đến lượt MÁY làm theo.*
  - Sửa (1): **Sương tan rồi. Cách làm thì ta đã có — giờ đến lượt MÁY làm theo.**
  - Sửa (2): **Vậy là ta đã nghĩ ra cách giải. Giờ phải bảo cho MÁY làm lại.**

- **[M] b0 — vế sau.** Bộ-ba "không thấy… không thấy… nó chỉ…" + "phố xá đèn đường" trang trí thừa; cuối câu lặp "được… được".
  - Gốc: *Nhưng máy không có mắt: nó không thấy thành phố, không thấy phố xá đèn đường — nó chỉ làm việc được với những gì ta ghi ra thành dữ liệu được.*
  - Sửa: **Nhưng máy không có mắt — nó không thấy thành phố đâu. Nó chỉ làm việc được với những gì ta ghi ra thành dữ liệu.**

- **[M] b1 — câu chốt.** "Mọi thứ còn lại chỉ là trang trí" = chốt sáo rỗng, hơi triết lý cho oai.
  - Gốc: *Từ đầu đến cuối chỉ có các điểm và các đoạn nối kèm chi phí. Mọi thứ còn lại chỉ là trang trí.*
  - Sửa: **Từ đầu đến cuối chỉ có các điểm và các đoạn nối kèm chi phí. Còn lại đều là trang trí cả.**
  - ⚠ Giữ "các điểm / các đoạn nối kèm chi phí" — chưa được dùng đỉnh/cạnh/đồ thị trước b2.

- **[L] b1 — mở đầu.** "nhà cửa" hơi thừa cạnh "tên đường"; đổi gạch ngang thành hai chấm.
  - Sửa: **Mà nhìn lại cả hành trình xem: suy luận của ta có lúc nào đụng đến tên đường không? Không.**

- **[L] b2 — đặt tên ĐỒ THỊ/ĐỈNH/CẠNH.** Câu đã đúng nhịp; chỉ giảm 2 gạch ngang trong một câu. Có thể giữ nguyên.
  - Sửa: **Bỏ hết trang trí. Hình tối giản còn lại, dân lập trình gọi là ĐỒ THỊ: mỗi điểm là một ĐỈNH, mỗi đoạn nối là một CẠNH. Chỉ là tên gọi thôi — vẫn là tấm bản đồ của ta.**
  - ⚠ Bắt buộc giữ tên ĐỒ THỊ/ĐỈNH/CẠNH ở đúng b2.

- **[L] AsidePanel — annotation chép lặp.** "thừa chồng thừa" hơi cầu kỳ.
  - `↑ chép lại y nguyên — điểm nào cũng thế thì thừa chồng thừa` → **↑ chép lại y nguyên — điểm nào cũng thế thì thừa lắm**

> **Để yên (đắt):** "…× 1.000 điểm — ngăn nào cũng một đoàn tàu tên, dài mãi ra" (ẩn dụ dễ hiểu, đúng tinh thần). S4Build/S4Prev/S4Layout chỉ là khung render — callout của chúng nằm trong `codeScript.ts` (dưới).

## S4 · code annotations — `src/codepanel/codeScript.ts`

> Giọng dẫn ấm và mộc, đa số tốt. Vấn đề ở vài beat warn/insight từ Màn 3 và phần PREV.

- **[H] PREV Màn 5 — `scFull` khép vòng.** Tuyên ngôn trừu tượng, đúng họ "Phương pháp đã tròn".
  - Gốc: *Lật ngược lại: A → C → E → B = 16. Bài toán hỏi xuôi — ta trả lời bằng cách lần ngược: đúng kiểu nghĩ đã sinh ra cả phương pháp. Khép tròn.*
  - Sửa: **Lật ngược lại: A → C → E → B = 16. Hỏi đi xuôi mà giải đi ngược — đúng cái mạch đã nghĩ ra nó từ đầu.**

- **[H] Màn 3 — `scNaiveOverwrite` (setcost).** Nhân-cách-hóa văn vẻ + gạch ngang dramatic.
  - Gốc: *Dòng của ta ghi đè không hỏi han. Con đường 16 — bay màu.*
  - Sửa: **Dòng của ta ghi đè thẳng, không hỏi gì. 16 mất, lối đẹp tắt theo.**

- **[M] Màn 3 b0 — `scNaiveSetup`.** "qua lối sáng kia" mơ hồ; "giữ số đẹp" + gạch ngang rườm.
  - Sửa: **Dòng vừa viết có kẽ hở. Tua đến lúc chốt D: B đang giữ 16, đi lối sáng kia.**

- **[M] Màn 4 b0 — `scKeepBetter`.** "Con đường 16 sống sót" nhân-cách-hóa, lặp ý "giữ nguyên".
  - Sửa: **Bọc dòng cũ lại: trống hoặc nhỏ hơn mới được ghi. Chạy lại: 20 > 16 → giữ nguyên 16.**

- **[M] PREV Màn 1 — `scPrevAsk`.** Hai vế nói cùng ý; "Nhìn bản đồ mà xem" hơi sân khấu.
  - Sửa: **Máy chạy ngon, nhưng chỉ trả về con số 16 — chưa có con đường. Bản đồ toàn giá tiền, không lối nào sáng.**

- **[M] PREV Màn 2 — `scPathAll`.** "cả một đoàn tàu tên" lệch khỏi ẩn dụ ngăn tủ.
  - Sửa: **Bản đồ thật nghìn điểm: mỗi ngăn tủ nhét cả một dãy tên dài.**

- **[M] PREV Màn 4 — morph `return Prev`.** "tấm bản đồ-bước-ngược" từ ghép tự chế, đè ẩn dụ "cây mũi tên".
  - Sửa: **Và đổi câu trả lời: thay vì một con số, trả về cả cây mũi tên — ai cần đường nào, lần ngược ra đường đó.**
  - ⚠ Chỉ sửa callout, KHÔNG đụng dòng code `return Prev`.

- **[L] PREV cuối — `scFull` dẫn sang phần chạy.** Bộ-ba "từng dòng, từng nhịp, soi từng ngăn tủ"; "từng nhịp" trùng "từng dòng".
  - Sửa: **Xong phần xây. Giờ cho cỗ máy chạy thật — đi từng dòng, soi từng ngăn tủ.**

- **[L] Màn 4 — `scCostsNoPath` (return).** Cặp gạch ngang ôm câu hỏi giữa câu làm gãy nhịp.
  - Sửa: **Vòng lặp dừng nghĩa là đích đã chốt. Hỏi "độ dài ngắn nhất đến end?" — đáp án nằm sẵn trong ngăn tủ.**

- **[L] Màn 3 b1 — comment dev "CÚ ĐẤM" (không lên màn).** Tùy chọn hạ nhiệt cho thống nhất văn phong.
  - `CÚ ĐẤM: không có if → 16 bị đè thành 20, lối đẹp tắt phụt.` → **Không có if → 16 bị đè thành 20, lối đẹp mất luôn.**

> **Để yên (ẩn dụ đặt & có nghĩa):** "cây mũi tên chỉ về nhà / Lần ngược là ra", "Code không phát minh điều gì mới; nó chép lại suy luận", "min sống sót qua hai cửa break", "Đứng ở B nhìn lại: ba cửa dẫn vào…".

## S4 · debugger narration — `src/debugger/trace.ts`

> Đa số tốt. Hai câu "chốt đoạn" lên gân triết lý là chỗ nghe AI rõ nhất — **sửa trước**.

- **[H] `if-better-open` — châm ngôn triết lý.**
  - Gốc: *${nb} đã có cost tốt hơn → điều kiện if chặn lại, không ghi đè. Nhánh "không làm gì" cũng là một quyết định.*
  - Sửa: **${nb} đã có cost tốt hơn → if chặn lại, không ghi đè. Bỏ qua, đi tiếp.**

- **[H] `ret` (note cuối, lật ngược) — "khép tròn".** Đúng họ "Sương tan. Phương pháp đã tròn".
  - Gốc: *Lật ngược danh sách vừa lần ra: A → C → E → B = 16. Tư duy ngược của Phần 3 — khép tròn.*
  - Sửa: **Lật ngược lại: A → C → E → B = 16. Đúng kiểu lần ngược ở Phần 3.**

- **[M] `start-zero`.** "nằm gọn trong một dòng" là văn viết, sáo.
  - Sửa: **Cost[A] = 0 — chỉ một dòng cho ý "bắt đầu từ A". Thế là A tự khắc được chốt đầu tiên.**

- **[M] `min-set` (iter 0).** "đúng như đã hứa" làm màu.
  - Sửa: **Quét một lượt: mới có mỗi A → min = A. Đúng như mình nói, A chốt trước.**

- **[M] `break-found`.** Ngoặc dài + cấu trúc "không phải… mà là…" nặng. Giữ ý "chốt ≠ vừa thấy".
  - Sửa: **min == end → giờ mới dừng. Dừng khi B được CHỐT, chứ không phải lúc vừa thấy B=16.**

- **[L] `lock`.** "không bao giờ sửa nữa" hơi tuyệt đối/dramatize.
  - `Đóng dấu ✓ ${min} — xong hẳn, không bao giờ sửa nữa.` → **Đóng dấu ✓ ${min} — xong, khỏi đụng tới nữa.**

- **[L] `min-set` else — ngoặc nhọn `{}`.** Dấu `{}` quanh danh sách nhuốm màu code trên callout đọc lướt.
  - `Quét các điểm đang mở {${frontierList}} → ${min} bé nhất.` → **Quét các điểm đang mở ${frontierList} → ${min} bé nhất.**

- **[L] `ret` (note đầu) & `ret` (back-trace).** Ẩn dụ "tấm bản đồ" / "thắp sáng đoạn" hợp deck — **giữ**, chỉ tùy chọn bỏ "tấm" cho gọn.

> **Để yên:** "Tìm được đường NGẮN HƠN đến ${nb} (qua ${min}) → sửa cost, sửa luôn Prev…" (nói miệng tự nhiên, cho thấy hai hành động đi một lượt).

## S5 · finale — Counting / HeapTeaser / NegativeEdges / Reveal

> ⚠ Ngoài lỗi ký hiệu & chính tả ở đầu file này, S5 còn nhiều callout **chép lại nguyên cái sẽ nói bằng miệng** — trên slide chỉ cần cụm chốt ngắn.
> Lưu ý JSX: nhiều cụm bọc `<Em>`/`<strong>` màu riêng (`Tiếp theo`, `Tương tự`, `Tổng kết lại`, các số/ký hiệu ví dụ) — khi sửa phải giữ nguyên các cụm này ở đúng vị trí, kẻo vỡ cấu trúc/mất tô màu.

- **[H] S5Counting b5 — sai ký hiệu** → xem mục "Phải sửa trước". `n² + E`.

- **[H] S5HeapTeaser b2 (stage 2) — sắp xếp khéo léo.** Mệnh đề chèn dài giữa hai gạch ngang; giải thích min-heap sớm (sát spoiler).
  - Gốc: *Nhưng nếu sắp xếp dữ liệu khéo léo — xếp các điểm đang mở thành một cấu trúc luôn đẩy sẵn điểm bé nhất lên đầu — thì mỗi lần lấy min chỉ mất chừng…*
  - Sửa: **Nhưng nếu CẤT các điểm đang mở cho khéo — sao cho điểm bé nhất luôn nằm sẵn trên đầu — thì mỗi lần lấy min chỉ tốn chừng…**
  - ⚠ Không lộ tên "heap/min-heap" ở stage 2. Giữ nhịp cliffhanger "~20".

- **[M] S5Counting b0 — câu mở.** Tường thuật lại nguyên cái sẽ nói miệng; "như nào" sai chính tả.
  - Gốc: *Như vậy ta vừa xây dựng được THUẬT TOÁN tìm đường đi ngắn nhất giữa 2 điểm Vậy thì ĐỘ PHỨC TẠP của THUẬT TOÁN này như nào?*
  - Sửa: **Ta vừa dựng xong thuật toán tìm đường ngắn nhất. Vậy nó CHẠY NHANH cỡ nào?**

- **[M] S5Counting b2 — một lần chốt = quét n điểm.** Một câu dài gộp "có thể thấy", "vì vậy", "với n là…".
  - Sửa: **Mỗi lần chốt 1 đỉnh, phải quét HẾT các đỉnh để tìm cost bé nhất → n bước (n = số đỉnh).**

- **[M] S5HeapTeaser b1 (stage 1) — quét 1 triệu điểm.** Lặp ý vừa nói; cụm "hơi lâu và chưa được tối ưu" thừa vì con số tự nói lên.
  - Gốc: *Có thể thấy mỗi lần chốt 1 đỉnh ta phải duyệt lại hết tất cả các đỉnh , như vậy thì hơi lâu và chưa được tối ưu —ví dụ bản đồ 1.000.000 điểm thì MỖI LẦN chốt phải quét 1.000.000 bước.*
  - Sửa: **Mỗi lần chốt 1 đỉnh vẫn phải duyệt lại hết tất cả các đỉnh. Bản đồ 1.000.000 điểm thì mỗi lần chốt là 1.000.000 bước — hơi lâu.**
  - ⚠ Giữ nguyên cụm bọc `<Em>` "duyệt lại hết tất cả các đỉnh" và "1.000.000 điểm".

- **[M] S5HeapTeaser b3 (stage 3) — không đi sâu.** Cấu trúc văn bản vòng vo; lỗi khoảng trắng ".Các bạn".
  - Gốc: *Nhưng vì mục đích giới thiệu nên chúng ta không đi sâu vào phần tối ưu này .Các bạn có thể tự tìm hiểu thêm*
  - Sửa: **Phần tối ưu này khá sâu, hôm nay mình dừng ở đây — ai tò mò cứ tìm hiểu thêm nhé.**

- **[M] S5NegativeEdges b0 — giới thiệu cạnh dương.** Rào trước đón sau một hơi; "đồ thì" sai chính tả.
  - Gốc: *Trước khi kết thúc thì còn 1 đặc điểm cần lưu ý về thuật toán này là nó chỉ được áp dụng với đồ thì mà trọng số các cạnh là dương.*
  - Sửa: **Trước khi kết thúc, một lưu ý: thuật toán này chỉ đúng khi trọng số các cạnh là dương.**

- **[M] S5NegativeEdges b3 — vỡ trận X-Z-Y.** Hai câu liên tiếp cùng mở "Nhưng"; "trong trường hợp hiện tại" thừa; lỗi khoảng trắng.
  - Gốc: *Nhưng trong trường hợp hiện tại ,ta lại có đường đi ngắn nhất là X-Z-Y với khoảng cách là -1 . Nhưng ta đã chốt đường đi ngắn nhất là 2 và không xét nhánh X-Z .*
  - Sửa: **Nhưng giờ đường đi ngắn nhất lại là X-Z-Y, với khoảng cách −1. Mà ta đã chốt 2 rồi và không xét nhánh X-Z.**
  - ⚠ Giữ ký hiệu X-Z-Y / X-Z, số −1 và 2 (bọc `<Em>` màu), giữ `<br>` xuống dòng.

- **[M] S5Reveal stage 2 — giới thiệu Dijkstra.** Mở đầu bằng "—" + gạch ngang giữa câu + mệnh đề chèn; "chỉ là người tìm ra đầu tiên" hạ thấp hơi quá.
  - Gốc: *— phát biểu lần đầu cách đây khoảng 70 năm (1956), bởi Edsger W. Dijkstra. Ông ấy chỉ là người tìm ra đầu tiên — còn suy luận thì, như mọi người vừa thấy, nó không hề khó.*
  - Sửa: **Nó được công bố năm 1956, khoảng 70 năm trước, bởi Edsger W. Dijkstra. Ông là người tìm ra đầu tiên thôi; còn cách suy luận thì, như mọi người vừa thấy, nó không hề khó.**
  - ⚠ Giữ năm 1956 / ~70 năm / tên Edsger W. Dijkstra và ba cụm bọc `<strong>`: "70 năm", "tìm ra đầu tiên", "nó không hề khó".

- **[L] S5Counting b4 — cộng E.** "Tiếp theo là mỗi lần…" lượm thượm vì chữ "là".
  - Sửa: **Tiếp theo: mỗi lần chốt còn duyệt các cạnh kề để cập nhật khoảng cách → cộng thêm E bước (E = số đoạn nối).**
  - ⚠ Giữ cụm "Tiếp theo" ở đầu (đang bọc `<Em>`).

- **[L] S5Counting b3 — lặp n lần → n×n.** Lặp "các đỉnh" hai lần + khoảng trắng thừa.
  - Sửa: **Tương tự với các đỉnh còn lại — chốt hết thì cần n × n bước.**
  - ⚠ Giữ "Tương tự" ở đầu và "n × n bước" ở cuối (bọc `<Em>`).

- **[L] S5NegativeEdges b1 — chi phí là PIN.** Câu 2 đảo trật tự không tự nhiên ("…SẠC thêm 4 trên đoạn Z→Y"); khoảng trắng trước hai chấm.
  - Sửa: **Giả sử trọng số ở đây không phải khoảng cách mà là lượng PIN tiêu thụ khi đi qua. Riêng đoạn Z→Y không tốn PIN mà còn được SẠC thêm 4. Bài toán bây giờ là: tìm đường X→Y sao cho còn nhiều PIN nhất.**
  - ⚠ Giữ các cụm bọc `<Em>`: "lượng PIN tiêu thụ", "SẠC thêm", "4", "tìm đường X→Y sao cho còn nhiều PIN nhất".

> **Để yên (đắt sư phạm):** "Bản chất thuật toán này là nếu 1 đỉnh đang mở và có cost tạm thời ít nhất thì ta có thể chốt…" — đây là nhắc lại quy tắc cố ý, làm đòn bẩy cho cú sốc "vỡ trận" ngay sau.

---

## Thứ tự đề xuất khi sửa

1. **Bắt buộc (đúng/sai):** `n² + E` ở S5Counting b5; lỗi chính tả "đồ thì"/"như nào"; khoảng trắng lạc ở S5.
2. **[H] — nghe AI rõ nhất:** S4Morph b0 (câu bạn chỉ đích danh), S3FogWalk b1 & b7, S3Dependencies b5, trace.ts `if-better-open` & `ret` cuối, codeScript PREV Màn 5 & Màn 3 setcost, S5HeapTeaser b2.
3. **[M] rồi [L]:** tút theo từng file.

> Bản gốc workflow (JSON đầy đủ, gồm cả phương án 2 cho từng câu): `tools/analysis/text-naturalness-review.workflow.mjs` đã sinh ra — kết quả lưu ở task output.
