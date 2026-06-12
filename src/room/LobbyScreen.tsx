import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Stage } from '../components/Stage'
import { useRoom } from './RoomProvider'
import { isValidCode, SESSION_CODE_KEY, SESSION_JOIN_KEY } from './protocol'
import './room.css'

/**
 * Màn hình đầu: Tạo phòng / Vào phòng / Một mình.
 * Cùng ngôn ngữ "bản đồ đêm" với deck — chòm sao đồ thị mờ phía sau,
 * một tuyến đường sáng dần như lời hứa của cả buổi trình chiếu.
 */

const EASE: [number, number, number, number] = [0.32, 0.72, 0.24, 1]

/* ---------- Chòm sao trang trí (bóng dáng bản đồ của deck) ---------- */

const STARS: Array<[number, number]> = [
  [150, 530], [430, 330], [400, 850], [800, 240], [760, 950],
  [1180, 300], [1240, 890], [1540, 760], [1620, 250], [1790, 540],
]
const WIRES: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [6, 7], [5, 8], [8, 9], [7, 9],
]
// "đường ngắn nhất" của lobby: A → ... → B sáng nhẹ
const LIT = [[0, 1], [1, 3], [3, 5], [5, 8], [8, 9]]

function Constellation() {
  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="lobby-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--path-a)" />
          <stop offset="1" stopColor="var(--path-b)" />
        </linearGradient>
      </defs>
      {WIRES.map(([a, b], i) => (
        <line
          key={i}
          x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]}
          stroke="var(--line-soft)" strokeWidth="2" opacity="0.55"
        />
      ))}
      {LIT.map(([a, b], i) => (
        <line
          key={`lit-${i}`}
          x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]}
          stroke="url(#lobby-path)" strokeWidth="2.5" opacity="0.16"
          strokeDasharray="10 14"
          style={{ animation: 'marching-ants 2.8s linear infinite' }}
        />
      ))}
      {STARS.map(([x, y], i) => (
        <circle
          key={`n-${i}`} cx={x} cy={y} r={i === 0 ? 7 : i === 9 ? 7 : 5}
          fill={i === 0 ? 'var(--amber)' : i === 9 ? 'var(--cyan)' : 'var(--fog-500)'}
          opacity={i === 0 || i === 9 ? 0.5 : 0.6}
        />
      ))}
    </svg>
  )
}

