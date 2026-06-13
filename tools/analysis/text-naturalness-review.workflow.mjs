export const meta = {
  name: 'text-naturalness-review',
  description: 'Soat loi van phong AI/dai dong/khong tu nhien trong text thuyet trinh phan 3-5, goi y sua tu nhien hon',
  phases: [
    { title: 'Review', detail: 'mot agent doc moi nhom file, gan co cau nghe "AI"/dai dong + de xuat sua' },
    { title: 'Verify', detail: 'agent phan bien: giu/sua/bo tung de xuat, quet sot, kiem rang buoc thuat ngu' },
    { title: 'Synthesize', detail: 'gom mau loi he thong + quick wins toan deck' },
  ],
}

// ---------------------------------------------------------------------------
// BOI CANH & RUBRIC (chia se cho moi agent)
// ---------------------------------------------------------------------------
const CONTEXT = `BOI CANH SAN PHAM
- Day la TEXT TREN MAN HINH cua mot bai THUYET TRINH LIVESTREAM tieng Viet ve viec "tu nghi ra thuat toan Dijkstra" (ten thuat toan la bi mat, dung spoil).
- Nguoi thuyet trinh NOI bang mieng; text tren slide (callout) chi la cho dua. KHAN GIA doc luot, nghe la chinh.
- Tinh than su pham (CLAUDE.md): dan dat NGUOI KHONG BIET GI tu suy luan ra thuat toan — truc quan, doi thoai, am ap, KHONG giang bai, KHONG "phat kien thuc".
- Deck co tham my co y: "ban do dem trong suong" (night map in fog). MOT IT chat khong khi/an du la CO Y va NEN GIU khi no giup hieu va nghe nhu nguoi that noi.

VAN DE NGUOI DUNG NEU (chinh xac):
- Tu Phan 3 tro di, nhieu cau "nghe rat AI": hoa my/sao rong, dai dong, khong tu nhien voi loi noi thuyet trinh.
- Vi du ho chi dich danh: "Suong tan. Phuong phap da tron" — nghe pretentious, truu tuong, KHONG phai cau nguoi ta noi.

== CAN GAN CO DE SUA ==
1. AI-hoa-my / pretentious: tuyen ngon tho/truu tuong, an du dai ngon khong giup hieu ("Phuong phap da tron", "hoan tat su menh", manh cau giat cuc dramatic cho oai).
2. Dai dong / giai thich thua: cau 25 chu noi duoc bang 10; chat menh de; lap lai 1 y 2 lan; rao truoc don sau qua muc.
3. Khong tu nhien / giong dich may: cau truc khong giong tieng Viet noi mieng; trang trong cung nhac khi can than mat; tu noi vung ve.
4. Lam dung gach ngang (—) va bo-ba song song ("khong X, khong Y, chi Z") nhu mot tic van phong — day la dau hieu AI dien hinh; chi giu khi that su can.
5. Lap lai cai nguoi thuyet trinh se noi mieng: ca doan tuong thuat dai le ra chi can 1 cum tu khoa ngan tren man hinh.
6. Dramatize qua: lam dung "…", cham than, hoi hop gia tao.

== PHAI GIU, DUNG SUA QUA TAY (co y & dat) ==
- Giong dan da, than mat cua nguoi dan ("ca nha nho gium: E muoi, D muoi sau", "khoi dan do", "click thu"). DUNG bien thanh van viet trang trong.
- Khong khi suong/ban do KHI no mang nghia ("Ngoai kia, suong mu", "Suong lui dan — nhung B van bat tam"): xet tung cau, giu cai dat.
- Loi hoi Socratic ("Dung duoc chua? …Chua.") la co y su pham; chi gan co neu lam dung.
- Do chinh xac ky thuat, con so, thuat ngu — KHONG duoc lam sai.

== RANG BUOC CUNG (ban viet lai KHONG duoc pham) ==
- Quy tac "ten goi den SAU khai niem": KHONG dua "dinh/canh/do thi" vao truoc slide S4Morph; "cost" chi xuat hien tu S3FogWalk b10 tro di; cac beat dat ten "CHOT"/"MO" giu nguyen vi tri; TUYET DOI khong de lot "frontier" hay ten thuat toan ra UI truoc S5Reveal.
- Chong spoiler: khong them ten thuat toan, khong he lo finale.
- Giu nguyen Y NGHIA, phep toan, nhip su pham. Mot cau muot hon ma lam mat diem day hoc la SAI.

== NGUYEN TAC OUTPUT ==
- CHI gan co nhung cau THAT SU can sua. Cau da on thi de yen (chat luong hon so luong, nhung phai THAU DAO — quet het Phan 3 tro di).
- Voi moi cho: trich "original" NGUYEN VAN tieng Viet nhu hien tren man hinh (bo cac tag <Em>/{' '}/JSX, giu y nguyen tu va dau cau de tim & sua lai), kem "beat" = nhan beat gan nhat (vd "b0 — suong tan...") hoac ten const/ham de dinh vi.
- "suggestions": 1-2 ban viet lai TU NHIEN, cung register (tieng Viet doi thoai-thuyet trinh), ngan gon hon, giu nguyen y. Neu cau nen bi CAT BO bot/rut ngan manh thi ghi ro.
- Neu ban viet lai dung cham rang buoc thuat ngu/spoiler/nghia: ghi vao "risk".`

