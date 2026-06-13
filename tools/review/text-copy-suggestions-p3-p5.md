# Gợi ý sửa text từ Phần 3 trở đi

Phạm vi rà soát: các slide Phần 3, 4, 5 trong `src/sections`, lời dẫn phần code trong `src/codepanel/codeScript.ts`, debugger notes trong `src/debugger/trace.ts`, và nhãn phụ trong `AsidePanel`.

Mục tiêu sửa: giảm cảm giác "AI viết", giảm câu văn kể chuyện quá đà, giữ slide ngắn để người thuyết trình nói phần giải thích.

## Nguyên tắc chung

- Slide chỉ nên giữ câu neo ý. Phần giải thích chi tiết để người nói trình bày.
- Dùng giọng tự nhiên: "ta", "chúng ta", "máy", "hàm", "bảng", "ô".
- Hạn chế ẩn dụ quá nhiều: "cửa", "màn sương", "cỗ máy", "ngăn tủ", "đoàn tàu tên", "bay màu", "khép tròn".
- Không dùng câu quá thơ: "Sương tan", "phương pháp đã tròn", "ý tưởng đã tròn", "dễ bắt chuyện hơn".
- Tránh chữ in hoa để tạo kịch tính, trừ khi thật cần nhấn: `CHẮC CHẮN`, `CHỐT`, `ĐANG MỞ` có thể giữ; các cụm như `SỰ THẬT`, `HỆT`, `BƯỚC CUỐI` nên giảm.
- Phần 5 nên theo flow "đếm bước trước, đặt tên sau": trước hết nói "nhanh hay chậm", sau đó mới nói "độ phức tạp", `O(n^2)`.

## Phần 3 - Tư duy ngược

