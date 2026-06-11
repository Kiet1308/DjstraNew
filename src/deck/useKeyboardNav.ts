import { useEffect } from 'react'
import { useDeckDispatch, useDeckState } from './DeckProvider'
import { firstSlideOfSection } from './deck'
import type { SectionId } from './types'

export function useKeyboardNav() {
  const dispatch = useDeckDispatch()
  const overviewOpen = useDeckState().overviewOpen

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Khi overview đang mở: chỉ nhận phím đóng, tránh nav nhầm.
      if (overviewOpen) {
        if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') {
          e.preventDefault()
          dispatch({ type: 'SET_OVERVIEW', open: false })
        }
        return
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault() // Space không được scroll/refire nút vừa click
          dispatch({ type: 'NEXT' })
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          dispatch({ type: 'PREV' })
          break
        case 'Enter':
          e.preventDefault()
          dispatch({ type: 'RESOLVE_GATE' })
          break
        case 'r':
        case 'R':
          dispatch({ type: 'REARM_GATE' })
          break
        case 'o':
        case 'O':
          dispatch({ type: 'SET_OVERVIEW', open: true })
          break
        case 'f':
        case 'F':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          dispatch({
            type: 'GOTO',
            slideIndex: firstSlideOfSection(Number(e.key) as SectionId),
          })
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, overviewOpen])
}
