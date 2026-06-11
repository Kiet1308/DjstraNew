export type TokenKind =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'ident'
  | 'operator'
  | 'punct'
  | 'space'

export type Token = { kind: TokenKind; text: string }

const KEYWORDS = new Set([
  'if',
  'else',
  'while',
  'for',
  'in',
  'of',
  'break',
  'return',
  'true',
  'false',
  'null',
  'function',
  'not',
  'và',
  'hoặc',
])

/**
 * Tokenizer regex (~50 dòng thay cho lib): nhận diện tiếng Việt bằng \p{L}
 * với flag `u` — \w KHÔNG khớp "đ"/"ề". Nguồn text đã NFC.
 */
const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"?)|(\d[\d._]*)|([\p{L}_][\p{L}\p{N}_]*)|(==|!=|<=|>=|=|<|>|\+|-|\*|\/|!)|([(){}[\],.;:])|([ \t]+)|(.)/gu

export function tokenize(line: string): Token[] {
  const out: Token[] = []
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m[1] !== undefined) out.push({ kind: 'comment', text: m[1] })
    else if (m[2] !== undefined) out.push({ kind: 'string', text: m[2] })
    else if (m[3] !== undefined) out.push({ kind: 'number', text: m[3] })
    else if (m[4] !== undefined)
      out.push({ kind: KEYWORDS.has(m[4]) ? 'keyword' : 'ident', text: m[4] })
    else if (m[5] !== undefined) out.push({ kind: 'operator', text: m[5] })
    else if (m[6] !== undefined) out.push({ kind: 'punct', text: m[6] })
    else if (m[7] !== undefined) out.push({ kind: 'space', text: m[7] })
    else out.push({ kind: 'punct', text: m[8] })
    if (m.index === TOKEN_RE.lastIndex) TOKEN_RE.lastIndex++ // bảo hiểm vòng chết
  }
  return out
}

export const TOKEN_COLORS: Record<TokenKind, string> = {
  comment: 'var(--fog-400)',
  string: 'var(--green)',
  number: 'var(--amber)',
  keyword: 'var(--violet)',
  ident: 'var(--fog-100)',
  operator: 'var(--cyan)',
  punct: 'var(--fog-300)',
  space: 'transparent',
}