| Vị trí | Vấn đề | Gợi ý sửa |
|---|---|---|
| `S3LookFromB` b0 | "Phía nào dễ bắt chuyện hơn?" nghe văn, không tự nhiên. | "Nhìn từ A thì quá nhiều hướng. Thử đổi góc: nhìn từ B. Muốn vào B thì chỉ có 3 đường cuối: từ D, E hoặc F." |
| `S3LookFromB` b1 | "Một người vừa đặt chân đến B" hơi dựng cảnh. | "Nếu một đường đi kết thúc ở B, bước ngay trước B là từ đâu?" |
| `S3LookFromB` b2 | "3 cửa này" tạo ẩn dụ không cần thiết. | "Vậy đường ngắn nhất đến B bắt buộc đi qua D, E hoặc F." |
| `S3LookFromB` b3 | Câu quá dài, giải thích cả logic trên slide. | "Chỉ còn 3 khả năng: tốt nhất đến D + DB, tốt nhất đến E + EB, hoặc tốt nhất đến F + FB. Cái nhỏ nhất là đáp án." |
| `S3LookFromB` b4 | "Bài toán đổi vai" hơi văn. | "Bài toán chuyển thành: tìm đường tốt nhất đến D, E và F." |
| `S3Dependencies` b0 | "Mũi tên tím đọc là..." hơi kỹ thuật. | "Mũi tên tím nghĩa là: muốn biết B, ta phải biết D/E/F trước." |
| `S3Dependencies` b1 | Câu hỏi về D quá dài. | "Thử với D: bước cuối vào D có thể đến từ A, C hoặc E. Vậy muốn biết D, ta lại phải biết A, C, E trước." |
| `S3Dependencies` b3 | "lùi hai bước là về tới A" ổn nhưng hơi kể. | "Nhánh này đã chạm về A." |
| `S3Dependencies` b4 | "Quy luật lộ ra" hơi sân khấu. | "Nhận xét: muốn biết đường tốt nhất đến một điểm, ta cần biết đường tốt nhất đến các điểm ngay trước nó." |
| `S3Dependencies` b5 | "câu hỏi đẻ ra câu hỏi" nghe AI/văn. | "Mỗi câu hỏi lại kéo theo vài câu hỏi khác. Nhưng đi ngược mãi thì đều quay về A." |
| `S3Dependencies` b6 | "Có sẵn, khỏi nghĩ" hơi xuồng xã. | "Đường ngắn nhất từ A đến A bằng 0. Đây là thông tin ta biết ngay từ đầu." |
| `S3Dependencies` b7 | "phía B toàn câu hỏi nợ nhau" nặng ẩn dụ. | "Từ B thì còn phụ thuộc nhiều điểm. Từ A thì ta biết sẵn cost 0, nên ta sẽ xây dần từ A ra." |
| `S3Dependencies` b8 | "Sương xuống" hơi thơ nếu đứng một mình. | "Ta che phần chưa khám phá lại và chỉ dùng những gì đang thấy." |
| `S3FogWalk` b0 | "tự mò ra đáp án", "tự bịt bớt mắt" hơi văn. | "Nếu nhìn toàn bộ bản đồ, ta dễ thấy đáp án nhưng khó thấy quy tắc. Vì vậy ta che phần chưa khám phá lại." |
| `S3FogWalk` b1 | Quá dài, slide đang gánh lời nói. | "Mỗi điểm chỉ được ghi số khi ta chắc số đó sẽ không phải sửa. Nếu mỗi bước chốt hẳn một điểm, ta không phải quay lại làm lại." |
| `S3FogWalk` b3 prompt | Có ngoặc giải thích dài. | "Ta chắc chắn được đường ngắn nhất đến điểm nào? Click thử từng ứng viên." |
| `S3FogWalk` counter D/G | "Giữ lấy nghi ngờ này", "lát nữa có bất ngờ" hơi kịch bản. | "Chưa chắc: biết đâu trong sương có đường C-D ngắn hơn? Chỗ này lát nữa sẽ kiểm tra lại." |
| `S3FogWalk` b5 | "kìa", `SỰ THẬT`, "cả nhà nhớ giùm" hơi diễn. | "Từ C thấy thêm E: 4+6=10. Đồng thời D được cải thiện: 4+12=16 < 18. Tạm nhớ: E=10, D=16." |
| `S3FogWalk` b6 answer | "Cho nó một cơ hội ->" không tự nhiên. | "Còn G=6. Ta cũng thử phá G như các điểm khác." |
| `S3FogWalk` b7 | "lẻn", "chui", "cửa sau" quá nhiều ẩn dụ. | "Giả sử có đường khác đến G. Đường đó muốn đi vào vùng chưa biết thì trước hết phải qua E=10 hoặc D=16. Vừa tới đó đã lớn hơn 6, nên không thể tốt hơn G." |
| `S3FogWalk` b8 | "B vẫn bặt tăm" hơi văn. | "B vẫn chưa xuất hiện." |
| `S3FogWalk` b9 | "đầu đã muốn rối", "nhớ mang máng" hơi dài. | "Có nhiều số phải nhớ: D là 18 hay 16? E, F, H là bao nhiêu? Muốn máy làm theo thì các số này phải được ghi rõ." |
| `S3FogWalk` b10 | "Dân code lười viết dài" hơi đùa. | "Ta gọi gọn con số tốt nhất đã biết này là cost." |
| `S3FogWalk` b11 answer | Quá dài, nhiều giải thích phụ. | "E=10 rẻ nhất. Muốn tìm đường khác đến E, trước hết phải qua D/F/H, mà các điểm đó đều đã lớn hơn 10. Vậy E không thể bị phá, chốt E." |
| `S3FogWalk` b12 | "Khoan... để ý không?", "CHỐT thẳng tay" hơi diễn. | "Sau ba lần thử, ta thấy cùng một quy tắc: điểm đang mở rẻ nhất luôn chốt được. Từ giờ không cần thử từng ứng viên nữa." |
| `S3FogWalk` b13 | `THẤY ĐÍCH`, "thành sự thật nốt", "may mà" hơi kịch. | "Mở từ E thấy B=16, đồng thời cập nhật D từ 16 xuống 14. Đây là lý do phải ghi cost rõ ràng." |
| `S3FogWalk` b14 | Nội dung đúng nhưng dài. | "Thấy B=16 nhưng chưa dừng: D=14 còn rẻ hơn, nên B vẫn có thể bị cải thiện. Chỉ dừng khi B được chốt." |
| `S3FogWalk` b15 | "nghi ngờ cuối cùng tắt" hơi thơ. | "D=14 được chốt. Kiểm tra D-B: 14+6=20 > 16, nên B giữ nguyên." |
| `S3Invariant` b0 | "Cả màn sương vừa rồi" hơi chủ đề hóa. | "Tóm lại, ta chỉ lặp một thao tác: chốt điểm đang mở rẻ nhất, rồi mở các điểm nối từ nó." |
| `S3Invariant` b1 | "món quà", "lời hứa đầu màn sương" nghe văn. | "Dãy cost đã chốt là 4 -> 6 -> 10 -> 14 -> 16. Không điểm nào đã chốt phải sửa lại." |
| `S3Pseudocode` heading | "Ý tưởng đã tròn" nghe giống ví dụ bạn nêu. | Đổi thành "Chốt lại ý tưởng" hoặc "Tóm lại thành 3 câu". |
| `S3Pseudocode` closing | "toàn bộ phương pháp" hơi lớn. | "Ba câu này là lõi của thuật toán. Bước tiếp theo: chuyển thành code." |

