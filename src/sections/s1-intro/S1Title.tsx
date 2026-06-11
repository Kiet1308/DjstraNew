import { motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { FogAtmosphere } from '../../graph/FogLayer'
import { KeyHint } from '../../components/KeyHint'

/** Sửa tên người trình bày tại đây. */
const PRESENTER = 'Trịnh Kiệt Vương'

const BEATS = defineBeats([{}])

function S1TitleSlide(_props: SlideProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* nền: lưới bản đồ mờ + sương trôi */}
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, opacity: 0.5 }}
      >
        <defs>
          <pattern id="titleGrid" width="110" height="110" patternUnits="userSpaceOnUse">
            <path d="M 110 0 L 0 0 0 110" fill="none" stroke="#16223c" strokeWidth="1.5" />
          </pattern>
          <radialGradient id="titleVignette">
            <stop offset="40%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="titleGridMask">
            <circle cx="960" cy="520" r="900" fill="url(#titleVignette)" />
          </mask>
        </defs>
        <rect width="1920" height="1080" fill="url(#titleGrid)" mask="url(#titleGridMask)" />
        {/* vài tuyến đường mờ chạy qua nền */}
        <g stroke="#1d2c4c" strokeWidth="3" fill="none" opacity="0.8">
          <path d="M -40 760 C 400 700, 700 860, 1100 780 S 1800 660, 1980 720" />
          <path d="M 200 -40 C 260 300, 140 600, 360 1120" />
          <path d="M 1500 -40 C 1420 320, 1640 700, 1520 1120" />
        </g>
        <g fill="#2a3a5c">
          <circle cx="360" cy="745" r="6" />
          <circle cx="1100" cy="780" r="6" />
          <circle cx="1520" cy="430" r="6" />
          <circle cx="248" cy="380" r="6" />
        </g>
      </svg>

      <FogAtmosphere />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: 'var(--cyan)',
          }}
        >
          Một bài toán · một làn sương · một cách nghĩ
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: 'easeOut' }}
          style={{
            fontSize: 'var(--fs-title)',
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            textShadow: '0 0 80px rgba(79, 216, 235, 0.25)',
          }}
        >
          TÌM ĐƯỜNG
          <br />
          NGẮN NHẤT
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ fontSize: 34, color: 'var(--fog-200)', margin: 0, fontWeight: 400 }}
        >
          — thử <strong style={{ color: 'var(--amber)', fontWeight: 800 }}>tự mình nghĩ ra</strong>{' '}
          cách giải —
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.15 }}
          style={{ fontSize: 23, color: 'var(--fog-400)', margin: '26px 0 0' }}
        >
          {PRESENTER}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.55, 1] }}
          transition={{ duration: 2.4, delay: 1.7, repeat: Infinity, repeatDelay: 1.4 }}
          style={{
            position: 'absolute',
            bottom: 84,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 21,
            color: 'var(--fog-300)',
          }}
        >
          nhấn <KeyHint>→</KeyHint> để bắt đầu
        </motion.div>
      </div>
    </div>
  )
}

export const S1Title: SlideDef = {
  id: 's1-mo-man',
  title: 'Mở màn',
  section: 1,
  beats: BEATS.count,
  component: S1TitleSlide,
}
