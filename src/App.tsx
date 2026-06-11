import { DeckProvider } from './deck/DeckProvider'
import { DeckShell } from './deck/DeckShell'

export default function App() {
  return (
    <DeckProvider>
      <DeckShell />
    </DeckProvider>
  )
}
