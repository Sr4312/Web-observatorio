import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import { Search, Play } from 'lucide-react'
import { getEstudios } from '../lib/data'
import { supabase } from '../lib/supabase'
import EstudioCard from '../components/shared/EstudioCard'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

// TODO §15: verificar cada cifra antes de publicar. No inventar números.
const DATOS_HERO = [
  '+20 estudios publicados',
  '24 jurisdicciones',
  'Centro de Referencia IFRC desde 2022',
  'Consorcio RC3',
]

const BUSCAN = [
  { verbo: 'Identificar', texto: 'necesidades humanitarias y situaciones de vulnerabilidad' },
  { verbo: 'Acompañar', texto: 'el diseño de proyectos de incidencia social y políticas públicas' },
  { verbo: 'Sensibilizar y educar', texto: 'para contribuir a mejorar la vida de las personas' },
]

const SERVICIOS = [
  'Investigaciones especiales',
  'Informes analíticos',
  'Diseño de cuestionarios',
  'Toma de registro',
  'Elaboración de muestras',
  'Procesamiento de datos',
]

function Comentarios() {
  const [estado, setEstado] = useState('idle')

  const onSubmit = async e => {
    e.preventDefault()
    const f = new FormData(e.target)
    if (f.get('website')) return // honeypot
    const nombre = f.get('nombre').trim()
    const email = f.get('email').trim()
    const mensaje = f.get('mensaje').trim()
    if (!nombre || !email || !mensaje || mensaje.length > 2000) return
    setEstado('enviando')
    if (supabase) {
      const { error } = await supabase.from('comentarios').insert({ nombre, email, mensaje })
      if (error) { setEstado('error'); return }
    } else {
      console.log('comentario (sin Supabase):', { nombre, email, mensaje })
    }
    setEstado('ok')
  }

  if (estado === 'ok') {
    return <p className="text-lg font-bold">¡Gracias! Recibimos tu comentario.</p>
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div>
        <label htmlFor="c-nombre" className="block text-sm font-medium">Nombre</label>
        <input id="c-nombre" name="nombre" required maxLength={120}
               className="mt-1 w-full rounded border border-cruz-border bg-white px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="c-email" className="block text-sm font-medium">Dirección de correo electrónico</label>
        <input id="c-email" name="email" type="email" required maxLength={200}
               className="mt-1 w-full rounded border border-cruz-border bg-white px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="c-mensaje" className="block text-sm font-medium">Mensaje</label>
        <textarea id="c-mensaje" name="mensaje" required maxLength={2000} rows={4}
                  className="mt-1 w-full rounded border border-cruz-border bg-white px-3 py-2 text-sm" />
      </div>
      {estado === 'error' && <p className="text-sm text-cruz-redOh">No pudimos enviar tu comentario. Probá de nuevo.</p>}
      <button type="submit" disabled={estado === 'enviando'}
              className="rounded bg-cruz-red px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cruz-redHover disabled:opacity-60">
        Enviar
      </button>
    </form>
  )
}

function VideoInstitucional() {
  const [play, setPlay] = useState(false)
  const VIDEO_ID = '_OIZlaWKUg4'

  if (play) {
    return (
      <iframe
        className="aspect-video w-full rounded"
        src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
        title="Video institucional del Observatorio Humanitario"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    )
  }
  return (
    <button
      onClick={() => setPlay(true)}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded bg-cruz-bgAlt"
      aria-label="Reproducir video institucional"
    >
      <img
        src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-cruz-red text-white transition-colors group-hover:bg-cruz-redHover">
        <Play className="ml-1 h-7 w-7" fill="currentColor" />
      </span>
    </button>
  )
}