const CATEGORIES = `Gia tri "category" hop le: "ai-hoa-my" | "dai-dong" | "khong-tu-nhien" | "gach-ngang-bo-ba" | "lap-loi-noi" | "dramatize-qua" | "khac"`

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------
const FINDING = {
  type: 'object',
  additionalProperties: false,
  properties: {
    file: { type: 'string', description: 'duong dan file tuong doi' },
    beat: { type: 'string', description: 'nhan beat gan nhat hoac ten const/ham de dinh vi' },
    context: { type: 'string', description: 'mo ta ngan, vd "S4Morph b0 callout tone=need"' },
    category: { type: 'string', enum: ['ai-hoa-my', 'dai-dong', 'khong-tu-nhien', 'gach-ngang-bo-ba', 'lap-loi-noi', 'dramatize-qua', 'khac'] },
    severity: { type: 'string', enum: ['high', 'med', 'low'] },
    original: { type: 'string', description: 'NGUYEN VAN cau/cum tieng Viet co van de (da bo tag JSX)' },
    why: { type: 'string', description: 'ly do ngan gon vi sao nghe AI/dai dong/khong tu nhien' },
    suggestions: { type: 'array', items: { type: 'string' }, minItems: 1, description: '1-2 ban viet lai tu nhien' },
    risk: { type: 'string', description: 'canh bao thuat ngu/spoiler/nghia, hoac chuoi rong' },
  },
  required: ['file', 'beat', 'context', 'category', 'severity', 'original', 'why', 'suggestions', 'risk'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    findings: { type: 'array', items: FINDING },
    fileNotes: { type: 'string', description: 'nhan xet chung ve van phong nhom file nay' },
  },
  required: ['findings', 'fileNotes'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    findings: { type: 'array', items: FINDING, description: 'DANH SACH CUOI da chot (giu+sua+bo sung)' },
    dropped: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { original: { type: 'string' }, reason: { type: 'string' } },
        required: ['original', 'reason'],
      },
      description: 'cac de xuat bi bo (vi sua qua tay / cau von da on / pham rang buoc)',
    },
    notes: { type: 'string' },
  },
  required: ['findings', 'dropped', 'notes'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    globalPatterns: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          pattern: { type: 'string', description: 'ten mau loi he thong lap di lap lai' },
          why: { type: 'string' },
          examples: { type: 'array', items: { type: 'string' }, description: 'vai vi du original tieu bieu' },
          fix: { type: 'string', description: 'huong sua chung' },
        },
        required: ['pattern', 'why', 'examples', 'fix'],
      },
    },
    quickWins: { type: 'array', items: { type: 'string' }, description: 'nhung cau sua-la-an-ngay, dang cao nhat' },
    consistencyNotes: { type: 'string', description: 'luu y nhat quan thuat ngu/register giua cac ban viet lai' },
    summary: { type: 'string', description: 'tom tat 3-5 cau cho nguoi dung' },
  },
  required: ['globalPatterns', 'quickWins', 'consistencyNotes', 'summary'],
}

