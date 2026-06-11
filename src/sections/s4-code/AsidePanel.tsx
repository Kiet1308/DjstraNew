import { motion } from 'motion/react'
import type { CodeAside } from '../../codepanel/types'

/**
 * Hình phụ cột phải Phần 4 — biến "chữ trong callout" thành hình nhìn được:
 * bảng tra map[C], hai mảng Path chồng lặp, chuỗi Prev một-bước.
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
      }}
    >
      {kind === 'mapTable' && <MapTable />}
      {kind === 'pathFull' && <PathRows highlightDup={false} />}
      {kind === 'pathWaste' && <PathRows highlightDup />}
      {kind === 'prevChain' && <PrevChain />}
    </motion.div>
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

function PathRows({ highlightDup }: { highlightDup: boolean }) {
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
      <div>
        <span style={{ color: 'var(--fog-300)' }}>Path[E] = </span>
        {seg('A → C → E', true)}
      </div>
      <div>
        <span style={{ color: 'var(--fog-300)' }}>Path[B] = </span>
        {seg('A → C → E', true)}
        <span style={{ color: 'var(--fog-100)' }}> → B</span>
      </div>
      {highlightDup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ color: 'var(--red)', fontSize: 20 }}
        >
          ↑ chép lại y nguyên — điểm nào cũng thế thì thừa chồng thừa
        </motion.div>
      )}
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
