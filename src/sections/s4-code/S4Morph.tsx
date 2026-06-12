import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { cityGraph } from '../../graph/data'
import { mapLayout } from '../../graph/layouts'
import { GraphView } from '../../graph/GraphView'
import { CityDecorLayer } from '../../graph/mapDecor'
import { sceneBase, type GraphSceneState } from '../../graph/types'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

/* Khoảnh khắc "bản đồ cởi áo" — dời từ Phần 3 về đây theo đúng nhu cầu:
   SẮP VIẾT CODE thì máy mới cần dữ liệu trần. Nhu cầu (b0–b1) đến trước,
   tên gọi ĐỒ THỊ/ĐỈNH/CẠNH (b2) đến sau. Full-screen cho xứng tầm. */

const resultStates: Pick<GraphSceneState, 'nodeStates' | 'edgeStates' | 'weights' | 'costs'> = {
  nodeStates: {
    A: 'onPath',
    C: 'onPath',
    E: 'onPath',
    B: 'onPath',
    G: 'locked',
    D: 'locked',
    F: 'dimmed',
    H: 'dimmed',
  },
  edgeStates: {
    AC: 'onPath',
    CE: 'onPath',
    EB: 'onPath',
    AG: 'dimmed',
    AD: 'dimmed',
    CD: 'dimmed',
    ED: 'dimmed',
    DB: 'dimmed',
    GF: 'dimmed',
    GH: 'dimmed',
    FB: 'hidden',
  },
  weights: true,
  costs: { A: 0, C: 4, G: 6, E: 10, D: 14, B: 16, F: 18, H: 20 },
}

type Beat = { scene: GraphSceneState; decor: number; callout: CalloutDef }

const BEATS = defineBeats<Beat>([
  // b0 — sương tan, thành phố hiện lại — nhưng MÁY không có mắt
  {
    scene: sceneBase({ variant: 'map', ...resultStates }),
    decor: 1,
    callout: {
      tone: 'need',
      text: (
        <>
          Sương tan. Phương pháp đã tròn — giờ đến lượt <Em>MÁY</Em> làm theo. Nhưng máy không
          có mắt: nó không thấy thành phố, không thấy phố xá đèn đường — nó chỉ làm việc được
          với những gì ta <Em>ghi ra thành dữ liệu</Em> được.
        </>
      ),
    },
  },
  // b1 — soi lại: suy luận thực sự đụng đến gì?
  {
    scene: sceneBase({ variant: 'map', ...resultStates }),
    decor: 0.45,
    callout: {
      tone: 'need',
      text: (
        <>
          Mà nhìn lại cả hành trình xem — suy luận của ta có lúc nào đụng đến tên đường, nhà
          cửa không? Không. Từ đầu đến cuối chỉ có <Em>các điểm</Em> và{' '}
          <Em>các đoạn nối kèm chi phí</Em>. Mọi thứ còn lại chỉ là trang trí.
        </>
      ),
    },
  },
  // b2 — MORPH + đặt tên (tên gọi đến SAU nhu cầu)
  {
    scene: sceneBase({ variant: 'abstract', ...resultStates }),
    decor: 0,
    callout: {
      tone: 'insight',
      text: (
        <>
          Bỏ hết trang trí. Hình tối giản còn lại, dân lập trình gọi là <Em>ĐỒ THỊ</Em> — mỗi
          điểm là một <Em>ĐỈNH</Em>, mỗi đoạn nối là một <Em>CẠNH</Em>. Tên gọi thôi — nó vẫn
          là tấm bản đồ của ta.
        </>
      ),
    },
  },
])

function S4MorphSlide({ beat }: SlideProps) {
  const def = BEATS.at(beat)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CityDecorLayer layout={mapLayout} edges={cityGraph.edges} opacity={def.decor} />
      <GraphView graph={cityGraph} scene={def.scene} />
      <CalloutSlot callout={def.callout} beatKey={beat} />
    </div>
  )
}

export const S4Morph: SlideDef = {
  id: 's4-do-thi',
  title: 'Bỏ lớp trang trí',
  section: 4,
  beats: BEATS.count,
  component: S4MorphSlide,
}