## Phần 4 - Thành code

| Vị trí | Vấn đề | Gợi ý sửa |
|---|---|---|
| `S4Morph` b0 | "Sương tan. Phương pháp đã tròn" rất AI/thơ. | "Ta đã có quy tắc. Bây giờ chuyển nó thành thứ máy có thể làm theo: dữ liệu và code." |
| `S4Morph` b0 | "máy không có mắt... phố xá đèn đường" hơi dài. | "Máy không cần biết nhà cửa hay tên đường; nó chỉ cần dữ liệu ta ghi ra." |
| `S4Morph` b1 | "Mọi thứ còn lại chỉ là trang trí" hơi phủ định mạnh. | "Những chi tiết còn lại không ảnh hưởng đến thuật toán." |
| `S4Morph` b2 | "Tên gọi thôi - nó vẫn là tấm bản đồ của ta" hơi văn. | "Khi bỏ chi tiết bản đồ, ta còn lại đồ thị: điểm là đỉnh, đoạn nối là cạnh. Đây chỉ là cách gọi trong lập trình." |
| `BUILD_SCRIPT` cầu nối | "Trong sương" lặp nhiều. | "Ở bước khám phá, mỗi điểm có 3 trạng thái: chưa thấy, đang mở, đã chốt." |
| `BUILD_SCRIPT` Cost | "ngăn tủ mang tên nó" dùng nhiều và hơi trẻ con. | Dùng nhất quán "ô trong bảng Cost": `Cost["C"] = 4` nghĩa là ô C trong bảng Cost đang ghi 4. |
| `BUILD_SCRIPT` mở hàm | "Ta cần một cỗ máy" lặp với nhiều slide. | "Ta cần một hàm: nhận bản đồ, điểm bắt đầu, điểm kết thúc; trả về độ dài ngắn nhất." |
| `BUILD_SCRIPT` start | "bằng 0, khỏi nghĩ" | "bằng 0, biết ngay". |
| `BUILD_SCRIPT` while | "dán tạm 2 mảnh giấy nhớ" hơi kể chuyện. | "Ta đặt tạm hai điều kiện dừng, rồi lát nữa thay bằng code thật." |
| `BUILD_SCRIPT` tìm min | "Máy không có mắt nhìn cả bàn cờ", "quán quân tạm thời" hơi ẩn dụ. | "Máy phải duyệt từng điểm và giữ một ứng viên nhỏ nhất hiện tại, gọi là min." |
| `BUILD_SCRIPT` break | "Trả nợ mảnh giấy", "mảnh giấy hóa thành code thật" hơi văn. | "Điều kiện dừng thứ nhất: quét xong mà không chọn được điểm nào, tức là min vẫn null." |
| `BUILD_SCRIPT` lock | "min sống sót qua hai cửa break" không tự nhiên. | "Nếu không dừng ở hai điều kiện trên, min chính là điểm cần chốt." |
| `BUILD_SCRIPT` set cost | "Rồi ghi vào ngăn tủ của nó." quá ngắn nhưng dùng ẩn dụ. | "Tạm ghi cost mới cho điểm kề." |
| `BUILD_SCRIPT` bug demo | "B đang giữ số đẹp", "lối sáng kia" hơi văn. | "B đang có cost 16 theo đường tốt hơn." |
| `BUILD_SCRIPT` overwrite | "ghi đè không hỏi han", "bay màu" quá slang. | "Dòng này ghi đè luôn: cost 16 của B bị đổi thành 20." |
| `BUILD_SCRIPT` null case | "cái-chưa-có" gượng. | "Nếu ô còn trống thì lần đầu gặp cứ ghi. Nếu đã có số thì chỉ ghi khi newCost nhỏ hơn." |
| `BUILD_SCRIPT` if wrap | "Con đường 16 sống sót" hơi văn. | "Cost 16 được giữ nguyên." |
| `BUILD_SCRIPT` back to A | "Câu hỏi xét nét" hơi kỳ. | "Kiểm tra trường hợp quay ngược về A: 4+4=8 không nhỏ hơn 0, nên if sẽ bỏ qua." |
| `BUILD_SCRIPT` return | "đáp án nằm sẵn trong ngăn tủ" | "đáp án nằm trong `Cost[end]`." |
| `BUILD_SCRIPT` summary | "3 câu ta nói trong sương" | "3 câu ở slide trước". |
| `PREV_SCRIPT` intro | "Cỗ máy chạy ngon" hơi nói miệng quá. | "Hàm đã trả đúng số 16, nhưng chưa trả đường đi." |
| `PREV_SCRIPT` doors | "ba cửa dẫn vào... chẳng cửa nào ghi dấu" | "B có 3 đường đi vào, nhưng ta chưa biết đường ngắn nhất đi qua đường nào." |
| `PREV_SCRIPT` path explode | "đoàn tàu tên" quá hình ảnh. | "Mỗi ô phải lưu một danh sách rất dài, rất tốn bộ nhớ." |
| `PREV_SCRIPT` shared route | `HỆT`, `BƯỚC CUỐI` hơi kịch. | "Hai đường này chung phần đầu, chỉ khác bước cuối." |
| `PREV_SCRIPT` prev tree | "cây mũi tên chỉ về nhà" hơi thơ. | "Mỗi điểm có một mũi tên về điểm đứng ngay trước nó." |
| `PREV_SCRIPT` update prev | "cost đổi chủ -> mũi tên xoay" | "Khi cost được cập nhật, Prev cũng phải cập nhật theo." |
| `PREV_SCRIPT` return prev | "tấm bản đồ-bước-ngược" gượng. | "trả về bảng Prev; cần đường nào thì lần ngược từ đích." |
| `PREV_SCRIPT` trace wording | "trước mày là ai?" không hợp slide. | "trước B là điểm nào?" |
| `PREV_SCRIPT` final | "Khép tròn" nghe AI. | "Vậy ta dùng lại đúng tư duy nhìn ngược lúc đầu." |
| `Debugger trace` notes | "bước-ngay-trước", "khép tròn" lặp. | Đổi sang "điểm trước đó", "đúng với cách nhìn ngược ở Phần 3". |
| `AsidePanel` path text | "ngăn nào cũng một đoàn tàu tên, dài mãi ra" | "... x 1.000 điểm - mỗi ô lưu một danh sách dài, rất tốn bộ nhớ". |

