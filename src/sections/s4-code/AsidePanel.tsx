import { motion } from 'motion/react'
import type { CodeAside } from '../../codepanel/types'

/**
 * Hình phụ cột phải Phần 4 — biến "chữ trong callout" thành hình nhìn được:
 * bảng tra map[C], mảng Path mọc dần → phình to → chồng lặp, chuỗi Prev một-bước.
 */
export function AsidePanel({ kind }: { kind: CodeAside }) {
  return (
    <motion.div
      key={kind}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      style={{
        background: 'var(--ink-2)',
        border: '1.5px solid var(--line-soft)',
        borderRadius: 14,
        padding: '18px 24px',
        fontFamily: 'var(--font-mono)',
        fontSize: 23,
        lineHeight: 1.5,
        overflow: 'hidden',
        // bảng phụ là NỘI DUNG sư phạm — không bao giờ để flex nghiền mất dòng
        flexShrink: 0,
      }}
    >
      {kind === 'stateTable' && <StateTable />}
      {kind === 'mapTable' && <MapTable />}
      {kind === 'costCabinet' && <CostCabinet />}
      {kind === 'pathFull' && <PathRows stage="seed" />}
      {kind === 'pathGrow' && <PathRows stage="grow" />}
      {kind === 'pathExplode' && <PathExplode />}
      {kind === 'pathWaste' && <PathRows stage="waste" />}
      {kind === 'prevChain' && <PrevChain />}
    </motion.div>
  )
}

/** 3 tình trạng trong sương ↔ cách máy ghi chép — bảng dịch hai cột. */
function StateTable() {
  const rows: { icon: string; color: string; label: string; code: string }[] = [
    { icon: '●', color: 'var(--fog-500)', label: 'chưa thấy', code: 'Cost[X] == null' },
    { icon: '●', color: 'var(--amber)', label: 'đang mở', code: 'Cost[X] = số tạm' },
    { icon: '✓', color: 'var(--green)', label: 'đã chốt', code: 'Visited[X] = true' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.25 }}
          style={{ display: 'flex', alignItems: 'baseline' }}
        >
          <span style={{ color: r.color, width: 36, flexShrink: 0 }}>{r.icon}</span>
          <span style={{ color: 'var(--fog-100)', width: 190, flexShrink: 0 }}>{r.label}</span>
          <span style={{ color: 'var(--fog-400)', margin: '0 18px' }}>→</span>
          <span style={{ color: 'var(--cyan)' }}>{r.code}</span>
        </motion.div>
      ))}
    </div>
  )
}

/** Tủ Cost: mỗi điểm một ngăn mang tên nó — ngăn C được soi đèn. */
function CostCabinet() {
  const drawers: [string, number][] = [
    ['A', 0],
    ['C', 4],
    ['G', 6],
    ['D', 16],
    ['E', 10],
  ]
  return (
    <div>
      <div style={{ color: 'var(--fog-300)', marginBottom: 12 }}>
        tủ <span style={{ color: 'var(--fog-100)', fontWeight: 700 }}>Cost</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {drawers.map(([id, v], i) => {
          const lit = id === 'C'
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.18 }}
              style={{
                width: 92,
                textAlign: 'center',
                borderRadius: 10,
                border: lit ? '2px solid var(--amber)' : '1.5px solid var(--line-soft)',
                background: lit ? 'rgba(255, 201, 77, 0.10)' : 'var(--ink-1)',
                padding: '8px 0 10px',
              }}
            >
              <div style={{ fontSize: 18, color: lit ? 'var(--amber)' : 'var(--fog-400)' }}>
                {id}
              </div>
              <div style={{ fontWeight: 700, color: lit ? 'var(--fog-100)' : 'var(--fog-300)' }}>
                {v}
              </div>
            </motion.div>
          )
        })}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ color: 'var(--fog-500)', fontSize: 20, marginTop: 12 }}
      >
        Cost["C"] = 4 — ô C đang ghi số 4
      </motion.div>
    </div>
  )
}

