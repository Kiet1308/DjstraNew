import { useMemo } from 'react'
import type { SlideDef, SlideProps } from '../../deck/types'
import { buildCodeState, validateScript } from '../../codepanel/buildCodeState'
import { PREV_SCRIPT } from '../../codepanel/codeScript'
import { S4Layout } from './S4Layout'

if (import.meta.env.DEV) validateScript(PREV_SCRIPT, 'PREV_SCRIPT')

function S4PrevSlide({ beat, direction }: SlideProps) {
  const state = useMemo(() => buildCodeState(PREV_SCRIPT, beat), [beat])
  // beat 0 đổ nguyên trang code có sẵn — không gõ máy chữ lại từ đầu
  return (
    <S4Layout
      state={state}
      direction={direction}
      suppressFresh={beat === 0}
      showPseudoPin={false}
    />
  )
}

export const S4Prev: SlideDef = {
  id: 's4-luu-duong',
  title: 'Nhớ lại con đường',
  section: 4,
  beats: PREV_SCRIPT.length,
  component: S4PrevSlide,
}
