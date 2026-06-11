import type { SectionId, SlideDef } from './types'
import { S4Build } from '../sections/s4-code/S4Build'
import { S4Prev } from '../sections/s4-code/S4Prev'
import { S4Debugger } from '../debugger/DebuggerSlide'
import { S5Counting } from '../sections/s5-finale/S5Counting'
import { S5HeapTeaser } from '../sections/s5-finale/S5HeapTeaser'
import { S5NegativeEdges } from '../sections/s5-finale/S5NegativeEdges'
import { S5Reveal } from '../sections/s5-finale/S5Reveal'
import { S1Title } from '../sections/s1-intro/S1Title'
import { S1Maps } from '../sections/s1-intro/S1Maps'
import { S2TryAll } from '../sections/s2-brute/S2TryAll'
import { S2Explosion } from '../sections/s2-brute/S2Explosion'
import { S2Pruning } from '../sections/s2-brute/S2Pruning'
import { S2StillSlow } from '../sections/s2-brute/S2StillSlow'
import { S3LookFromB } from '../sections/s3-reverse/S3LookFromB'
import { S3Dependencies } from '../sections/s3-reverse/S3Dependencies'
import { S3FogWalk } from '../sections/s3-reverse/S3FogWalk'
import { S3Invariant } from '../sections/s3-reverse/S3Invariant'
import { S3Pseudocode } from '../sections/s3-reverse/S3Pseudocode'

export const SECTION_LABELS: Record<SectionId, string> = {
  1: 'Phần 1 — Đặt vấn đề',
  2: 'Phần 2 — Thử mọi con đường',
  3: 'Phần 3 — Tư duy ngược',
  4: 'Phần 4 — Thành code',
  5: 'Phần 5 — Nhìn lại',
}

export const slides: SlideDef[] = [
  S1Title,
  S1Maps,
  S2TryAll,
  S2Explosion,
  S2Pruning,
  S2StillSlow,
  S3LookFromB,
  S3Dependencies,
  S3FogWalk,
  S3Invariant,
  S3Pseudocode,
  S4Build,
  S4Prev,
  S4Debugger,
  S5Counting,
  S5HeapTeaser,
  S5NegativeEdges,
  S5Reveal,
]

export function firstSlideOfSection(section: SectionId): number {
  const i = slides.findIndex((s) => s.section === section)
  return i < 0 ? 0 : i
}
