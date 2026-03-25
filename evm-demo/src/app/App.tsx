import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { CreateStandardTokenPage } from '../pages/create-standard-token-page'
import { CreateTaxTokenPage } from '../pages/create-tax-token-page'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/create-token/bsc/en-us" replace />} />
      <Route element={<AppShell />}>
        <Route path="/create-token/:chain/:lang" element={<CreateStandardTokenPage />} />
        <Route path="/create-tax-token/:chain/:lang" element={<CreateTaxTokenPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/create-token/bsc/en-us" replace />} />
    </Routes>
  )
}
