import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useRoom } from './RoomProvider'
import './room.css'

/**
 * HUD phòng trong lúc trình chiếu: pill kín đáo góc trên phải (mã phòng +
 * số người, click để chép mã). Khách rớt phòng → toast "đang nối lại" với
 * lối thoát "tiếp tục một mình" (giữ nguyên vị trí slide hiện tại).
 */
export function RoomHUD() {
  const { state, goOffline } = useRoom()
  const [copied, setCopied] = useState(false)

  if (state.phase !== 'host' && state.phase !== 'guest') return null

  const reconnecting = state.phase === 'guest' && state.link === 'reconnecting'
  const code = state.code

  const copy = () => {
    void navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <button
        className={`room-pill${reconnecting ? ' is-warn' : ''}`}
        onClick={copy}
        title="Click để chép mã phòng"
      >
        <span className="room-dot" />
        {copied ? (
          <span>đã chép mã ✓</span>
        ) : (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>
              {code.slice(0, 3)} {code.slice(3)}
            </span>
            <span style={{ color: 'var(--fog-400)' }}>
              {reconnecting ? 'đang nối lại…' : `${state.count} người`}
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {reconnecting && (
          <motion.div
            // motion tự sinh chuỗi transform — translateX phải đi qua `x`,
            // đặt trong style tĩnh sẽ bị đè mất (lệch tâm nửa bề rộng).
            initial={{ opacity: 0, y: -14, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -14, x: '-50%' }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              zIndex: 46,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              padding: '16px 28px',
              borderRadius: 14,
              border: '1px solid rgba(255, 201, 77, 0.35)',
              background: 'rgba(16, 26, 46, 0.92)',
              backdropFilter: 'blur(8px)',
              boxShadow: 'var(--shadow-panel)',
              fontSize: 21,
              color: 'var(--fog-100)',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--amber)',
                animation: 'hud-dot-pulse 0.9s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            Mất kết nối với phòng — đang nối lại…
            <button
              className="lobby-btn"
              style={{ fontSize: 20, padding: '8px 18px' }}
              onClick={goOffline}
            >
              Tiếp tục một mình
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
