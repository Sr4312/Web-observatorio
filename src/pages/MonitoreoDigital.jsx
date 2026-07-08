import { useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { Search } from 'lucide-react'
import { MONITOREOS } from '../lib/data'
import EstudioCard from '../components/shared/EstudioCard'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

export default function MonitoreoDigital() {
  const [q, setQ] = useState('')

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return MONITOREOS
    return MONITOREOS.filter(m => m.titulo.toLowerCase().includes(s))
  }, [q])

  return (
    <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-16 md:px-6">
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium uppercase tracking-[0.02em]">
        Estudios de Monitoreo Digital
      </h1>
      <p className="mt-4 max-w-[72ch] text-cruz-gris">
        Monitoreo digital de redes sociales en tiempo real mediante herramientas de análisis
        de Big Data. Facilita identificar focos de crisis y temas de interés para la opinión
        pública, antes y después de cada investigación.
      </p>
      <p className="mt-2 text-cruz-gris">{MONITOREOS.length} informes publicados</p>

      <label className="relative mt-10 block md:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cruz-gris" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por palabra clave"
          className="w-full rounded border border-cruz-border py-2 pl-9 pr-3 text-sm"
        />
      </label>

      {filtrados.length ? (
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {filtrados.map(mo => <EstudioCard key={mo.id} estudio={mo} />)}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-cruz-gris">No encontramos informes con esa palabra clave.</p>
          <button onClick={() => setQ('')}
                  className="mt-4 rounded border-[1.5px] border-cruz-ink px-5 py-2.5 text-sm font-medium transition-colors hover:bg-cruz-ink hover:text-white">
            Limpiar búsqueda
          </button>
        </div>
      )}
    </m.section>
  )
}
