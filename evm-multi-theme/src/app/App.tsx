import { BrowserRouter } from 'react-router-dom'
import { AppFrame } from './app-frame'
import { AppRouter } from './router'

export function App() {
  return (
    <BrowserRouter>
      <AppFrame mode="interactive">
        <AppRouter />
      </AppFrame>
    </BrowserRouter>
  )
}