## Phần 5 - Nhìn lại

| Vị trí | Vấn đề | Gợi ý sửa |
|---|---|---|
| `S5Counting` b0 | Vào thẳng "độ phức tạp" làm phần này học thuật, trái flow dẫn dắt. | "Thuật toán chạy đúng rồi. Giờ câu hỏi: chạy nhanh hay chậm? Ta đếm số bước nó phải làm." |
| `S5Counting` b1 | "Độ phức tạp đến từ..." vẫn đặt tên quá sớm. | "Có 2 việc tốn bước nhất: tìm min trong các điểm đang mở, và cập nhật các điểm nối từ điểm vừa chốt." |
| `S5Counting` b2 | Câu dài, lỗi khoảng trắng trước dấu phẩy. | "Mỗi lần chốt, ta phải quét các điểm để tìm cost nhỏ nhất. Nếu có n điểm, một lần quét tốn khoảng n bước." |
| `S5Counting` b3 | "Tương tự như vậy..." hơi chung chung. | "Có khoảng n lần chốt. Mỗi lần tốn n bước, nên riêng phần tìm min đã tốn khoảng n x n bước." |
| `S5Counting` b4 | "duyệt các cạnh kề" hơi code. | "Sau khi chốt một điểm, ta còn duyệt các đoạn nối từ điểm đó để cập nhật cost. Tính cả quá trình là thêm khoảng E bước." |
| `S5Counting` b5 | Có lỗi nội dung: ghi `N^2 + V` nhưng đúng phải là `n^2 + E`. | "Tổng lại: khoảng n^2 + E bước." |
| `S5Counting` b6 | Nên đặt tên O sau khi đã đếm. | "Vì E không lớn hơn cỡ n^2, nên n^2 + E vẫn là cỡ n^2. Ta viết gọn là O(n^2)." |
| `S5HeapTeaser` title | "Có thể tối ưu không?" ổn; phụ đề nên gọn hơn. | "Nhìn lại thuật toán: bước nào tốn nhất?" |
| `S5HeapTeaser` stage 1 | Câu dài, có lỗi khoảng trắng và "—ví dụ". | "Chỗ tốn nhất là tìm min: mỗi lần chốt phải quét lại các điểm đang mở. Nếu có 1.000.000 điểm, một lần chốt có thể tốn 1.000.000 bước." |
| `S5HeapTeaser` stage 2 | "sắp xếp dữ liệu khéo léo" được, nhưng nên nói ít hơn. | "Nếu lưu các điểm đang mở bằng cấu trúc luôn lấy được điểm nhỏ nhất trước, bước này có thể giảm còn khoảng 20 bước." |
| `S5HeapTeaser` stage 3 | "vì mục đích giới thiệu..." nghe văn bản báo cáo. | "Phần này mình không đi sâu trong bài hôm nay. Tên cấu trúc thường dùng là min heap." |
| `S5NegativeEdges` b0 | Có typo "đồ thì"; câu vào quá đột ngột. | "Thuật toán này dựa vào một giả định quan trọng: đi thêm thì chi phí không giảm. Nói theo đồ thị: các cạnh không được có trọng số âm." |
| `S5NegativeEdges` b1 | Ví dụ PIN làm mục tiêu "còn nhiều pin nhất" hơi lệch với cost âm. | "Giả sử chi phí có thể âm, ví dụ đi qua một đoạn được hoàn lại 4 đơn vị: Z->Y = -4. Bài toán vẫn là tìm tổng chi phí nhỏ nhất từ X đến Y." |
| `S5NegativeEdges` b2 | Câu "bản chất thuật toán..." quá định lý và chưa cho máy chạy. | "Máy thấy Y=2 và Z=3. Y đang rẻ nhất, lại là đích, nên máy chốt Y và dừng với đáp án 2." |
| `S5NegativeEdges` b3 | "không xét nhánh X-Z" chưa chính xác; vấn đề là dừng/chốt sớm. | "Nhưng đường X->Z->Y có tổng 3 + (-4) = -1, rẻ hơn 2. Vậy cạnh âm đã phá câu 'đi tiếp chỉ làm chi phí tăng'." |
| `S5NegativeEdges` b4 | Kết luận đúng nhưng thiếu điều kiện rõ. | "Vì vậy thuật toán chỉ đúng khi không có cạnh âm." |
| `S5Reveal` journey chips | "tư duy phản biện", "triển khai ý tưởng", "tối ưu giải pháp" hơi generic. | "đặt bài toán -> thử mọi đường -> nhìn ngược -> chốt rẻ nhất -> viết code -> kiểm tra giới hạn" |
| `S5Reveal` reveal line | "nổi tiếng nhất thế giới" hơi marketing/khó chứng minh. | "Đây chính là một thuật toán rất nổi tiếng để tìm đường ngắn nhất:" |
| `S5Reveal` history | "Ông ấy chỉ là người tìm ra đầu tiên" nên sửa cho chắc. | "Dijkstra là người phát biểu thuật toán này đầu tiên vào năm 1956." |
| `S5Reveal` final thought | "nó không hề khó" dễ bị xem là hạ thấp thuật toán. | "phần suy luận cốt lõi thì chúng ta vừa tự đi qua được." |