function FogBackdrop() {
  return (
    <>
      <div
        style={{
          position: 'absolute', left: 180, top: 80, width: 900, height: 560,
          background: 'radial-gradient(ellipse, rgba(42, 167, 189, 0.07), transparent 65%)',
          filter: 'blur(10px)', animation: 'fog-drift 16s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', right: 60, bottom: 40, width: 1000, height: 620,
          background: 'radial-gradient(ellipse, rgba(255, 201, 77, 0.05), transparent 65%)',
          filter: 'blur(10px)', animation: 'fog-drift-2 19s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

/* ---------- Glyph SVG của 3 thẻ ---------- */

function GlyphHost() {
  return (
    <svg width="150" height="110" viewBox="0 0 150 110">
      <line x1="75" y1="58" x2="22" y2="22" stroke="var(--line)" strokeWidth="2" />
      <line x1="75" y1="58" x2="130" y2="30" stroke="var(--line)" strokeWidth="2" />
      <line x1="75" y1="58" x2="120" y2="94" stroke="var(--line)" strokeWidth="2" />
      <circle cx="22" cy="22" r="5" fill="var(--fog-500)" />
      <circle cx="130" cy="30" r="5" fill="var(--fog-500)" />
      <circle cx="120" cy="94" r="5" fill="var(--fog-500)" />
      <circle className="lobby-halo" cx="75" cy="58" r="13" fill="none"
        stroke="var(--amber)" strokeWidth="2" />
      <circle className="lobby-halo d2" cx="75" cy="58" r="13" fill="none"
        stroke="var(--amber)" strokeWidth="2" />
      <circle cx="75" cy="58" r="11" fill="var(--amber)" />
    </svg>
  )
}

function GlyphJoin() {
  return (
    <svg width="150" height="110" viewBox="0 0 150 110">
      <line
        x1="34" y1="76" x2="112" y2="38" stroke="var(--cyan-soft)" strokeWidth="2.5"
        strokeDasharray="7 9" style={{ animation: 'marching-ants 1.6s linear infinite' }}
      />
      <circle cx="34" cy="76" r="9" fill="var(--cyan)" />
      <circle cx="112" cy="38" r="13" fill="none" stroke="var(--cyan)" strokeWidth="2.5" />
      <circle cx="112" cy="38" r="5" fill="var(--cyan-dim)" />
    </svg>
  )
}

function GlyphSolo() {
  return (
    <svg width="150" height="110" viewBox="0 0 150 110">
      <line x1="75" y1="58" x2="30" y2="84" stroke="var(--line-soft)" strokeWidth="2" />
      <line x1="75" y1="58" x2="122" y2="80" stroke="var(--line-soft)" strokeWidth="2" />
      <circle cx="30" cy="84" r="4" fill="var(--fog-500)" />
      <circle cx="122" cy="80" r="4" fill="var(--fog-500)" />
      <circle cx="75" cy="58" r="10" fill="var(--fog-300)" />
    </svg>
  )
}

/* ---------- Ô mã 6 số ---------- */

function CodeBoxes({
  value,
  active = false,
  amber = false,
  error = false,
}: {
  value: string
  active?: boolean
  amber?: boolean
  error?: boolean
}) {
  return (
    <div className={`lobby-code-row${error ? ' is-error' : ''}`}>
      {Array.from({ length: 6 }, (_, i) => {
        const ch = value[i] ?? ''
        const isCaret = active && i === value.length
        return (
          <div
            key={i}
            className={`lobby-digit${isCaret ? ' is-active' : ''}${amber && ch ? ' is-amber' : ''}`}
          >
            {ch || (isCaret ? <span className="lobby-caret" /> : '')}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Thẻ lựa chọn ---------- */

function ChoiceCard({
  glyph,
  title,
  desc,
  accent,
  glow,
  delay,
  onClick,
}: {
  glyph: React.ReactNode
  title: string
  desc: string
  accent: string
  glow: string
  delay: number
  onClick: () => void
}) {
  return (
    <motion.button
      className="lobby-card"
      style={{ '--card-accent': accent, '--card-glow': glow } as React.CSSProperties}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      onClick={onClick}
    >
      <div style={{ height: 118 }}>{glyph}</div>
      <div style={{ fontSize: 34, fontWeight: 800, marginTop: 18 }}>{title}</div>
      <div style={{ fontSize: 21, color: 'var(--fog-300)', marginTop: 12, lineHeight: 1.5 }}>
        {desc}
      </div>
    </motion.button>
  )
}

/* ---------- Màn hình chính ---------- */

export function LobbyScreen() {
  const room = useRoom()
  const [screen, setScreen] = useState<'menu' | 'join'>('menu')
  const [digits, setDigits] = useState('')
  const [copied, setCopied] = useState(false)
  // Refresh giữa buổi: gợi mở lại đúng phòng cũ thay vì bắt đầu từ đầu.
  const [storedHostCode] = useState(() => sessionStorage.getItem(SESSION_CODE_KEY))
  const [storedJoinCode] = useState(() => sessionStorage.getItem(SESSION_JOIN_KEY) ?? '')

  const lobby = room.state.phase === 'lobby' ? room.state : null
  const hosting = room.state.phase === 'host' ? room.state : null
  // Khách đã vào phòng nhưng host chưa bắt đầu → màn chờ (App chỉ render
  // LobbyScreen cho khách khi begun=false).
  const waiting = room.state.phase === 'guest' ? room.state : null
  const pending = lobby?.pending ?? null
  const joinError = lobby?.error?.kind === 'join' ? lobby.error.msg : null
  const createError = lobby?.error?.kind === 'create' ? lobby.error.msg : null

  const view: 'menu' | 'join' | 'creating' | 'host' | 'waiting' = hosting
    ? 'host'
    : waiting
      ? 'waiting'
      : pending?.kind === 'create'
        ? 'creating'
        : pending?.kind === 'join'
          ? 'join'
          : screen

  const joining = pending?.kind === 'join'

  // Bàn phím: gõ số ở màn nhập mã, Enter bắt đầu ở màn host, Esc quay lại.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (view === 'join') {
        if (joining) {
          if (e.key === 'Escape') room.leaveRoom()
          return
        }
        if (/^[0-9]$/.test(e.key)) {
          room.clearError()
          // Ô đã đầy (mã sai / prefill) mà gõ số mới → bắt đầu nhập mã khác,
          // không re-dial mã cũ.
          const next = digits.length >= 6 ? e.key : (digits + e.key).slice(0, 6)
          setDigits(next)
          if (next.length === 6) room.joinRoom(next)
        } else if (e.key === 'Backspace') {
          room.clearError()
          setDigits((d) => d.slice(0, -1))
        } else if (e.key === 'Enter' && isValidCode(digits)) {
          room.clearError()
          room.joinRoom(digits)
        } else if (e.key === 'Escape') {
          room.clearError()
          setDigits('')
          setScreen('menu')
        }
      } else if (view === 'host') {
        if (e.key === 'Enter') room.enterDeck()
      } else if (view === 'creating') {
        if (e.key === 'Escape') room.leaveRoom()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view, joining, digits, room])

  // Dán mã từ clipboard ở màn nhập mã.
  useEffect(() => {
    if (view !== 'join' || joining) return
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') ?? ''
      const ds = text.replace(/\D/g, '').slice(0, 6)
      if (!ds) return
      room.clearError()
      setDigits(ds)
      if (ds.length === 6) room.joinRoom(ds)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [view, joining, room])

  const copyCode = (code: string) => {
    void navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Stage>
      <FogBackdrop />
      <Constellation />

      <AnimatePresence mode="wait">
        {/* ================= MENU ================= */}
        {view === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: 19, fontWeight: 600, letterSpacing: '0.34em',
                  color: 'var(--fog-400)', textTransform: 'uppercase',
                }}
              >
                Bản đồ đêm · trình chiếu nhóm
              </div>
              <h1 style={{ margin: '22px 0 0', fontSize: 84, fontWeight: 800, lineHeight: 1.1 }}>
                Tìm đường{' '}
                <span
                  style={{
                    background: 'linear-gradient(100deg, var(--path-a), var(--path-b))',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  ngắn nhất
                </span>
              </h1>
              <div style={{ marginTop: 20, fontSize: 26, color: 'var(--fog-300)' }}>
                Cả nhóm cùng điều khiển một bộ slide — màn hình ai cũng khớp nhau.
              </div>
            </motion.div>

            <div
              style={{
                position: 'absolute', top: 430, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 40,
              }}
            >
              <ChoiceCard
                glyph={<GlyphHost />}
                title={storedHostCode ? 'Mở lại phòng' : 'Tạo phòng'}
                desc={
                  storedHostCode
                    ? `Mở lại phòng ${storedHostCode} — khách cũ sẽ tự nối lại.`
                    : 'Mở một phòng mới, lấy mã 6 số đưa cho cả nhóm.'
                }
                accent="rgba(255, 201, 77, 0.55)"
                glow="rgba(255, 201, 77, 0.18)"
                delay={0.12}
                onClick={room.createRoom}
              />
              <ChoiceCard
                glyph={<GlyphJoin />}
                title="Vào phòng"
                desc="Có mã 6 số rồi? Vào chung phòng, cùng điều khiển."
                accent="var(--cyan-soft)"
                glow="rgba(79, 216, 235, 0.22)"
                delay={0.2}
                onClick={() => {
                  setDigits(storedJoinCode)
                  setScreen('join')
                }}
              />
              <ChoiceCard
                glyph={<GlyphSolo />}
                title="Một mình"
                desc="Trình chiếu offline như thường — không cần mạng."
                accent="var(--fog-400)"
                glow="rgba(147, 163, 196, 0.14)"
                delay={0.28}
                onClick={room.goOffline}
              />
            </div>

            {createError && (
              <div
                style={{
                  position: 'absolute', top: 838, left: 0, right: 0,
                  textAlign: 'center', fontSize: 22, color: 'var(--red)',
                }}
              >
                {createError}
              </div>
            )}

            <div
              style={{
                position: 'absolute', bottom: 64, left: 0, right: 0,
                textAlign: 'center', fontSize: 20, color: 'var(--fog-500)',
              }}
            >
              Tạo / vào phòng cần mạng — chế độ một mình thì không.
            </div>
          </motion.div>
        )}

        {/* ================= NHẬP MÃ ================= */}
        {view === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 0,
            }}
          >
            <button
              className="lobby-link"
              style={{ position: 'absolute', top: 56, left: 72, fontSize: 22 }}
              onClick={() => {
                room.leaveRoom()
                room.clearError()
                setDigits('')
                setScreen('menu')
              }}
            >
              ← Quay lại
            </button>

            <div
              style={{
                fontSize: 19, fontWeight: 600, letterSpacing: '0.34em',
                color: 'var(--fog-400)', textTransform: 'uppercase', marginBottom: 26,
              }}
            >
              Vào phòng
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 52 }}>
              Nhập mã 6 số từ người tạo phòng
            </div>

            <CodeBoxes
              value={joining ? pending!.code : digits}
              active={!joining}
              error={!!joinError}
            />

            <div style={{ height: 130, marginTop: 46, textAlign: 'center' }}>
              {joining ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--cyan)' }} />
                    <div className="lobby-wire"><div className="lobby-wire-dot" /></div>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid var(--cyan)' }} />
                  </div>
                  <div style={{ fontSize: 23, color: 'var(--fog-300)' }}>
                    Đang tìm phòng <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fog-100)' }}>{pending!.code}</span>…
                    <span style={{ color: 'var(--fog-500)' }}> (Esc để hủy)</span>
                  </div>
                </div>
              ) : joinError ? (
                <div style={{ fontSize: 23, color: 'var(--red)' }}>{joinError}</div>
              ) : digits.length === 6 ? (
                <div style={{ fontSize: 20, color: 'var(--fog-300)' }}>
                  Enter để vào phòng · gõ số để nhập mã khác
                </div>
              ) : (
                <div style={{ fontSize: 20, color: 'var(--fog-500)' }}>
                  Gõ số hoặc dán mã (Ctrl+V) · Esc để quay lại
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================= ĐANG MỞ PHÒNG ================= */}
        {view === 'creating' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 34,
            }}
          >
            <svg width="180" height="140" viewBox="0 0 150 110">
              <circle className="lobby-halo" cx="75" cy="58" r="13" fill="none" stroke="var(--amber)" strokeWidth="2" />
              <circle className="lobby-halo d2" cx="75" cy="58" r="13" fill="none" stroke="var(--amber)" strokeWidth="2" />
              <circle cx="75" cy="58" r="11" fill="var(--amber)" />
            </svg>
            <div style={{ fontSize: 28, color: 'var(--fog-200)' }}>Đang mở phòng…</div>
          </motion.div>
        )}

        {/* ================= HOST: MÃ PHÒNG ================= */}
        {view === 'host' && hosting && (
          <motion.div
            key="host"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 19, fontWeight: 600, letterSpacing: '0.34em',
                color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 26,
              }}
            >
              Phòng đã mở
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 14 }}>
              Đọc mã này cho cả nhóm
            </div>
            <div style={{ fontSize: 22, color: 'var(--fog-300)', marginBottom: 50 }}>
              Ai vào phòng là màn hình khớp nhau ngay — và đều điều khiển được slide.
            </div>

            {hosting.codeChanged && (
              <div
                style={{
                  marginBottom: 30,
                  padding: '14px 26px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 122, 110, 0.45)',
                  background: 'rgba(147, 66, 59, 0.18)',
                  fontSize: 22,
                  color: 'var(--red)',
                  fontWeight: 600,
                }}
              >
                Không lấy lại được mã cũ — phòng mở bằng mã MỚI. Đọc lại mã cho cả nhóm nhé!
              </div>
            )}

            <CodeBoxes value={hosting.code} amber />

            <div
              style={{
                marginTop: 40, display: 'flex', alignItems: 'center', gap: 28,
                fontSize: 22, color: 'var(--fog-200)',
              }}
            >
              <button className="lobby-btn" style={{ fontSize: 20, padding: '12px 24px' }}
                onClick={() => copyCode(hosting.code)}>
                {copied ? 'Đã chép ✓' : '⧉ Sao chép mã'}
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: hosting.count > 1 ? 'var(--green)' : 'var(--cyan)',
                    animation: 'hud-dot-pulse 1.8s ease-in-out infinite',
                  }}
                />
                {hosting.count === 1
                  ? 'Chờ cả nhóm vào…'
                  : `${hosting.count} người trong phòng`}
              </span>
            </div>

            <button className="lobby-btn lobby-btn-primary" style={{ marginTop: 56 }}
              onClick={room.enterDeck}>
              Bắt đầu trình chiếu →
            </button>
            <div style={{ marginTop: 16, fontSize: 20, color: 'var(--fog-500)' }}>
              Enter · mã phòng vẫn hiện ở góc trên phải trong lúc chiếu
            </div>

            <button
              className="lobby-link"
              style={{ position: 'absolute', bottom: 56 }}
              onClick={room.leaveRoom}
            >
              ← Đóng phòng, về màn hình đầu
            </button>
          </motion.div>
        )}

        {/* ================= KHÁCH: CHỜ BẮT ĐẦU ================= */}
        {view === 'waiting' && waiting && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 19, fontWeight: 600, letterSpacing: '0.34em',
                color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 26,
              }}
            >
              Đã vào phòng
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 14 }}>
              Chờ bắt đầu trình chiếu…
            </div>
            <div style={{ fontSize: 22, color: 'var(--fog-300)', marginBottom: 50 }}>
              Màn hình của bạn sẽ tự chạy theo cả nhóm — phím của bạn cũng điều khiển chung.
            </div>

            <CodeBoxes value={waiting.code} amber />

            <div
              style={{
                marginTop: 40, display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 22,
                color: waiting.link === 'on' ? 'var(--fog-200)' : 'var(--amber)',
              }}
            >
              <span
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: waiting.link === 'on' ? 'var(--green)' : 'var(--amber)',
                  animation: `hud-dot-pulse ${waiting.link === 'on' ? '1.8s' : '0.9s'} ease-in-out infinite`,
                }}
              />
              {waiting.link === 'on'
                ? `${waiting.count} người trong phòng`
                : 'Mất kết nối — đang nối lại…'}
            </div>

            <button
              className="lobby-link"
              style={{ position: 'absolute', bottom: 56 }}
              onClick={room.leaveRoom}
            >
              ← Rời phòng
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  )
}