function MapTable() {
  const rows: [string, number][] = [
    ['A', 4],
    ['D', 12],
    ['E', 6],
  ]
  return (
    <div>
      <div style={{ color: 'var(--fog-300)', marginBottom: 8 }}>
        <span style={{ color: 'var(--fog-100)', fontWeight: 700 }}>map[C]</span> = {'{'}
      </div>
      {rows.map(([to, w], i) => (
        <motion.div
          key={to}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.25 }}
          style={{ paddingLeft: 34 }}
        >
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{to}</span>
          <span style={{ color: 'var(--fog-400)' }}> → </span>
          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{w}</span>
          {i < rows.length - 1 && <span style={{ color: 'var(--fog-400)' }}>,</span>}
          <span style={{ color: 'var(--fog-500)', fontSize: 19, marginLeft: 16 }}>
            {'// sang ' + to + ' tốn ' + w}
          </span>
        </motion.div>
      ))}
      <div style={{ color: 'var(--fog-300)' }}>{'}'}</div>
    </div>
  )
}

/** Bảng Path: seed = 2 dòng đầu mọc; grow = đủ 4 dòng; waste = soi đoạn chép lặp. */
function PathRows({ stage }: { stage: 'seed' | 'grow' | 'waste' }) {
  const highlightDup = stage === 'waste'
  const rows: { key: string; shared: string; tail?: string }[] =
    stage === 'seed'
      ? [
          { key: 'C', shared: 'A → C' },
          { key: 'E', shared: 'A → C → E' },
        ]
      : stage === 'waste'
        ? [
            // đúng cặp lời dẫn đang soi: "lộ trình của E và của B"
            { key: 'E', shared: 'A → C → E' },
            { key: 'B', shared: 'A → C → E', tail: ' → B' },
          ]
        : [
            { key: 'C', shared: 'A → C' },
            { key: 'E', shared: 'A → C → E' },
            { key: 'D', shared: 'A → C → E', tail: ' → D' },
            { key: 'B', shared: 'A → C → E', tail: ' → B' },
          ]
  const seg = (text: string, dup: boolean) => (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: 7,
        background: dup && highlightDup ? 'rgba(255, 122, 110, 0.16)' : 'transparent',
        border: dup && highlightDup ? '1.5px dashed var(--red)' : '1.5px dashed transparent',
        color: 'var(--fog-100)',
      }}
    >
      {text}
    </span>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rows.map((r, i) => (
        <motion.div
          key={r.key}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.3 }}
        >
          <span style={{ color: 'var(--fog-300)' }}>Path[{r.key}] = </span>
          {seg(r.shared, r.key !== 'C')}
          {r.tail && <span style={{ color: 'var(--fog-100)' }}>{r.tail}</span>}
        </motion.div>
      ))}
      {highlightDup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--red)', fontSize: 20 }}
        >
          ↑ phần đầu bị chép lại nhiều lần
        </motion.div>
      )}
    </div>
  )
}

/** Bản đồ lớn: mỗi ô Path lưu cả danh sách đường đi — tràn khung. */
const EXPLODE_ROWS = [
  { key: 'X₄₂', steps: 9 },
  { key: 'X₁₈₇', steps: 12 },
  { key: 'X₇₄₂', steps: 14 },
  { key: 'X₉₀₃', steps: 17 },
]
function PathExplode() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
      {EXPLODE_ROWS.map((r, i) => (
        <motion.div
          key={r.key}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.35 }}
          style={{ whiteSpace: 'nowrap' }}
        >
          <span style={{ color: 'var(--fog-300)' }}>Path[{r.key}] = </span>
          <span style={{ color: 'var(--fog-100)' }}>
            A{Array.from({ length: r.steps }, (_, k) => ` → X${String.fromCharCode(8320 + ((i * 7 + k * 3) % 10))}${String.fromCharCode(8320 + ((i * 5 + k) % 10))}`).join('')}
          </span>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
        style={{ color: 'var(--red)', fontSize: 20 }}
      >
        … × 1.000 điểm — mỗi ô lưu một danh sách dài, rất tốn bộ nhớ
      </motion.div>
    </div>
  )
}

function PrevChain() {
  const items: [string, string][] = [
    ['Prev[B]', 'E'],
    ['Prev[E]', 'C'],
    ['Prev[C]', 'A'],
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(([k, v], i) => (
        <motion.div
          key={k}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 + i * 0.3 }}
        >
          <span style={{ color: 'var(--fog-300)' }}>{k}</span>
          <span style={{ color: 'var(--fog-400)' }}> = </span>
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{v}</span>
          <span style={{ color: 'var(--fog-500)', fontSize: 19, marginLeft: 16 }}>
            {i === 0 ? '// "trước B là ai?" — chỉ MỘT bước' : ''}
          </span>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ color: 'var(--green)', fontSize: 20, marginTop: 4 }}
      >
        lần ngược: B → E → C → A — lật lại là ra cả con đường
      </motion.div>
    </div>
  )
}
