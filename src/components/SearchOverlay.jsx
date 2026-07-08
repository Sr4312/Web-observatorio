import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchEstudios } from '../lib/data'

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQ('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    const t = setTimeout(() => searchEstudios(q.trim()).then(setResults), 250)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const ir = url => {
    onClose()
    if (url.startsWith('http')) window.open(url, '_blank', 'noopener')
    else navigate(url)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-cruz-ink/40 p-4 pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Buscador de estudios"
    >
      <div className="w-full max-w-2xl rounded bg-white shadow-card" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-cruz-border px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-cruz-gris" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por palabra clave"
            className="w-full text-base outline-none"
            aria-label="Buscar estudios"
          />
          <button onClick={onClose} aria-label="Cerrar buscador" className="text-cruz-gris hover:text-cruz-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {q.trim() && (
          <ul className="max-h-96 overflow-y-auto">
            {results.map(e => (
              <li key={e.id} className="border-b border-cruz-border last:border-0">
                <button onClick={() => ir(e.url)} className="block w-full px-5 py-4 text-left hover:bg-cruz-bgAlt">
                  <span className="font-bold text-cruz-ink hover:text-cruz-redOh">{e.titulo}</span>
                  <span className="mt-1 flex items-center gap-3 text-xs text-cruz-gris">
                    {e.tema && <span className="rounded bg-cruz-bgAlt px-2 py-0.5">{e.tema}</span>}
                    {e.fecha && <span>{e.fecha}</span>}
                  </span>
                </button>
              </li>
            ))}
            {!results.length && (
              <li className="px-5 py-8 text-center text-sm text-cruz-gris">
                No encontramos estudios sobre eso. Probá con otra palabra clave.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
