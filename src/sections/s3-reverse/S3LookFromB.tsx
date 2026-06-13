import { AnimatePresence, motion } from 'motion/react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { CityDecorLayer } from '../../graph/mapDecor'
import type { GraphSceneState } from '../../graph/types'
import { CalloutSlot, Em, mapScene, type CalloutDef } from './common'

type Beat = {
  scene: GraphSceneState
  callout?: CalloutDef
  chaos?: boolean
  showScenarios?: boolean
}

const silhouette = {
  A: 'fogged',
  C: 'fogged',
  G: 'fogged',
  H: 'fogged',
} as const

// Phần 3 giữ nguyên BẢN ĐỒ — không morph. Đặt tên đồ thị/đỉnh/cạnh dời sang đầu Phần 4.
const BEATS = defineBeats<Beat>([
  // 1. Động cơ nhìn ngược
  {
    scene: mapScene({
      edgeStates: { DB: 'active', EB: 'active', FB: 'active' },
      nodeStates: { B: 'current' },
    }),
    chaos: true,
    callout: {
      tone: 'need',
      text: (
        <>
          Nhìn từ A thì <Em color="var(--red)">quá nhiều hướng</Em>, ta vừa thấy ở phần trước.
          Thử đổi góc: nhìn từ B. Muốn vào B thì chỉ có đúng <Em>3 đường cuối</Em> — từ D, E
          hoặc F.
        </>
      ),
    },
  },
  // 2. Câu hỏi vật lý thay tuyên bố
  {
    scene: mapScene({
      nodeStates: { ...silhouette, B: 'current' },
      edgeStates: {
        DB: 'active',
        EB: 'active',
        FB: 'active',
        AC: 'dimmed',
        AG: 'dimmed',
        AD: 'dimmed',
        CD: 'dimmed',
        CE: 'dimmed',
        ED: 'dimmed',
        GF: 'dimmed',
        GH: 'dimmed',
      },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Nếu một đường đi kết thúc ở B, <Em>bước ngay trước B</Em> là từ đâu?
        </>
      ),
    },
  },
  // 3. Khán giả trả lời → 3 cửa
  {
    scene: mapScene({
      nodeStates: { ...silhouette, B: 'current', D: 'frontier', E: 'frontier', F: 'frontier' },
      edgeStates: {
        DB: 'active',
        EB: 'active',
        FB: 'active',
        AC: 'dimmed',
        AG: 'dimmed',
        AD: 'dimmed',
        CD: 'dimmed',
        CE: 'dimmed',
        ED: 'dimmed',
        GF: 'dimmed',
        GH: 'dimmed',
      },
    }),
    callout: {
      tone: 'insight',
      text: (
        <>
          Vậy đường ngắn nhất đến B bắt buộc đi qua <Em>D</Em>, <Em>E</Em>, hoặc <Em>F</Em>.
        </>
      ),
    },
  },
  // 4. Ba kịch bản hoặc / hoặc / hoặc
  {
    scene: mapScene({
      nodeStates: { ...silhouette, B: 'current', D: 'frontier', E: 'frontier', F: 'frontier' },
      edgeStates: {
        DB: 'active',
        EB: 'active',
        FB: 'active',
        AC: 'dimmed',
        AG: 'dimmed',
        AD: 'dimmed',
        CD: 'dimmed',
        CE: 'dimmed',
        ED: 'dimmed',
        GF: 'dimmed',
        GH: 'dimmed',
      },
    }),
    showScenarios: true,
    callout: {
      tone: 'insight',
      text: (
        <>
          Chỉ còn <Em>3 khả năng</Em>: tốt nhất đến D rồi sang B, tốt nhất đến E rồi sang B,
          hoặc tốt nhất đến F rồi sang B. Phương án nhỏ nhất là đáp án.
        </>
      ),
    },
  },
  // 5. Bài toán mới
  {
    scene: mapScene({
      nodeStates: {
        ...silhouette,
        B: 'dimmed',
        D: 'current',
        E: 'current',
        F: 'current',
      },
      edgeStates: {
        DB: 'dimmed',
        EB: 'dimmed',
        FB: 'dimmed',
        AC: 'dimmed',
        AG: 'dimmed',
        AD: 'dimmed',
        CD: 'dimmed',
        CE: 'dimmed',
        ED: 'dimmed',
        GF: 'dimmed',
        GH: 'dimmed',
      },
    }),
    callout: {
      tone: 'need',
      text: (
        <>
          Bài toán chuyển thành: tìm đường tốt nhất đến <Em>D</Em>, <Em>E</Em> và <Em>F</Em>.
        </>
      ),
    },
  },
])

const SCENARIOS = [
  { via: 'D', text: 'tốt nhất đến D, rồi D → B' },
  { via: 'E', text: 'tốt nhất đến E, rồi E → B' },
  { via: 'F', text: 'tốt nhất đến F, rồi F → B' },
]

function S3LookFromBSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  // lùi beat = trạng thái lắng: không replay stagger
  const dly = (d: number) => (direction === 1 ? d : 0)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* phố xá dim dần ở các beat silhouette để 3 cửa vào B nổi lên */}
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={beat === 0 ? 1 : 0.3} />
      <GraphView graph={cityGraph} scene={def.scene} chaosFrom={def.chaos ? 'A' : undefined} />
      <CalloutSlot callout={def.callout} beatKey={beat} />

      <AnimatePresence>
        {def.showScenarios && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: 110,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 26,
              zIndex: 15,
            }}
          >
            {SCENARIOS.map((s, i) => (
              <motion.div
                key={s.via}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dly(0.1 + i * 0.25) }}
                style={{ display: 'flex', alignItems: 'center', gap: 26 }}
              >
                {i > 0 && (
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)' }}>
                    HOẶC
                  </span>
                )}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'var(--ink-2)',
                    border: '1.5px solid var(--line)',
                    borderRadius: 14,
                    padding: '14px 22px',
                    fontSize: 24,
                    color: 'var(--fog-200)',
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#0f2733',
                      border: '2px dashed var(--cyan)',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      color: 'var(--fog-100)',
                    }}
                  >
                    {s.via}
                  </span>
                  {s.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const S3LookFromB: SlideDef = {
  id: 's3-nhin-tu-b',
  title: 'Nhìn từ đích',
  section: 3,
  beats: BEATS.count,
  component: S3LookFromBSlide,
}
