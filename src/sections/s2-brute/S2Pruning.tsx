import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { sceneBase, type GraphSceneState } from '../../graph/types'
import { TravelerDot } from '../../graph/TravelerDot'
import { CityDecorLayer } from '../../graph/mapDecor'
import { routeToPathD } from '../../graph/usePointAlongPath'
import { allBigPaths, BIG_TOTAL } from '../../explosion/ExplosionScene'
import { simulatePruning } from '../../explosion/enumeratePaths'
import { SnipScene, SNIP, BIGGEST_SNIP, type SnipPhase } from '../../explosion/SnipScene'
import { useRafLoop } from '../../explosion/useRafLoop'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

const PRUNE = simulatePruning(allBigPaths)
// số lần phải "lần đường rồi mới biết": mỗi nhát kéo + mỗi tuyến đi trọn
const PROBES = SNIP.events.length + SNIP.walkedFull
const KILLED = BIGGEST_SNIP.suffixes.length

type Beat = {
  scene: GraphSceneState
  callout?: CalloutDef
  frozen?: boolean // traveler đứng khựng ở D với đồng hồ 18 đỏ
  cityGhosts?: boolean // 3 tuyến tương lai chết theo trên cityGraph
  snip?: SnipPhase // cảnh nhát kéo trên bigGraph
  counters?: boolean // màn đếm Đã xét / Cắt sớm
}

const mapScene = sceneBase({ variant: 'map' })
const prunedScene = sceneBase({
  variant: 'map',
  edgeStates: { ED: 'pruned', DB: 'pruned' },
  nodeStates: { D: 'current' },
})

const BEATS = defineBeats<Beat>([
  // b0 — HỎI trước khi phát kiến thức
  {
    scene: mapScene,
    frozen: true,
    callout: {
      tone: 'need',
      text: (
        <>
          Đang thử tuyến mới, đi tới đây thì chi phí hiện tại là <Em color="var(--red)">18</Em> — mà kỷ
          lục đang là <Em>16</Em>. Câu hỏi: tuyến này còn <Em>đáng đi tiếp</Em> không?
        </>
      ),
    },
  },
  // b1 — CẮT
  {
    scene: prunedScene,
    frozen: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          <Em color="var(--red)">Dừng!</Em> Mới nửa đường đã đắt hơn kỷ lục — chi phí hiện tại
          đã vượt tuyến tốt nhất. <Em>CẮT NHÁNH</Em> ngay tại đây, khỏi đi tiếp.
        </>
      ),
    },
  },
  // b2 — MỚI: một nhát không chỉ giết MỘT tuyến (đếm được bằng mắt: 3)
  {
    scene: prunedScene,
    frozen: true,
    cityGhosts: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Để ý: nhát cắt vừa rồi không chỉ bỏ MỘT tuyến. <Em>Mọi tuyến tương lai</Em>{' '}
          <Em color="var(--red)">có thể bị loại cùng lúc</Em>: 1 nhát = <Em>3 tuyến</Em>.
        </>
      ),
    },
  },
  // b3 — MỚI: soi một nhát cắt trên bản đồ 12 ngã tư (HỎI trước, counter trả lời)
  {
    scene: mapScene,
    snip: 'fanout',
    callout: {
      tone: 'need',
      text: (
        <>
          Bản đồ 12 nút giao lúc nãy: mới đi {BIGGEST_SNIP.prefix.length - 1} đoạn đã tốn{' '}
          <Em color="var(--red)">{BIGGEST_SNIP.prefixCost}</Em> — hơn kỷ lục tạm trên bản đồ
          này (<Em>{BIGGEST_SNIP.bestAtTime}</Em>). Câu hỏi: phía sau chỗ này còn{' '}
          <Em>bao nhiêu tuyến chưa thử</Em> — mà tuyến nào cũng mở rộng từ điểm này?
        </>
      ),
    },
  },
  // b4 — MỚI: nhát kéo — cả chùm rụng cùng lúc
  {
    scene: mapScene,
    snip: 'snipped',
    callout: {
      tone: 'insight',
      text: (
        <>
          <Em color="var(--red)">MỘT nhát cắt — {KILLED} tuyến biến mất</Em>, không tốn thêm
          một bước chân nào. Cắt càng <Em>sớm</Em>, số tuyến bị loại càng <Em>nhiều</Em>.
        </>
      ),
    },
  },
  // b5 — Áp dụng đại trà: counter thật
  {
    scene: mapScene,
    counters: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Cả bản đồ: <Em>{BIG_TOTAL.toLocaleString('vi-VN')}</Em> tuyến —{' '}
          <Em color="var(--red)">{PRUNE.cutEarly.toLocaleString('vi-VN')}</Em> bị cắt giữa
          chừng bằng những nhát kéo như thế. Số tuyến phải đi trọn vẹn đến đích?{' '}
          <Em>Chỉ {PRUNE.walkedFull}</Em>. Nhanh hơn hẳn!
        </>
      ),
    },
  },
  // b6 — Gài cho S2StillSlow
  {
    scene: mapScene,
    counters: true,
    callout: {
      tone: 'warn',
      text: (
        <>
          Nhưng kéo không tự biết chỗ cắt: vẫn phải <Em>mò đến tận nơi</Em> rồi mới biết là
          đắt — <Em color="var(--red)">{PROBES}</Em> lần lần-đường-rồi-cắt như thế, chỉ cho 12
          nút giao. Bản đồ thật hàng nghìn nút giao: số lần mò… vẫn <Em>bùng nổ</Em>.
        </>
      ),
    },
  },
])