// ---------------------------------------------------------------------------
// NHOM FILE
// ---------------------------------------------------------------------------
const GROUPS = [
  {
    id: 'fogwalk',
    label: 'S3 · FogWalk (Buoc di trong suong)',
    register: 'callout',
    files: ['src/sections/s3-reverse/S3FogWalk.tsx'],
  },
  {
    id: 's3-rest',
    label: 'S3 · con lai (Dependencies/Invariant/LookFromB/Pseudocode)',
    register: 'callout',
    files: [
      'src/sections/s3-reverse/S3Dependencies.tsx',
      'src/sections/s3-reverse/S3Invariant.tsx',
      'src/sections/s3-reverse/S3LookFromB.tsx',
      'src/sections/s3-reverse/S3Pseudocode.tsx',
      'src/sections/s3-reverse/common.tsx',
    ],
  },
  {
    id: 's4-callouts',
    label: 'S4 · callouts (Morph/Build/Prev/Layout/AsidePanel)',
    register: 'callout',
    files: [
      'src/sections/s4-code/S4Morph.tsx',
      'src/sections/s4-code/S4Build.tsx',
      'src/sections/s4-code/S4Prev.tsx',
      'src/sections/s4-code/S4Layout.tsx',
      'src/sections/s4-code/AsidePanel.tsx',
    ],
  },
  {
    id: 's4-code',
    label: 'S4 · code annotations (codeScript.ts)',
    register: 'code-annotation',
    files: ['src/codepanel/codeScript.ts'],
  },
  {
    id: 's4-debugger',
    label: 'S4 · debugger narration (trace.ts + DebuggerSlide)',
    register: 'callout',
    files: ['src/debugger/trace.ts', 'src/debugger/DebuggerSlide.tsx'],
  },
  {
    id: 's5',
    label: 'S5 · finale (Counting/HeapTeaser/NegativeEdges/Reveal)',
    register: 'callout',
    files: [
      'src/sections/s5-finale/S5Counting.tsx',
      'src/sections/s5-finale/S5HeapTeaser.tsx',
      'src/sections/s5-finale/S5NegativeEdges.tsx',
      'src/sections/s5-finale/S5Reveal.tsx',
    ],
  },
]

function registerNote(register) {
  if (register === 'code-annotation')
    return 'LUU Y REGISTER: day la ANNOTATION/ghi chu canh dong code (codeScript) hien tren man hinh. Vốn phai TERSE, ky thuat. Van ap lang kinh chong-AI nhung KY VONG ngan gon hon callout; chi gan co cau hoa my/dai dong/khong tu nhien that su, dung doi no phai van ve.'
  return 'LUU Y REGISTER: day la CALLOUT narration tren slide — cau noi dan dat khan gia.'
}

function fileList(files) {
  return files.map((f) => `- ${f}`).join('\n')
}

// ---------------------------------------------------------------------------
// PROMPTS
// ---------------------------------------------------------------------------
function reviewPrompt(g) {
  return `Ban la BIEN TAP VIEN tieng Viet kho tinh, chuyen "lam sach" van phong AI cho slide thuyet trinh. Nhiem vu: doc ky cac file duoi day va soat TUNG cau text hien tren man hinh (callout/annotation/narration), gan co nhung cho "nghe AI" / dai dong / khong tu nhien, va de xuat ban viet lai tu nhien hon.

${CONTEXT}

${CATEGORIES}

${registerNote(g.register)}

FILE CAN SOAT (nhom "${g.label}") — hay DUNG TOOL READ doc TOAN BO tung file:
${fileList(g.files)}

CACH LAM:
1. Read het cac file. Tim moi chuoi tieng Viet hien voi khan gia: callout.text (trong <>...</>), cac field text/label/note, comment hien tren UI, chuoi annotation.
2. Voi tung cau, tu hoi: nguoi Viet dung truoc khan gia co NOI cau nay khong? Co dai dong/hoa my/sao rong khong? Co the ngan gon & tu nhien hon khong MA giu nguyen y va nhip su pham?
3. Chi xuat nhung cho THAT SU can sua. Cau da tu nhien/dat thi BO QUA (dung lam phong so luong).
4. Voi moi cho: original NGUYEN VAN (bo tag <Em>/{' '}, giu y tu & dau cau), beat/dinh vi, category, severity, why ngan, 1-2 suggestions tu nhien, va risk (neu cham thuat ngu/spoiler/nghia thi ghi, khong thi de chuoi rong).
5. Severity: high = nghe AI/sai register ro ret (vd kieu "Phuong phap da tron"); med = dai dong/co the gon hon; low = chinh nhe cho muot.

Tra ve dung schema. Output cua ban LA DU LIEU (khong phai tin nhan cho nguoi). fileNotes: 1-3 cau nhan xet van phong chung cua nhom file.`
}

