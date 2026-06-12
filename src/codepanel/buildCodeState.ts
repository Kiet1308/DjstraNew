import type { CodeBeat, CodeLine, CodeOp, CodeState } from './types'

function applyOp(lines: CodeLine[], op: CodeOp, fresh: Set<string>, morphed: Set<string>) {
  switch (op.op) {
    case 'insert': {
      const at = op.afterId === null ? -1 : lines.findIndex((l) => l.id === op.afterId)
      if (op.afterId !== null && at < 0) throw new Error(`insert: không thấy afterId "${op.afterId}"`)
      lines.splice(at + 1, 0, ...op.lines.map((l) => ({ ...l })))
      for (const l of op.lines) fresh.add(l.id)
      break
    }
    case 'replace': {
      const at = lines.findIndex((l) => l.id === op.targetId)
      if (at < 0) throw new Error(`replace: không thấy targetId "${op.targetId}"`)
      lines.splice(at, 1, ...op.lines.map((l) => ({ ...l })))
      for (const l of op.lines) fresh.add(l.id)
      break
    }
    case 'morph': {
      const at = lines.findIndex((l) => l.id === op.targetId)
      if (at < 0) throw new Error(`morph: không thấy targetId "${op.targetId}"`)
      lines[at] = { ...lines[at], text: op.text.normalize('NFC') }
      morphed.add(op.targetId)
      break
    }
    case 'remove': {
      for (const id of op.ids) {
        const at = lines.findIndex((l) => l.id === id)
        if (at < 0) throw new Error(`remove: không thấy id "${id}"`)
        lines.splice(at, 1)
      }
      break
    }
    case 'wrap': {
      const at = lines.findIndex((l) => l.id === op.targetId)
      if (at < 0) throw new Error(`wrap: không thấy targetId "${op.targetId}"`)
      // dòng cũ GIỮ id — chỉ thụt thêm; before/after chèn quanh
      lines[at] = { ...lines[at], indent: lines[at].indent + op.indentDelta }
      lines.splice(at + 1, 0, { ...op.after })
      lines.splice(at, 0, { ...op.before })
      fresh.add(op.before.id)
      fresh.add(op.after.id)
      break
    }
  }
}

/**
 * Pure fold: trạng thái code tại beat = gấp toàn bộ ops từ đầu kịch bản.
 * Lùi beat "miễn phí" — chỉ fold lại với beat nhỏ hơn.
 */
export function buildCodeState(script: CodeBeat[], beat: number): CodeState {
  const lines: CodeLine[] = []
  const fresh = new Set<string>()
  const morphed = new Set<string>()
  const upTo = Math.max(0, Math.min(script.length - 1, beat))

  for (let i = 0; i <= upTo; i++) {
    const isLast = i === upTo
    if (isLast) {
      fresh.clear()
      morphed.clear()
    }
    for (const op of script[i].ops ?? []) applyOp(lines, op, fresh, morphed)
  }

  const cur = script[upTo]
  // pseudoStep "dính": giữ giá trị gần nhất đã khai báo
  let pseudoStep: 1 | 2 | 3 | 'all' | null = null
  for (let i = upTo; i >= 0; i--) {
    if (script[i].pseudoStep !== undefined) {
      pseudoStep = script[i].pseudoStep ?? null
      break
    }
  }
  // graphScene "dính" tương tự
  let graphScene = undefined
  for (let i = upTo; i >= 0; i--) {
    if (script[i].graphScene !== undefined) {
      graphScene = script[i].graphScene
      break
    }
  }
  // focus "dính" theo MÀN: chỉ đổi khi kịch bản khai báo — bố cục đứng yên
  // trong cả màn, không bơm phồng/xẹp theo từng beat nói→gõ
  let focus: 'code' | 'visual' = 'visual'
  for (let i = upTo; i >= 0; i--) {
    if (script[i].focus !== undefined) {
      focus = script[i].focus!
      break
    }
  }
  // need() gắn CÙNG object callout cho 2 beat liền nhau — key theo beat đầu
  // của chuỗi để lời dẫn không nháy fade-out/in khi sang beat gõ code
  let calloutKey = upTo
  while (
    calloutKey > 0 &&
    cur.callout !== undefined &&
    script[calloutKey - 1].callout === cur.callout
  ) {
    calloutKey--
  }

  return {
    lines,
    highlight: new Set(cur.highlight ?? []),
    highlightTone: cur.highlightTone,
    freshIds: fresh,
    morphedIds: morphed,
    pseudoStep,
    graphScene,
    callout: cur.callout,
    calloutKey,
    aside: cur.aside,
    focus,
  }
}

/**
 * Dev-validator: fold TOÀN BỘ kịch bản ngay lúc khởi động —
 * bắt typo afterId/targetId/id trùng trước khi lên sóng.
 */
export function validateScript(script: CodeBeat[], name = 'codeScript') {
  const lines: CodeLine[] = []
  const seen = new Set<string>()
  const f = new Set<string>()
  const m = new Set<string>()
  script.forEach((b, i) => {
    for (const op of b.ops ?? []) {
      if (op.op === 'insert' || op.op === 'replace') {
        for (const l of op.lines) {
          if (seen.has(l.id) && !lines.some((x) => x.id === l.id)) {
            // id từng tồn tại rồi bị xóa — cho phép tái dùng? KHÔNG: dễ nhầm
            throw new Error(`${name} beat ${i}: id "${l.id}" tái sử dụng`)
          }
          if (lines.some((x) => x.id === l.id)) {
            throw new Error(`${name} beat ${i}: id "${l.id}" đang tồn tại`)
          }
          seen.add(l.id)
        }
      }
      if (op.op === 'wrap') {
        for (const l of [op.before, op.after]) {
          if (lines.some((x) => x.id === l.id) || seen.has(l.id)) {
            throw new Error(`${name} beat ${i}: id "${l.id}" đang tồn tại (wrap)`)
          }
          seen.add(l.id)
        }
      }
      try {
        applyOp(lines, op, f, m)
      } catch (e) {
        throw new Error(`${name} beat ${i}: ${(e as Error).message}`)
      }
    }
    for (const id of b.highlight ?? []) {
      if (!lines.some((x) => x.id === id)) {
        throw new Error(`${name} beat ${i}: highlight id "${id}" không tồn tại`)
      }
    }
  })
}