/** 3 tuyến tương lai bị giết theo nhát cắt tại D — đếm được bằng mắt. */
const CITY_GHOST_ROUTES: string[][] = [
  ['D', 'B'],
  ['D', 'E', 'B'],
  ['D', 'C', 'E', 'B'],
]
const CITY_GHOST_DS = CITY_GHOST_ROUTES.map((r) => routeToPathD(r.map((id) => mapLayout[id])))

function CityGhosts({ animate }: { animate: boolean }) {
  const dly = (i: number) => (animate ? 0.2 + i * 0.5 : 0)
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {CITY_GHOST_DS.map((d, i) => (
        <g key={i}>
          <motion.path
            d={d}
            fill="none"
            stroke="var(--red)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="11 10"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{
              pathLength: { duration: 0.55, ease: 'easeOut', delay: dly(i) },
              opacity: { duration: 0.25, delay: dly(i) },
            }}
          />
          <motion.text
            x={mapLayout[CITY_GHOST_ROUTES[i][1]].x + (i === 0 ? 60 : 0)}
            y={mapLayout[CITY_GHOST_ROUTES[i][1]].y - 40}
            textAnchor="middle"
            fontSize={30}
            fontWeight={800}
            fill="var(--red)"
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 0.9 }}
            transition={{ delay: dly(i) + 0.55 }}
          >
            ✕
          </motion.text>
        </g>
      ))}
      <motion.g
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: animate ? 1.9 : 0 }}
      >
        <rect
          x={mapLayout.D.x + 46}
          y={mapLayout.D.y + 30}
          width={300}
          height={52}
          rx={13}
          fill="rgba(42, 21, 18, 0.94)"
          stroke="var(--red)"
          strokeWidth={2.5}
        />
        <text
          x={mapLayout.D.x + 196}
          y={mapLayout.D.y + 57}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-mono)"
          fontSize={25}
          fontWeight={700}
          fill="var(--red)"
        >
          −3 tuyến — 0 bước chân
        </text>
      </motion.g>
    </svg>
  )
}

/**
 * Đồng hồ chi phí cộng dồn của lữ khách: NHẢY SỐ DẦN cùng nhịp chấm chạy,
 * vượt mốc 16 thì lật đỏ — để khán giả TỰ bật ra "dừng lại đi!" trước khi
 * presenter hỏi. animate=false (lùi/beat sau) → hiện thẳng trạng thái lắng.
 */
const FREEZE_MS = 1800
function FrozenMeter({ animate }: { animate: boolean }) {
  const p = mapLayout.D
  const numRef = useRef<HTMLSpanElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const overRef = useRef(false)

  const paintOver = (el: HTMLDivElement | null) => {
    if (!el) return
    el.style.color = 'var(--red)'
    el.style.borderColor = 'var(--red)'
    el.style.background = 'rgba(42, 21, 18, 0.92)'
  }

  useEffect(() => {
    overRef.current = false
    if (!animate) {
      if (numRef.current) numRef.current.textContent = '18 > 16'
      paintOver(boxRef.current)
    } else if (boxRef.current) {
      // bắt đầu trắng/lạnh — chưa có gì đáng ngại
      boxRef.current.style.color = 'var(--fog-100)'
      boxRef.current.style.borderColor = 'var(--line)'
      boxRef.current.style.background = 'rgba(13, 21, 38, 0.92)'
      if (numRef.current) numRef.current.textContent = '0'
    }
  }, [animate])

  useRafLoop(animate, (_dt, t) => {
    const v = Math.min(18, (t / FREEZE_MS) * 18)
    const shown = Math.round(v)
    if (numRef.current) {
      numRef.current.textContent = shown > 16 ? `${shown} > 16` : String(shown)
    }
    if (v > 16 && !overRef.current) {
      overRef.current = true
      paintOver(boxRef.current)
    }
  })

  return (
    <motion.div
      ref={boxRef}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'absolute',
        left: p.x + 50,
        top: p.y - 120,
        fontFamily: 'var(--font-mono)',
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--fog-100)',
        background: 'rgba(13, 21, 38, 0.92)',
        border: '2.5px solid var(--line)',
        borderRadius: 14,
        padding: '10px 22px',
        zIndex: 12,
        transition: 'color 0.25s, border-color 0.25s, background 0.25s',
      }}
    >
      đã đi: <span ref={numRef}>0</span>
    </motion.div>
  )
}

