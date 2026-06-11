import { useMemo } from 'react'
import type { SlideDef, SlideProps } from '../../deck/types'
import { buildCodeState, validateScript } from '../../codepanel/buildCodeState'
import { BUILD_SCRIPT } from '../../codepanel/codeScript'
import { S4Layout } from './S4Layout'

// Dev-validator: fold toàn kịch bản lúc khởi động — bắt typo trước khi lên sóng
if (import.meta.env.DEV) validateScript(BUILD_SCRIPT, 'BUILD_SCRIPT')

function S4BuildSlide({ beat, direction }: SlideProps) {
  const state = useMemo(() => buildCodeState(BUILD_SCRIPT, beat), [beat])
  return <S4Layout state={state} direction={direction} />
}

export const S4Build: SlideDef = {
  id: 's4-dung-may',
  title: 'Dựng cỗ máy',
  section: 4,
  beats: BUILD_SCRIPT.length,
  component: S4BuildSlide,
}
