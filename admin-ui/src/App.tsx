// ABOUTME: Root application component for Age Rules Admin UI
// ABOUTME: Configures routing for all data management and reporting pages

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Jurisdictions from './pages/Jurisdictions'
import Instruments from './pages/Instruments'
import Rules from './pages/Rules'
import Compliance from './pages/Compliance'
import Cases from './pages/Cases'
import Sources from './pages/Sources'
import Reports from './pages/Reports'
import ImportExport from './pages/ImportExport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="jurisdictions" element={<Jurisdictions />} />
          <Route path="instruments" element={<Instruments />} />
          <Route path="rules" element={<Rules />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="cases" element={<Cases />} />
          <Route path="sources" element={<Sources />} />
          <Route path="reports" element={<Reports />} />
          <Route path="import-export" element={<ImportExport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