## Các lỗi chữ nhỏ nên sửa luôn

- `S5Counting`: `N^2 + V` -> `n^2 + E`.
- `S5NegativeEdges`: "đồ thì" -> "đồ thị".
- `S5Counting`, `S5HeapTeaser`, `S5NegativeEdges`: bỏ khoảng trắng trước dấu phẩy/dấu chấm, ví dụ "đỉnh ," -> "đỉnh,"; "này .Các" -> "này. Các".
- Nếu muốn giữ giọng gần người nói, ưu tiên "nhỏ nhất" thay cho "bé nhất" ở phần code/độ phức tạp; hoặc dùng thống nhất một từ, đừng trộn quá nhiều.

## Nhóm nên sửa ưu tiên trước

1. `S4Morph` b0: câu "Sương tan. Phương pháp đã tròn".
2. `S3Pseudocode` heading: "Ý tưởng đã tròn".
3. Toàn bộ cụm "ngăn tủ / cỗ máy / đoàn tàu tên / bay màu / khép tròn" ở Phần 4.
4. `S5Counting`: flow hiện đang quá học thuật và có lỗi `N^2 + V`.
5. `S5NegativeEdges`: sửa lại theo hướng "cạnh âm phá giả định đi tiếp chỉ làm chi phí tăng".
6. `S5Reveal`: giảm khẳng định marketing "nổi tiếng nhất thế giới", đổi câu kết thành tự nhiên hơn.
