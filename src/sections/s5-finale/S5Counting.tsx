import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

/**
 * ĐẾM BƯỚC trước — ký hiệu sau. Lưới thao tác n≈30:
 * mỗi hàng = một lần chốt (quét n điểm tìm min), n hàng → cỡ n×n bước.
 */
const N = 30
const CELL = 21
const GRID_W = N * CELL // 630
const GRID_X = (1920 - GRID_W) / 2 - 120
const GRID_Y = 250

type Beat = {
  rows: number // số hàng lưới đã tô (0 = chưa có lưới, 1 = hàng đầu, N = đầy)
  showGrid: boolean
  eStrip?: boolean
  eFold?: boolean
  naming?: boolean
  callout?: CalloutDef
}

const BEATS = defineBeats<Beat>([
  // b0 — câu hỏi mở
  {
    rows: 0,
    showGrid: false,
    callout: {
      tone: 'need',
      text: (
        <>
          Như vậy ta vừa xây dựng được <Em color="var(--cyan)">THUẬT TOÁN</Em> tìm <br />đường đi ngắn nhất giữa 2 điểm <br /><br />
          Vậy thì <Em>ĐỘ PHỨC TẠP</Em> của <Em color="var(--cyan)">THUẬT TOÁN</Em> này như nào?
        </>
      ),
    },
  },
  // b1 — phóng to lên 30 điểm
  {
    rows: 0,
    showGrid: true,
    callout: {
      tone: 'neutral',
      text: (
        <>
          <Em>ĐỘ PHỨC TẠP</Em> của <Em color="var(--cyan)">THUẬT TOÁN</Em> đến từ 2 thao tác chính: <br /><br />
          - Duyệt các đỉnh để tìm min<br />
          - Cập nhật khoảng cách tạm thời
        </>
      ),
    },
  },
  // b2 — một lần chốt = quét n điểm
  {
    rows: 1,
    showGrid: true,
    callout: {
      tone: 'neutral',
      text: (
        <>
          <Em>Vòng lặp for tìm min</Em>: <br></br>có thể thấy mỗi lần chốt 1 đỉnh , nó phải <Em color="var(--cyan)">duyệt tất cả các đỉnh</Em> để tìm cost bé nhất vì vậy cần <Em color="var(--cyan)">n bước</Em> (với <Em color="var(--cyan)">n</Em> là số đỉnh )
        </>
      ),
    },
  },
  // b3 — lặp n lần → n×n
  {
    rows: N,
    showGrid: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          <Em>Tương tự</Em> như vậy với các đỉnh còn lại , chốt hết các đỉnh <br></br>cần <Em color="var(--cyan)">n × n bước</Em>.
        </>
      ),
    },
  },
  // b4 — cộng E
  {
    rows: N,
    showGrid: true,
    eStrip: true,
    callout: {
      tone: 'neutral',
      text: (
        <>
          <Em>Tiếp theo</Em> là mỗi lần chốt xong còn <Em>duyệt các cạnh kề </Em> để cập nhật khoảng cách , tổng cộng thêm{' '}<Em color="var(--violet)">E bước</Em> (E = số đoạn nối).
        </>
      ),
    },
  },
  // b5 — E ≤ n² → vẫn cỡ n²
  {
    rows: N,
    showGrid: true,
    eStrip: true,
    eFold: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          <Em>Tổng kết lại</Em> ta cần <Em color="var(--cyan)">N^2 + V bước</Em> để hoàn thành thuật toán.
        </>
      ),
    },
  },
  // b6 — GIỜ mới đặt tên
  {
    rows: N,
    showGrid: true,
    eStrip: true,
    eFold: true,
    naming: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Và vì <Em color="var(--cyan)">E</Em> không bao giờ lớn hơn <Em color="var(--cyan)">n^2</Em> nên độ phức tạp của thuật toán là <Em color="var(--cyan)">O(n^2)</Em>
        </>
      ),
    },
  },
])

