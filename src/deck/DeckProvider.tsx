import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { gateKey, type DeckAction, type DeckState, type SlideDef } from './types'
import { slides } from './deck'

function isGate(slide: SlideDef, beat: number) {
  return slide.gateBeats?.includes(beat) ?? false
}

/** Lùi/GOTO rơi vào gate → tự resolve để không bao giờ kẹt khi tua. */
function autoResolve(state: DeckState, slideIndex: number, beat: number): Record<string, true> {
  const slide = slides[slideIndex]
  if (!isGate(slide, beat)) return state.resolvedGates
  const key = gateKey(slide.id, beat)
  if (state.resolvedGates[key]) return state.resolvedGates
  return { ...state.resolvedGates, [key]: true }
}

function reducer(state: DeckState, action: DeckAction): DeckState {
  const slide = slides[state.slideIndex]
  switch (action.type) {
    case 'NEXT': {
      if (state.overviewOpen) return state
      const key = gateKey(slide.id, state.beat)
      if (isGate(slide, state.beat) && !state.resolvedGates[key]) {
        return { ...state, nudge: state.nudge + 1 }
      }
      if (state.beat < slide.beats - 1) {
        return { ...state, beat: state.beat + 1, direction: 1, nudge: 0 }
      }
      if (state.slideIndex < slides.length - 1) {
        return { ...state, slideIndex: state.slideIndex + 1, beat: 0, direction: 1, nudge: 0 }
      }
      return state
    }
    case 'PREV': {
      if (state.overviewOpen) return state
      if (state.beat > 0) {
        const beat = state.beat - 1
        return {
          ...state,
          beat,
          direction: -1,
          nudge: 0,
          resolvedGates: autoResolve(state, state.slideIndex, beat),
        }
      }
      if (state.slideIndex > 0) {
        const slideIndex = state.slideIndex - 1
        const beat = slides[slideIndex].beats - 1
        return {
          ...state,
          slideIndex,
          beat,
          direction: -1,
          nudge: 0,
          resolvedGates: autoResolve(state, slideIndex, beat),
        }
      }
      return state
    }
    case 'GOTO': {
      const slideIndex = Math.max(0, Math.min(slides.length - 1, action.slideIndex))
      const beat = Math.max(0, Math.min(slides[slideIndex].beats - 1, action.beat ?? 0))
      if (slideIndex === state.slideIndex && beat === state.beat) {
        return { ...state, overviewOpen: false }
      }
      const direction =
        slideIndex > state.slideIndex || (slideIndex === state.slideIndex && beat > state.beat)
          ? 1
          : -1
      return {
        ...state,
        slideIndex,
        beat,
        direction,
        nudge: 0,
        overviewOpen: false,
        resolvedGates: autoResolve(state, slideIndex, beat),
      }
    }
    case 'RESOLVE_GATE': {
      if (!isGate(slide, state.beat)) return state
      const key = gateKey(slide.id, state.beat)
      if (state.resolvedGates[key]) return state
      return { ...state, nudge: 0, resolvedGates: { ...state.resolvedGates, [key]: true } }
    }
    case 'REARM_GATE': {
      if (!isGate(slide, state.beat)) return state
      const key = gateKey(slide.id, state.beat)
      if (!state.resolvedGates[key]) return state
      const resolvedGates = { ...state.resolvedGates }
      delete resolvedGates[key]
      return { ...state, nudge: 0, resolvedGates }
    }
    case 'SET_OVERVIEW':
      return state.overviewOpen === action.open ? state : { ...state, overviewOpen: action.open }
  }
}

/** Bảo hiểm livestream: URL hash `#slideId.beat` khôi phục vị trí khi refresh. */
function stateFromHash(): DeckState {
  const base: DeckState = {
    slideIndex: 0,
    beat: 0,
    direction: 1,
    resolvedGates: {},
    nudge: 0,
    overviewOpen: false,
  }
  const m = /^#([\w-]+)\.(\d+)$/.exec(window.location.hash)
  if (!m) return base
  const slideIndex = slides.findIndex((s) => s.id === m[1])
  if (slideIndex < 0) return base
  const beat = Math.max(0, Math.min(slides[slideIndex].beats - 1, Number(m[2])))
  return {
    ...base,
    slideIndex,
    beat,
    resolvedGates: autoResolve(base, slideIndex, beat),
  }
}

const StateContext = createContext<DeckState | null>(null)
const DispatchContext = createContext<Dispatch<DeckAction> | null>(null)

export function DeckProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, stateFromHash)

  useEffect(() => {
    const slide = slides[state.slideIndex]
    history.replaceState(null, '', `#${slide.id}.${state.beat}`)
  }, [state.slideIndex, state.beat])

  // Sửa hash bằng tay trên URL cũng nhảy được (replaceState không bắn event này).
  useEffect(() => {
    const onHashChange = () => {
      const m = /^#([\w-]+)\.(\d+)$/.exec(window.location.hash)
      if (!m) return
      const slideIndex = slides.findIndex((s) => s.id === m[1])
      if (slideIndex < 0) return
      dispatch({ type: 'GOTO', slideIndex, beat: Number(m[2]) })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useDeckState(): DeckState {
  const s = useContext(StateContext)
  if (!s) throw new Error('useDeckState ngoài DeckProvider')
  return s
}

export function useDeckDispatch(): Dispatch<DeckAction> {
  const d = useContext(DispatchContext)
  if (!d) throw new Error('useDeckDispatch ngoài DeckProvider')
  return d
}
