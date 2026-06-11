import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { sceneBase } from '../../graph/types'
import { TravelerDot } from '../../graph/TravelerDot'
import { CityDecorLayer, MapPin } from '../../graph/mapDecor'
import { routeToPathD } from '../../graph/usePointAlongPath'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'
import type { NodeId } from '../../graph/types'

type RouteDef = { id: string; nodes: NodeId[]; color: string; chip: string; icon: string }

const ROUTES: RouteDef[] = [
  { id: 'r1', nodes: ['A', 'C', 'E', 'B'], color: 'var(--cyan)', chip: '32 phút', icon: '⏱' },
  { id: 'r2', nodes: ['A', 'G', 'F', 'B'], color: 'var(--violet)', chip: '29 km', icon: '🛣' },
  { id: 'r3', nodes: ['A', 'D', 'B'], color: 'var(--green)', chip: '95.000đ xăng', icon: '⛽' },
]

type Beat = {
  /** chỉ số tuyến đang chạy (traveler), -1 = không có */
  running: number
  /** các tuyến đã chạy xong — vẽ vệt tĩnh */
  done: number[]
  callout?: CalloutDef
  question?: boolean
}

const BEATS = defineBeats<Beat>([
  {
    running: -1,
    done: [],
    callout: {
      tone: 'need',
      text: (
        <>
          Mở Google Maps: cần đi từ <Em color="var(--cyan)">A</Em> đến <Em>B</Em>. Giữa hai
          điểm là cả một thành phố.
        </>
      ),
    },
  },
  {
    running: 0,
    done: [],
    callout: {
      tone: 'neutral',
      text: (
        <>
          Có nhiều tuyến để chọn. Tuyến thứ nhất — nếu đo bằng <Em>THỜI GIAN</Em>: 32 phút.
        </>
      ),
    },
  },
  {
    running: 1,
    done: [0],
    callout: {
      tone: 'neutral',
      text: (
        <>
          Tuyến thứ hai — nếu đo bằng <Em>QUÃNG ĐƯỜNG</Em>: 29 km.
        </>
      ),
    },
  },
  {
    running: 2,
    done: [0, 1],
    callout: {
      tone: 'neutral',
      text: (
        <>
          Tuyến thứ ba — nếu đo bằng <Em>TIỀN XĂNG</Em>: 95.000đ.
        </>
      ),
    },
  },
  {
    running: -1,
    done: [0, 1, 2],
    callout: {
      tone: 'insight',
      text: (
        <>
          Thời gian, quãng đường, tiền xăng… — gọi chung là <Em>CHI PHÍ</Em>. Đo kiểu gì không
          quan trọng; điều ta muốn luôn là một: tuyến có{' '}
          <Em color="var(--cyan)">tổng chi phí nhỏ nhất</Em>.
        </>
      ),
    },
  },
  {
    running: -1,
    done: [0, 1, 2],
    question: true,
  },
])

const scene = sceneBase({ variant: 'map' })

function RouteTrail({ route, dimmed }: { route: RouteDef; dimmed: boolean }) {
  const d = routeToPathD(route.nodes.map((id) => mapLayout[id]))
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={route.color}
      strokeWidth={4}
      strokeLinecap="round"
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.22 : 0.4 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    />
  )
}

function S1MapsSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const running = def.running >= 0 ? ROUTES[def.running] : null

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} />
      <GraphView graph={cityGraph} scene={scene} />

      {/* vệt các tuyến đã đi xong */}
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <AnimatePresence>
          {def.done.map((i) => (
            <RouteTrail key={ROUTES[i].id} route={ROUTES[i]} dimmed={!!def.question} />
          ))}
        </AnimatePresence>
        {/* ghim A và B */}
        <MapPin x={mapLayout.A.x} y={mapLayout.A.y - 18} color="var(--cyan)" label="XUẤT PHÁT" />
        <MapPin
          x={mapLayout.B.x}
          y={mapLayout.B.y - 18}
          color="var(--amber)"
          label="ĐÍCH"
          labelSide="left"
          delay={0.35}
        />
      </svg>

      {running && (
        <TravelerDot
          route={running.nodes}
          layout={mapLayout}
          runId={`${running.id}`}
          duration={2600}
          pinToEnd={direction === -1}
          color={running.color}
        />
      )}

      <CalloutSlot callout={def.callout} beatKey={beat} w={860} />

      {/* chip chi phí các tuyến đã hiện */}
      <div
        style={{
          position: 'absolute',
          right: 70,
          top: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 15,
        }}
      >
        <AnimatePresence>
          {ROUTES.map((r, i) => {
            const visible = def.done.includes(i) || def.running === i
            if (!visible) return null
            const delay = def.running === i && direction === 1 ? 2.45 : 0.1
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: def.question ? 0.45 : 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay, duration: 0.45, ease: 'backOut' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontSize: 25,
                  fontWeight: 600,
                  color: 'var(--fog-100)',
                  background: 'rgba(13, 21, 38, 0.9)',
                  border: `2px solid ${r.color}`,
                  borderRadius: 14,
                  padding: '12px 22px',
                }}
              >
                <span style={{ fontSize: 28 }}>{r.icon}</span>
                {r.chip}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* câu hỏi treo */}
      <AnimatePresence>
        {def.question && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(7, 13, 24, 0.72)',
              zIndex: 25,
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              style={{
                fontSize: 84,
                fontWeight: 800,
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              Vậy…{' '}
              <span style={{ color: 'var(--cyan)', textShadow: '0 0 60px rgba(79,216,235,0.4)' }}>
                làm thế nào
              </span>
              ?
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S1Maps: SlideDef = {
  id: 's1-ban-do',
  title: 'Bài toán tìm đường',
  section: 1,
  beats: BEATS.count,
  component: S1MapsSlide,
}