function S5CountingSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const dly = (d: number) => (direction === 1 ? d : 0)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CalloutSlot callout={def.callout} beatKey={beat} w={1000} />

      {/* Lưới thao tác */}
      <AnimatePresence>
        {def.showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', left: GRID_X, top: GRID_Y }}
          >
            {/* overflow visible: hai nhãn trục nằm ở tọa độ âm (trên/trái lưới) */}
            <svg width={GRID_W + 260} height={GRID_W + 130} style={{ overflow: 'visible' }}>
              {/* nhãn */}
              <text x={GRID_W / 2} y={-2} textAnchor="middle" fontSize={20} fill="var(--fog-300)">
                {def.rows >= 1 ? '← quét n điểm tìm min →' : ''}
              </text>
              {Array.from({ length: N }, (_, r) => (
                <g key={r}>
                  {r < def.rows &&
                    Array.from({ length: N }, (_, c) => (
                      <motion.circle
                        key={c}
                        cx={c * CELL + CELL / 2}
                        cy={r * CELL + CELL / 2 + 14}
                        r={6.5}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.9, scale: 1 }}
                        transition={{
                          delay:
                            def.rows === 1
                              ? dly(c * 0.04) // hàng đầu: quét từng chấm cho thấy "quét"
                              : dly(Math.min(1.6, r * 0.05 + c * 0.004)),
                          duration: 0.25,
                        }}
                        fill={r === 0 ? 'var(--cyan)' : 'var(--cyan-soft)'}
                      />
                    ))}
                </g>
              ))}
              {/* nhãn bên trái */}
              {def.rows === N && (
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: dly(1.7) }}
                  x={-16}
                  y={GRID_W / 2 + 14}
                  textAnchor="middle"
                  fontSize={20}
                  fill="var(--fog-300)"
                  transform={`rotate(-90 -16 ${GRID_W / 2 + 14})`}
                >
                  n lần chốt
                </motion.text>
              )}
              {/* dải E */}
              {def.eStrip && (
                <g>
                  {Array.from({ length: 24 }, (_, i) => (
                    <motion.circle
                      key={i}
                      cx={i * (CELL + 4) + CELL / 2}
                      cy={GRID_W + 52}
                      r={6.5}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 0.95, y: 0 }}
                      transition={{ delay: dly(0.3 + i * 0.03) }}
                      fill="var(--violet)"
                    />
                  ))}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: dly(0.9) }}
                    x={24 * (CELL + 4) + 18}
                    y={GRID_W + 58}
                    fontSize={21}
                    fill="var(--violet)"
                  >
                    + E bước duyệt đoạn nối
                  </motion.text>
                </g>
              )}
            </svg>

            {/* tổng kết bên phải lưới */}
            <div
              style={{
                position: 'absolute',
                left: GRID_W + 90,
                top: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
                width: 420,
              }}
            >
              <AnimatePresence>
                {def.rows === N && (
                  <motion.div
                    key="nn"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dly(1.9) }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 40,
                      fontWeight: 700,
                      color: 'var(--cyan)',
                    }}
                  >
                    n × n
                  </motion.div>
                )}
                {def.eStrip && (
                  <motion.div
                    key="pe"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dly(1.0) }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 40,
                      fontWeight: 700,
                      color: 'var(--violet)',
                    }}
                  >
                    + E
                  </motion.div>
                )}
                {def.eFold && (
                  <motion.div
                    key="fold"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dly(0.5) }}
                    style={{ fontSize: 26, color: 'var(--fog-200)', lineHeight: 1.6 }}
                  >
                    E ≤ n² <br />
                    <span style={{ color: 'var(--fog-300)' }}>
                      → n² + E ≤ 2n² —{' '}
                      <strong style={{ color: 'var(--fog-100)' }}>vẫn cỡ n²</strong>
                    </span>
                  </motion.div>
                )}
                {def.naming && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dly(0.5), ease: 'backOut' }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 64,
                      fontWeight: 700,
                      color: '#1a1206',
                      background: 'var(--amber)',
                      borderRadius: 18,
                      padding: '14px 30px',
                      alignSelf: 'flex-start',
                      boxShadow: '0 0 50px rgba(255, 201, 77, 0.35)',
                    }}
                  >
                    O(n²)
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* chú thích ký hiệu — vế E chỉ hiện khi E thật sự xuất hiện (tên sau nhu cầu) */}
      {def.showGrid && (
        <div
          style={{
            position: 'absolute',
            bottom: 78,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 21,
            color: 'var(--fog-400)',
          }}
        >
          n = số điểm{def.eStrip ? ' · E = số đoạn nối' : ''}
        </div>
      )}
    </div>
  )
}

export const S5Counting: SlideDef = {
  id: 's5-dem-buoc',
  title: 'Đếm bước',
  section: 5,
  beats: BEATS.count,
  component: S5CountingSlide,
}
