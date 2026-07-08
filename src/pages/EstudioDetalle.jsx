import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getEstudios } from '../lib/data'

export default function EstudioDetalle() {
  const { id } = useParams()
  const [estudio, setEstudio] = useState(null)
  const [vizs, setVizs] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const estudios = await getEstudios()
      const e = estudios.find(x => String(x.id) === id || x.url === `/estudios/${id}` || x.slug === id)
      setEstudio(e ?? null)
      if (e && supabase) {
        const { data } = await supabase.from('visualizaciones').select('*').eq('estudio_url', e.url)
        setVizs(data ?? [])
      }
      setCargando(false)
    }
    cargar()
  }, [id])

  if (cargando) return null

  if (!estudio) {
    return (
      <section className="mx-auto max-w-container px-4 py-24 text-center md:px-6">
        <p className="text-cruz-gris">No encontramos ese estudio.</p>
        <Link to="/estudios" className="mt-4 inline-block font-medium text-cruz-redOh underline">
          Ver todos los estudios
        </Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-container px-4 py-16 md:px-6">
      <p className="text-xs font-medium uppercase tracking-wider text-cruz-gris">
        {[estudio.tema, estudio.alcance, estudio.fecha].filter(Boolean).join(' · ')}
      </p>
      <h1 className="mt-4 max-w-[30ch] text-3xl font-extrabold md:text-4xl">{estudio.titulo}</h1>
      {estudio.bajada && <p className="mt-4 max-w-[72ch] text-lg text-cruz-gris">{estudio.bajada}</p>}

      {estudio.url.startsWith('http') && (
        <a href={estudio.url} target="_blank" rel="noopener noreferrer"
           className="mt-8 inline-block rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover">
          Ver el estudio
        </a>
      )}

      {vizs.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold">Visualizaciones</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {vizs.map(v => (
              <div key={v.id} className="rounded border border-cruz-border bg-white">
                <div className="aspect-[3/2] w-full overflow-hidden rounded-t bg-cruz-bgAlt">
                  {v.imagen && <img src={v.imagen} alt={v.titulo} className="h-full w-full object-cover" />}
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold">{v.titulo}</h3>
                  {v.descripcion && <p className="mt-2 text-sm text-cruz-gris">{v.descripcion}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
