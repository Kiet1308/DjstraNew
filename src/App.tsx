import { DeckProvider } from './deck/DeckProvider'
import { DeckShell } from './deck/DeckShell'
import { LobbyScreen } from './room/LobbyScreen'
import { RoomProvider, useRoom } from './room/RoomProvider'

/**
 * Lobby trước, deck sau. Deck state sống xuyên suốt (DeckProvider bọc ngoài
 * cả hai màn) — khách đang xem mà rớt phòng thì slide đứng nguyên tại chỗ.
 * Khách vào khi host CHƯA bắt đầu thì đứng ở màn chờ (không lỡ tay bấm
 * "đốt" trước gate tương tác). `?offline` vào thẳng deck (tools + luyện tập).
 */
function Screens() {
  const { state } = useRoom()
  const inDeck =
    state.phase === 'offline' ||
    (state.phase === 'host' && state.entered) ||
    (state.phase === 'guest' && state.begun) // đang nối lại vẫn đứng yên trong deck

  return inDeck ? <DeckShell /> : <LobbyScreen />
}

export default function App() {
  return (
    <RoomProvider>
      <DeckProvider>
        <Screens />
      </DeckProvider>
    </RoomProvider>
  )
}
