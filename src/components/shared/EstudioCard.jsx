import { Link } from 'react-router-dom'

function Portada({ src, alt }) {
  return (
    <div className="aspect-[3/2] w-full overflow-hidden rounded-t bg-cruz-bgAlt">
      {src && <img src={src} alt={alt} className="h-full w-full object-cover" />}
    </div>
  )
}

function Cuerpo({ e, ancha }) {
  return (
    <div className="p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-cruz-gris">
        {[e.alcance, e.fecha].filter(Boolean).map((v, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-2 divider-v pl-2" aria-hidden="true" />}
            {v}
          </span>
        ))}
      </p>
      {e.tema && (
        <span className="mt-3 inline-block rounded bg-cruz-bgAlt px-2.5 py-1 text-xs text-cruz-gris">
          {e.tema}
        </span>
      )}
      <h3 className={`mt-3 font-extrabold text-cruz-ink transition-colors group-hover:text-cruz-redOh ${ancha ? 'text-xl' : 'text-lg line-clamp-2'}`}>
        {e.titulo}
      </h3>
      {ancha && e.bajada && <p className="mt-2 text-sm text-cruz-gris">{e.bajada}</p>}
    </div>
  )
}

export default function EstudioCard({ estudio, ancha = false }) {
  const externa = estudio.url.startsWith('http')
  const clases = `group block rounded border border-cruz-border bg-white transition-shadow hover:shadow-card ${ancha ? 'md:grid md:grid-cols-2' : ''}`

  const contenido = (
    <>
      <Portada src={estudio.imagen} alt={estudio.titulo} />
      <Cuerpo e={estudio} ancha={ancha} />
    </>
  )

  return externa ? (
    <a href={estudio.url} target="_blank" rel="noopener noreferrer" className={clases}>{contenido}</a>
  ) : (
    <Link to={estudio.url} className={clases}>{contenido}</Link>
  )
}