export default function Home() {
  const [estudios, setEstudios] = useState([])

  useEffect(() => { getEstudios().then(setEstudios) }, [])

  const destacado = estudios.find(e => e.destacado) ?? estudios[0]
  const grilla = estudios.filter(e => e !== destacado).slice(0, 6)

  const abrirBuscador = () =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))

  return (
    <>
      {/* a) Hero */}
      <section className="mx-auto max-w-container px-4 pb-16 pt-16 md:px-6 md:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-cruz-gris">
              Cruz Roja Argentina · Centro de Referencia IFRC
            </p>
            <h1 className="mt-6">
              <img
                src="/logos/logo-bar-observatorio.jpeg"
                alt="Observatorio Humanitario - Cruz Roja Argentina - Centro de Referencia IFRC"
                className="w-full md:w-[calc(100%+2.5rem)] md:max-w-none"
              />
            </h1>
            <p className="mt-6 max-w-[36ch] text-lg">
              Estudios interdisciplinarios desde una perspectiva centrada en las personas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/estudios"
                    className="rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover">
                Ver nuestros estudios
              </Link>
              <a href="#servicios"
                 className="rounded border-[1.5px] border-cruz-ink px-6 py-3 font-medium transition-colors hover:bg-cruz-ink hover:text-white">
                Solicitá una investigación
              </a>
            </div>
          </div>
          {/* TODO: foto real de trabajo de campo (public/images/), sin overlay */}
          <div className="aspect-[3/2] rounded bg-cruz-bgAlt" role="img" aria-label="Foto de trabajo de campo (pendiente)" />
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-y-3 border-y border-cruz-border py-5 text-sm font-medium text-cruz-gris">
          {DATOS_HERO.map((d, i) => (
            <span key={d} className={`px-6 ${i > 0 ? 'divider-v' : ''}`}>{d}</span>
          ))}
        </div>
      </section>

      {/* b) Franja institucional */}
      <m.section id="institucional" {...fadeUp()} className="mx-auto max-w-container px-4 pb-20 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Observatorio Humanitario de Cruz Roja Argentina
            </h2>
            {/* TODO §15: copiar el párrafo completo del sitio vigente */}
            <p className="mt-4 max-w-[72ch] text-cruz-gris">
              Desde el año 2022, el Observatorio Humanitario forma parte del Consorcio de
              Investigación de la Cruz Roja y de la Media Luna Roja (RC3) como Centro de
              Referencia e Investigación.
            </p>
          </div>
          <VideoInstitucional />
        </div>
      </m.section>

      {/* c) Estudios */}
      <m.section id="estudios" {...fadeUp()} className="mx-auto max-w-container px-4 pb-20 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-extrabold md:text-3xl">Conocé todos nuestros estudios</h2>
          <button onClick={abrirBuscador}
                  className="flex w-full items-center gap-3 rounded border border-cruz-border px-4 py-2.5 text-left text-sm text-cruz-gris md:w-80">
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar por palabra clave
          </button>
        </div>

        {destacado && (
          <div className="mt-8">
            <EstudioCard estudio={destacado} ancha />
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {grilla.map(e => <EstudioCard key={e.id} estudio={e} />)}
        </div>

        <div className="mt-10 text-center">
          <Link to="/estudios"
                className="inline-block rounded border-[1.5px] border-cruz-ink px-6 py-3 font-medium transition-colors hover:bg-cruz-ink hover:text-white">
            Ver todas las investigaciones
          </Link>
        </div>
      </m.section>

      {/* d) Qué buscan nuestras investigaciones */}
      <m.section id="buscan" {...fadeUp()} className="bg-cruz-bgAlt section-pad">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">Nuestras investigaciones buscan:</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
            {BUSCAN.map(({ verbo, texto }, i) => (
              <div key={verbo} className={`md:px-8 ${i > 0 ? 'md:border-l md:border-cruz-divider' : ''}`}>
                <h3 className="text-xl font-extrabold text-cruz-redOh">{verbo}</h3>
                <p className="mt-2">{texto}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-[72ch] text-cruz-gris">
            Todos los estudios cuentan con los estándares más altos de confiabilidad y excelencia.
            Así como también representatividad federal de acuerdo a los alcances territoriales de
            cada investigación.
          </p>
        </div>
      </m.section>

      {/* e) Servicios - ÚNICO bloque rojo de la página */}
      <m.section id="servicios" {...fadeUp()} className="bg-cruz-red text-white section-pad">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">Nuestros servicios</h2>
          <p className="mt-4 max-w-[72ch]">
            El Observatorio Humanitario cuenta con amplia capacidad de análisis de datos para
            comprender realidades de diversas temáticas y poblaciones.
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-bold">Esto nos permite realizar:</p>
              <ul className="mt-4">
                {SERVICIOS.map(s => (
                  <li key={s} className="border-b border-white/25 py-3 last:border-0">{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p>
                Los servicios e investigaciones se adaptan a las necesidades de las organizaciones
                no gubernamentales, organizaciones públicas y sector privado, entre otros.
              </p>
              <p className="mt-4 font-bold">Para solicitar un presupuesto, completá este breve formulario:</p>
              {/* TODO §15: URL del formulario */}
              <a href="#servicios"
                 className="mt-6 inline-block rounded bg-white px-6 py-3 font-medium text-cruz-red transition-opacity hover:opacity-90">
                Completar formulario
              </a>
              <p className="mt-6 text-sm">
                También podés contactarnos al <strong>+54 9 11-6065-0450</strong> o por mail a{' '}
                <a href="mailto:observatorio@cruzroja.org.ar" className="font-bold underline">
                  observatorio@cruzroja.org.ar
                </a>
              </p>
            </div>
          </div>
        </div>
      </m.section>

      {/* f) Metodología teaser - franja teal (acento heredado del sitio anterior) */}
      <m.section id="metodologia" {...fadeUp()} className="bg-cruz-teal text-white section-pad">
        <div className="mx-auto max-w-container px-4 md:px-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">Conocé cómo trabajamos</h2>
          <div className="mt-4 max-w-[72ch] space-y-4">
            <p>
              Relevamos información de manera presencial, virtual o mixta, con monitoreo digital
              de redes sociales en tiempo real mediante herramientas de análisis de Big Data.
            </p>
            <p>
              Incorporamos inteligencia artificial como herramienta complementaria, siempre bajo
              supervisión humana y con un uso ético y responsable. Todos los estudios cuentan con
              los estándares más altos de confiabilidad, excelencia y representatividad federal.
            </p>
          </div>
          <Link to="/metodologia"
                className="mt-8 inline-block rounded bg-white px-6 py-3 font-medium text-cruz-teal transition-opacity hover:opacity-90">
            Conocé más
          </Link>
        </div>
      </m.section>

      {/* g) Comentarios + Donación */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 pb-20 pt-16 md:px-6 md:pt-24">
        <div className="grid gap-8 md:grid-cols-2">
          <div id="comentarios" className="rounded bg-cruz-bgAlt p-8">
            <h2 className="text-xl font-extrabold">Comentarios</h2>
            <p className="mt-3 text-sm text-cruz-gris">
              Si tenés algún comentario o recomendación sobre nuestros estudios, podés cargarlos a
              continuación y nos ayudará a seguir creciendo.
            </p>
            <div className="mt-6">
              <Comentarios />
            </div>
          </div>
          <div id="donacion" className="rounded border border-cruz-border border-t-[3px] border-t-cruz-red bg-white p-8">
            <h2 className="text-xl font-extrabold">Doná</h2>
            <p className="mt-3 text-sm text-cruz-gris">
              Tu colaboración mensual o por única vez nos permite seguir transformando realidades.
            </p>
            {/* TODO §15: URL de donación */}
            <a href="https://www.cruzroja.org.ar" target="_blank" rel="noopener noreferrer"
               className="mt-6 inline-block rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover">
              Doná ahora
            </a>
            <p className="mt-4 text-sm text-cruz-gris">o llamá al <strong>0810-999-2222</strong></p>

            <p className="mt-8 text-sm font-bold">Tu aporte hace posible proyectos como estos:</p>
            <div className="marquee mt-4" aria-label="Estudios del Observatorio">
              <div className="marquee-track">
                {[...estudios, ...estudios].map((e, i) => {
                  const externa = e.url.startsWith('http')
                  const Tag = externa ? 'a' : Link
                  const props = externa
                    ? { href: e.url, target: '_blank', rel: 'noopener noreferrer' }
                    : { to: e.url }
                  return (
                    <Tag key={`${e.id}-${i}`} {...props} aria-hidden={i >= estudios.length}
                         className="group mr-3 flex w-60 shrink-0 items-center gap-3 rounded border border-cruz-border p-2 transition-shadow hover:shadow-card">
                      <div className="h-12 w-[72px] shrink-0 overflow-hidden rounded bg-cruz-bgAlt">
                        {e.imagen && <img src={e.imagen} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <p className="text-xs font-bold leading-snug text-cruz-ink line-clamp-2 group-hover:text-cruz-redOh">
                        {e.titulo}
                      </p>
                    </Tag>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </m.section>

      {/* h) Con el apoyo de */}
      <m.section id="apoyo" {...fadeUp()} className="mx-auto max-w-container px-4 pb-24 md:px-6">
        <h2 className="text-center text-2xl font-extrabold md:text-3xl">Con el apoyo de</h2>
        {/* TODO §15: lista definitiva de logos (escala de grises, tamaño uniforme) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 w-36 rounded bg-cruz-bgAlt" aria-hidden="true" />
          ))}
        </div>
      </m.section>
    </>
  )
}
