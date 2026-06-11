import { useEffect, useState } from 'react'
import { defineBeats } from '../../deck/beatTable'
import type { SlideDef, SlideProps } from '../../deck/types'
import { BIG_TOTAL, ExplosionScene } from '../../explosion/ExplosionScene'
import { CalloutSlot, Em, type CalloutDef } from '../s3-reverse/common'

type Beat = { explode: boolean; callout?: CalloutDef }

const BEATS = defineBeats<Beat>([
  {
    explode: false,
    callout: {
      tone: 'neutral',
      text: (
        <>
          Thử sức với bản đồ to hơn <Em>một chút</Em> thôi: 12 ngã tư. Vẫn cách cũ — thử tất
          cả các tuyến từ A đến B.
        </>
      ),
    },
  },
  {
    explode: true,
    callout: {
      tone: 'warn',
      text: (
        <>
          Đếm hộ máy cái…{' '}
          <Em color="var(--red)">{BIG_TOTAL.toLocaleString('vi-VN')} tuyến khác nhau</Em> — chỉ
          với 12 ngã tư.
        </>
      ),
    },
  },
  {
    explode: true,
    callout: {
      tone: 'need',
      text: (
        <>
          Mỗi lần thêm vài ngã tư, số tuyến lại <Em>nhân</Em> lên — bản đồ thật hàng nghìn ngã
          tư thì con số vượt mọi sức tưởng tượng. Thử-tất-cả{' '}
          <Em color="var(--red)">không lớn theo kịp</Em> bản đồ.
        </>
      ),
    },
  },
])

function S2ExplosionSlide({ beat, direction }: SlideProps) {
  const def = BEATS.at(beat)
  const [doneRun, setDoneRun] = useState(false)
  // đứng ở beat 0 là "lên đạn lại" — tiến vào beat 1 luôn được xem đếm tươi
  useEffect(() => {
    if (beat === 0) setDoneRun(false)
  }, [beat])
  // tới beat 1 theo chiều lùi, hoặc đã chạy xong, hoặc đang ở beat 2 → trạng thái lắng
  const settled = beat >= 2 || (beat === 1 && direction === -1) || (beat === 1 && doneRun)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <ExplosionScene
        running={def.explode && beat === 1}
        settled={def.explode && settled}
        onDone={() => setDoneRun(true)}
      />
      {/* beat 1: giấu lời bình đến khi counter đếm xong — không phá cú twist */}
      <CalloutSlot
        callout={beat === 1 && !settled ? undefined : def.callout}
        beatKey={beat}
        y={beat === 0 ? 54 : 880}
        w={beat === 0 ? 900 : 1100}
        x={beat === 0 ? 70 : 410}
      />
    </div>
  )
}

export const S2Explosion: SlideDef = {
  id: 's2-bung-no',
  title: 'Bùng nổ số đường',
  section: 2,
  beats: BEATS.count,
  component: S2ExplosionSlide,
}
