import { motion } from 'motion/react'
import { cityGraph } from '../graph/data'
import type { TraceVars } from './trace'

const NODES = cityGraph.nodes.map((n) => n.id)

/**
 * Bảng biến: 3 ngăn tủ Cost/Prev/Visited theo từng điểm + min hiện tại.
 * Ô vừa đổi giá trị (so với frame trước) lóe sáng.
 */
export function VarsPanel({ vars, prevVars }: { vars: TraceVars; prevVars?: TraceVars }) {
  const cell = (
    key: string,
    content: string,
    changed: boolean,
    isMinCol: boolean,
  ) => (
    <motion.td
      key={key}
      initial={false}
      animate={{
        backgroundColor: changed
          ? 'rgba(126, 232, 162, 0.22)'
          : isMinCol
            ? 'rgba(79, 216, 235, 0.08)'
            : 'rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: changed ? 0.18 : 0.5 }}
      style={{
        padding: '7px 0',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 21,
        fontWeight: 700,
        color: content === '·' ? 'var(--fog-500)' : 'var(--fog-100)',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      {content}
    </motion.td>
  )

  const fmtCost = (v: number | null) => (v === null ? '·' : String(v))
  const fmtPrev = (v: string | null) => (v === null ? '·' : v)
  const fmtVis = (v: boolean) => (v ? '✓' : '·')

  return (
    <div
      style={{
        background: 'var(--ink-2)',
        border: '1.5px solid var(--line-soft)',
        borderRadius: 14,
        padding: '10px 16px 6px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: 86 }} />
            {NODES.map((id) => (
              <th
                key={id}
                style={{
                  padding: '4px 0',
                  fontSize: 19,
                  fontWeight: 800,
                  color: id === vars.min ? 'var(--cyan)' : 'var(--fog-300)',
                }}
              >
                {id}
                {id === vars.min && (
                  <span style={{ fontSize: 14, display: 'block', color: 'var(--cyan)' }}>min</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <RowLabel>Cost</RowLabel>
            {NODES.map((id) =>
              cell(
                `c-${id}`,
                fmtCost(vars.cost[id]),
                !!prevVars && prevVars.cost[id] !== vars.cost[id],
                id === vars.min,
              ),
            )}
          </tr>
          <tr>
            <RowLabel>Prev</RowLabel>
            {NODES.map((id) =>
              cell(
                `p-${id}`,
                fmtPrev(vars.prev[id]),
                !!prevVars && prevVars.prev[id] !== vars.prev[id],
                id === vars.min,
              ),
            )}
          </tr>
          <tr>
            <RowLabel>Visited</RowLabel>
            {NODES.map((id) =>
              cell(
                `v-${id}`,
                fmtVis(vars.visited[id]),
                !!prevVars && prevVars.visited[id] !== vars.visited[id],
                id === vars.min,
              ),
            )}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function RowLabel({ children }: { children: string }) {
  return (
    <td
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 19,
        fontWeight: 700,
        color: 'var(--fog-300)',
        borderBottom: '1px solid var(--line-soft)',
        padding: '7px 0',
      }}
    >
      {children}
    </td>
  )
}
