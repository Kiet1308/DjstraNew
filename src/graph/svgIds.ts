import { createContext, useContext } from 'react'

/**
 * Id các <defs> dùng chung trong MỘT GraphView — namespace theo instance
 * để 2 GraphView cùng mount (vd mini-graph Phần 4) không giẫm id của nhau.
 */
export type SvgIds = {
  pathGrad: string
  fogSoft: string
  depArrowHead: string
  prevArrowHead: string
  edgeArrowHead: string
}

export const SvgIdsContext = createContext<SvgIds>({
  pathGrad: 'pathGrad',
  fogSoft: 'fogSoft',
  depArrowHead: 'depArrowHead',
  prevArrowHead: 'prevArrowHead',
  edgeArrowHead: 'edgeArrowHead',
})

export function useSvgIds(): SvgIds {
  return useContext(SvgIdsContext)
}