function verifyPrompt(g, review) {
  return `Ban la BIEN TAP VIEN PHAN BIEN (lang kinh doc lap). Mot bien tap vien khac da soat nhom file "${g.label}" va de xuat cac cho sua duoi day. Viec cua ban: KIEM DINH va CHOT danh sach cuoi.

${CONTEXT}

${CATEGORIES}

${registerNote(g.register)}

FILE (DUNG READ doc lai TOAN BO de tu kiem):
${fileList(g.files)}

DE XUAT CAN KIEM DINH (JSON):
${JSON.stringify(review.findings || [], null, 2)}

VIEC CUA BAN:
1. Read lai cac file. Voi TUNG de xuat: quyet dinh GIU / SUA / BO.
   - GIU: dung va ban viet lai tot → cho vao "findings".
   - SUA: van de dung nhung ban viet lai chua dat (con AI, lam mat nghia, sai register, pham thuat ngu) → sua lai suggestions roi cho vao "findings".
   - BO: cau GOC that ra DA ON / day la "sua qua tay" lam mat chat dan da hoac chat suong co y / ban viet lai pham rang buoc → cho vao "dropped" kem ly do.
2. QUET SOT: tu doc lai file, them nhung cau "nghe AI"/dai dong/khong tu nhien ma nguoi truoc BO SOT vao "findings".
3. Dam bao moi suggestion: tu nhien, ngan gon, giu y, KHONG pham quy tac ten-goi-den-sau / chong spoiler. Doi voi nhom co nhieu beat dat ten thuat ngu (CHOT/MO/cost/do thi...), kiem rang ban viet lai khong lam hong nhip dat ten.
4. Uu tien BAT cho HIGH (nghe AI ro ret) — dung de lot.

"findings" = danh sach CUOI cung (da giu + da sua + bo sung). Tra ve dung schema. notes: nhan xet ngan ve do tin cay & cac diem con tranh cai.`
}

function synthPrompt(allFindings) {
  return `Ban la TONG BIEN TAP. Duoi day la TOAN BO cac cho can sua (da qua phan bien) tren khap Phan 3-5 cua deck thuyet trinh. Hay rut ra BUC TRANH HE THONG cho nguoi dung.

${CONTEXT}

DU LIEU (JSON, ${allFindings.length} findings):
${JSON.stringify(allFindings, null, 2)}

HAY:
1. globalPatterns: nhom cac cho sua thanh CAC MAU LOI LAP DI LAP LAI (vd "tuyen ngon truu tuong cuoi doan", "bo-ba gach-ngang", "rao truoc don sau", "an du suong dung sai cho"...). Moi mau: ten, vi sao nghe AI, vai vi du original tieu bieu, va huong sua chung (1 nguyen tac de nguoi dung tu ap cho ca deck).
2. quickWins: liet ke 5-10 cau "sua-la-an-ngay" dang cao nhat (uu tien severity high + cau nguoi dung de y nhu kieu "Phuong phap da tron").
3. consistencyNotes: luu y de cac ban viet lai NHAT QUAN ve register & thuat ngu xuyen suot.
4. summary: 3-5 cau tom tat cho nguoi dung — van de chinh la gi, sua theo huong nao.

Tra ve dung schema.`
}

// ---------------------------------------------------------------------------
// CHAY
// ---------------------------------------------------------------------------
log(`Soat van phong ${GROUPS.length} nhom file (Phan 3-5): find -> verify -> synthesize`)

const results = await pipeline(
  GROUPS,
  (g) =>
    agent(reviewPrompt(g), { label: `review:${g.id}`, phase: 'Review', schema: REVIEW_SCHEMA }).then((review) => ({
      g,
      review: review || { findings: [], fileNotes: '' },
    })),
  (prev) =>
    agent(verifyPrompt(prev.g, prev.review), { label: `verify:${prev.g.id}`, phase: 'Verify', schema: VERIFY_SCHEMA }).then(
      (verify) => ({ g: prev.g, review: prev.review, verify: verify || { findings: [], dropped: [], notes: '' } }),
    ),
)

const ok = results.filter(Boolean)
const allFindings = ok.flatMap((r) => (r.verify.findings || []).map((f) => ({ ...f, group: r.g.id })))
log(`Tong cong ${allFindings.length} cho can sua sau phan bien`)

phase('Synthesize')
const synth = await agent(synthPrompt(allFindings), { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

return {
  totalFindings: allFindings.length,
  byGroup: ok.map((r) => ({
    group: r.g.id,
    label: r.g.label,
    register: r.g.register,
    fileNotes: r.review.fileNotes || '',
    findings: r.verify.findings || [],
    dropped: r.verify.dropped || [],
    verifierNotes: r.verify.notes || '',
  })),
  synth: synth || null,
}
