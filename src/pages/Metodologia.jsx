import { Link } from 'react-router-dom'
import { m } from 'framer-motion'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

export default function Metodologia() {
  return (
    <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-16 md:px-6">
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium uppercase tracking-[0.02em]">
        Conocé cómo trabajamos
      </h1>

      {/* TODO §15: traer el texto completo de la página de metodología vigente */}
      <div className="mt-8 max-w-[72ch] space-y-4 text-cruz-gris">
        <p>
          Relevamos información de manera presencial, virtual o mixta. Antes y después de cada
          investigación se realiza un monitoreo digital de redes sociales en tiempo real mediante
          herramientas de análisis de Big Data.
        </p>
        <p>
          Incorporamos inteligencia artificial como herramienta complementaria en distintas etapas
          del proceso investigativo, siempre bajo supervisión humana y con un uso ético y
          responsable que prioriza la dignidad de las personas y la calidad de la información por
          sobre la automatización.
        </p>
        <p>
          Todos los estudios cuentan con los estándares más altos de confiabilidad y excelencia,
          así como representatividad federal de acuerdo a los alcances territoriales de cada
          investigación.
        </p>
        <p>
          Desde el año 2022, el Observatorio Humanitario forma parte del Consorcio de Investigación
          de la Cruz Roja y de la Media Luna Roja (RC3) como Centro de Referencia e Investigación
          de la Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja (IFRC).
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link to="/estudios"
              className="rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover">
          Ver nuestros estudios
        </Link>
        <Link to="/#servicios"
              className="rounded border-[1.5px] border-cruz-ink px-6 py-3 font-medium transition-colors hover:bg-cruz-ink hover:text-white">
          Solicitá una investigación
        </Link>
      </div>
    </m.section>
  )
}