/** Hai counter Đã xét / Cắt sớm + dòng chốt "chỉ 9 đi trọn vẹn". */
function PruneCounters({ active }: { active: boolean }) {
  const triedRef = useRef<HTMLSpanElement>(null)
  const cutRef = useRef<HTMLSpanElement>(null)
  const state = useRef({ v: 0 })

  // useLayoutEffect: ghi số TRƯỚC paint đầu — không lóe "0/0" khi đến từ chiều lùi
  useLayoutEffect(() => {
    if (!active) {
      state.current.v = BIG_TOTAL
      if (triedRef.current) triedRef.current.textContent = BIG_TOTAL.toLocaleString('vi-VN')
      if (cutRef.current) cutRef.current.textContent = PRUNE.cutEarly.toLocaleString('vi-VN')
    } else {
      state.current.v = 0
    }
  }, [active])

  useRafLoop(active, (dt) => {
    const s = state.current
    if (s.v >= BIG_TOTAL) return
    s.v = Math.min(BIG_TOTAL, s.v + dt * 0.45)
    const tried = Math.floor(s.v)
    const cut = Math.floor((PRUNE.cutEarly / BIG_TOTAL) * s.v)
    if (triedRef.current) triedRef.current.textContent = tried.toLocaleString('vi-VN')
    if (cutRef.current) cutRef.current.textContent = cut.toLocaleString('vi-VN')
  })

  const box = (label: string, ref: React.RefObject<HTMLSpanElement | null>, color: string) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(13, 21, 38, 0.92)',
        border: `2px solid ${color}`,
        borderRadius: 16,
        padding: '18px 40px',
      }}
    >
      <span
        ref={ref}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 64,
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        0
      </span>
      <span style={{ fontSize: 22, color: 'var(--fog-300)' }}>{label}</span>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 56,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        zIndex: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        {box('tuyến đã xét', triedRef, 'var(--cyan)')}
        {box('bị cắt giữa chừng', cutRef, 'var(--red)')}
      </div>
      {/* con số gây sốc thật — hiện sau khi 2 counter đếm xong */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: active ? 2.1 : 0, duration: 0.45, ease: 'backOut' }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 34,
          fontWeight: 700,
          color: 'var(--amber)',
          background: 'rgba(26, 18, 6, 0.92)',
          border: '2px solid var(--amber-deep)',
          borderRadius: 16,
          padding: '12px 34px',
        }}
      >
        chỉ {PRUNE.walkedFull} tuyến phải đi đến tận đích
      </motion.div>
    </motion.div>
  )
}

function S2PruningSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const onCity = !def.snip && !def.counters
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Lớp THÀNH PHỐ (b0–b2) — crossfade sang lớp bigGraph, không remount */}
      <motion.div
        animate={{ opacity: onCity ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={1} />
        <GraphView graph={cityGraph} scene={def.scene} />
        {def.frozen && (
          <TravelerDot
            route={['A', 'D']}
            layout={mapLayout}
            runId="freeze"
            duration={1800}
            pinToEnd={beat > 0 || direction === -1}
            color="var(--red)"
          />
        )}
        <AnimatePresence>
          {def.cityGhosts && <CityGhosts animate={beat === 2 && direction === 1} />}
        </AnimatePresence>
      </motion.div>

      {/* Lớp BẢN ĐỒ 12 NGÃ TƯ (b3+) — nền mờ cho màn counter */}
      <AnimatePresence>
        {(def.snip || def.counters) && (
          <motion.div
            key="snip-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: def.counters ? 0.25 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <SnipScene
              phase={def.snip ?? 'snipped'}
              animate={direction === 1 && (beat === 3 || beat === 4)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {def.frozen && <FrozenMeter animate={beat === 0 && direction === 1} />}
      </AnimatePresence>
      <AnimatePresence>
        {def.counters && <PruneCounters active={beat === 5 && direction === 1} />}
      </AnimatePresence>

      <CalloutSlot
        callout={def.callout}
        beatKey={beat}
        y={def.counters ? 840 : 54}
        x={def.counters ? 410 : 70}
        w={def.counters ? 1100 : 900}
      />
    </div>
  )
}

export const S2Pruning: SlideDef = {
  id: 's2-cat-nhanh',
  title: 'Cắt nhánh sớm',
  section: 2,
  beats: BEATS.count,
  component: S2PruningSlide,
}
