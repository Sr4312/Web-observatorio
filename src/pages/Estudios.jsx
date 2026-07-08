import { useEffect, useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { getEstudios } from '../lib/data'
import EstudioCard from '../components/shared/EstudioCard'
import FilterBar from '../components/shared/FilterBar'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

export default function Estudios() {
  const [estudios, setEstudios] = useState([])
  const [tema, setTema] = useState(null)
  const [q, setQ] = useState('')

  useEffect(() => { getEstudios().then(setEstudios) }, [])

  const temas = useMemo(() => [...new Set(estudios.map(e => e.tema).filter(Boolean))], [estudios])

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase()
    return estudios.filter(e =>
      (!tema || e.tema === tema) &&
      (!s || [e.titulo, e.bajada, e.tema].some(v => v && v.toLowerCase().includes(s)))
    )
  }, [estudios, tema, q])

  return (
    <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-16 md:px-6">
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium uppercase tracking-[0.02em]">
        Todos nuestros estudios
      </h1>
      <p className="mt-2 text-cruz-gris">{estudios.length} estudios publicados</p>

      <div className="mt-10">
        <FilterBar temas={temas} tema={tema} setTema={setTema} q={q} setQ={setQ} />
      </div>

      {filtrados.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {filtrados.map(e => <EstudioCard key={e.id} estudio={e} />)}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-cruz-gris">No encontramos estudios con esos filtros.</p>
          <button onClick={() => { setTema(null); setQ('') }}
                  className="mt-4 rounded border-[1.5px] border-cruz-ink px-5 py-2.5 text-sm font-medium transition-colors hover:bg-cruz-ink hover:text-white">
            Limpiar filtros
          </button>
        </div>
      )}
    </m.section>
  )
}
