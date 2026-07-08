import { Search } from 'lucide-react'

export default function FilterBar({ temas, tema, setTema, q, setQ }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {['Todos', ...temas].map(t => {
          const activo = tema === t || (t === 'Todos' && !tema)
          return (
            <button
              key={t}
              onClick={() => setTema(t === 'Todos' ? null : t)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                activo
                  ? 'bg-cruz-ink text-white'
                  : 'bg-cruz-bgAlt text-cruz-gris hover:text-cruz-ink'
              }`}
            >
              {t}
            </button>
          )
        })}
      </div>
      <label className="relative block md:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cruz-gris" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por palabra clave"
          className="w-full rounded border border-cruz-border py-2 pl-9 pr-3 text-sm"
        />
      </label>
    </div>
  )
}
