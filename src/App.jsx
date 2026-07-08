import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

const Home = lazy(() => import('./pages/Home'))
const EstudioApuestasOnline = lazy(() => import('./pages/EstudioApuestasOnline'))
const Estudios = lazy(() => import('./pages/Estudios'))
const EstudioDetalle = lazy(() => import('./pages/EstudioDetalle'))
const Metodologia = lazy(() => import('./pages/Metodologia'))
const MonitoreoDigital = lazy(() => import('./pages/MonitoreoDigital'))

const S = ({ children }) => <Suspense fallback={null}>{children}</Suspense>

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<S><Home /></S>} />
        <Route path="estudios" element={<S><Estudios /></S>} />
        <Route path="metodologia" element={<S><Metodologia /></S>} />
        <Route path="monitoreo-digital" element={<S><MonitoreoDigital /></S>} />
        {/* Rutas estáticas de estudios (Estudio*.jsx) van acá, ANTES de la genérica */}
        <Route path="estudios/apuestas-online-adolescencia" element={<S><EstudioApuestasOnline /></S>} />
        <Route path="estudios/:id" element={<S><EstudioDetalle /></S>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
