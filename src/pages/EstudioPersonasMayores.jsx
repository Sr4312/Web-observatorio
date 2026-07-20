import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence, useInView } from 'framer-motion'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend,
} from 'chart.js'
import html2canvas from 'html2canvas'
import { ArrowLeftRight, ClipboardList, Download, MoveRight, TrendingDown } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend)

// ============================================================
// Calidad de vida de personas adultas mayores en Argentina (2024).
// Estudio autocontenido (§10) con dos vistas conmutables:
//  - "infografia": réplica interactiva de la infografía oficial,
//    respetando su diagramación (índice arriba, columnas 2/3 a la
//    izquierda, 4/5 a la derecha, recomendaciones al pie).
//  - "informe": lectura editorial larga (patrón del estudio de
//    referencia), con los mismos datos.
// ============================================================

const C = {
  bg:      '#FFFFFF',
  bgAlt:   '#F5F5F6',
  ink:     '#231f20',
  inkMid:  '#5e686f',
  rule:    '#EFEFF1',
  divider: '#D9DCDE',
  red:     '#E32219',
  redOh:   '#e73743',
}
const G = ['#4886c6', '#f1635e', '#f58980', '#f6b07b', '#b8d491']
const N = ['#E94E58', '#F1858B', '#F6ACB1', '#F9D2D5']

const FUENTE = 'Observatorio Humanitario CRA - Calidad de vida de personas adultas mayores (2024)'
const PDF = 'https://cruzroja.org.ar/observatorio-humanitario/wp-content/uploads/2024/12/INFORME-CALIDAD-VIDA-PERSONAS-ADULTAS-MAYORES-2.pdf'

const MONT = "Montserrat, 'Helvetica', 'Arial', sans-serif"
const pct = v => `${String(v).replace('.', ',')}%`
const pct2 = v => `${v.toFixed(2).replace('.', ',')}%`

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

// ---------- Componentes internos (§10.2) ----------

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em]" style={{ color: C.redOh }}>
      {children}
    </p>
  )
}

function SH({ n, children }) {
  return (
    <div className="mb-8 flex items-baseline gap-4">
      <span className="text-sm font-extrabold" style={{ color: C.red }}>{String(n).padStart(2, '0')}</span>
      <span className="h-px w-10 self-center" style={{ background: C.divider }} />
      <h2 className="text-2xl font-extrabold md:text-3xl">{children}</h2>
    </div>
  )
}

function MC({ value, label, accent = false }) {
  return (
    <div className="rounded border p-5" style={{ borderColor: C.rule, background: accent ? C.bgAlt : C.bg }}>
      <p className="text-4xl font-extrabold" style={{ color: C.red }}>{value}</p>
      <p className="mt-2 text-sm" style={{ color: C.inkMid }}>{label}</p>
    </div>
  )
}

// Cuadradito rojo numerado de la infografía oficial
function NumBadge({ n }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-sm font-extrabold text-white"
      style={{ background: C.red }}
    >
      {n}
    </span>
  )
}

function PanelTitle({ n, sub, children }) {
  return (
    <div className="flex items-start gap-3">
      <NumBadge n={n} />
      <h3 className="text-sm font-extrabold leading-snug md:text-base">
        {children}
        {sub && <span className="font-medium" style={{ color: C.inkMid }}> {sub}</span>}
      </h3>
    </div>
  )
}

function DownloadableViz({ children, nombre }) {
  const ref = useRef(null)

  const descargar = async () => {
    const canvas = await html2canvas(ref.current, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      // El emblema solo existe como asset oficial sin alterar: nunca
      // se dibuja en canvas (§10.2), por eso se excluye de la captura.
      ignoreElements: el => el.hasAttribute && el.hasAttribute('data-no-capture'),
    })
    const a = document.createElement('a')
    a.download = `${nombre}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div>
      <div ref={ref} className="bg-white p-4">
        {children}
        {/* Footer del PNG: solo texto, nunca dibujar el emblema en canvas */}
        <div className="mt-4 border-t-2 pt-2" style={{ borderColor: C.red }}>
          <p className="text-xs" style={{ color: C.inkMid }}>
            Observatorio Humanitario · Cruz Roja Argentina · cruzroja.org.ar
          </p>
        </div>
      </div>
      <button
        onClick={descargar}
        className="mt-2 flex items-center gap-2 text-sm font-medium transition-colors hover:text-cruz-redOh"
        style={{ color: C.inkMid }}
      >
        <Download className="h-4 w-4" /> Descargar PNG
      </button>
    </div>
  )
}

function ChartCard({ titulo, fuente, nota, alto = 'h-64', children }) {
  return (
    <div className="rounded border p-6" style={{ borderColor: C.rule }}>
      <h3 className="font-extrabold">{titulo}</h3>
      <div className={`mt-4 ${alto}`}>{children}</div>
      {nota && <p className="mt-3 text-xs" style={{ color: C.inkMid }}>{nota}</p>}
      <p className="mt-4 text-xs" style={{ color: C.inkMid }}>Fuente: {fuente}</p>
    </div>
  )
}

function BotonInforme() {
  return (
    <a
      href={PDF}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover"
    >
      <Download className="h-4 w-4" /> Descargar el informe completo
    </a>
  )
}

// Monta el gráfico recién cuando entra en pantalla, para que la
// animación de Chart.js se vea al scrollear (movimiento sin plugins).
function InViewChart({ children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return <div ref={ref} className="h-full w-full">{inView ? children : null}</div>
}

// Contador animado: sube de `start` a `target` cuando el nodo entra en
// pantalla. Con prefers-reduced-motion salta directo al valor final.
function useCountUp(target, { start = 0, duration = 1600 } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(start)

  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(start + (target - start) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, start, duration])

  return { ref, val }
}

// ---------- Escala de color del índice (1→10) ----------
// Celdas discretas muestreadas del degradé entre anclas de la paleta G,
// como la barra segmentada de la infografía oficial.

const hexLerp = (a, b, t) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')
}
const ESCALA_STOPS = [G[1], G[2], G[3], G[4]]
const escalaColor = t => {
  const seg = Math.min(Math.floor(t * 3), 2)
  return hexLerp(ESCALA_STOPS[seg], ESCALA_STOPS[seg + 1], t * 3 - seg)
}
const CELDAS = Array.from({ length: 14 }, (_, i) => escalaColor(i / 13))

const posEscala = v => ((v - 1) / 9) * 100

// Medidor de la vista infografía: barra segmentada 1→10, aguja que
// barre hasta 4,9 con contador, y marca fantasma del 5,7 de 2022.
function GaugeInfografia() {
  const { ref, val } = useCountUp(4.9, { start: 1, duration: 1600 })
  const done = val >= 4.89

  return (
    <div
      ref={ref}
      className="min-w-0 flex-1"
      role="img"
      aria-label="Índice de bienestar de adultos/as mayores: 4,9 sobre 10 en 2024; 5,7 sobre 10 en 2022. Escala de 1 (bajo bienestar) a 10 (alto bienestar)."
    >
      <div className="flex justify-between text-sm font-extrabold">
        <span style={{ color: C.red }}>1</span>
        <span style={{ color: G[4] }}>10</span>
      </div>

      <div className="relative mt-1 pt-8">
        {/* Marca fantasma 2022 */}
        <m.div
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute top-0 z-10"
          style={{ left: `${posEscala(5.7)}%` }}
        >
          <p className="-translate-x-1/2 whitespace-nowrap text-xs font-bold" style={{ color: C.inkMid }}>
            5,7 <span className="font-medium">2022</span>
          </p>
          <span
            className="absolute left-0 top-[18px] h-8 w-[2px] -translate-x-1/2 rounded"
            style={{ background: C.inkMid, opacity: 0.5 }}
          />
        </m.div>

        {/* Barra segmentada */}
        <div className="flex h-5 w-full gap-[3px]">
          {CELDAS.map((c, i) => (
            <div
              key={i}
              className={`min-w-0 flex-1 ${i === 0 ? 'rounded-l-full' : ''} ${i === CELDAS.length - 1 ? 'rounded-r-full' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Aguja 2024 + cifra grande */}
        <div
          className="absolute z-10 w-[3px] -translate-x-1/2 rounded"
          style={{ left: `${posEscala(val)}%`, top: '26px', height: '46px', background: C.ink }}
        />
        <div
          className="absolute top-[78px] -translate-x-1/2 text-center"
          style={{ left: `${posEscala(val)}%` }}
        >
          <p className="text-3xl font-extrabold leading-none tabular-nums md:text-4xl">
            {val.toFixed(1).replace('.', ',')}
          </p>
          <p className="mt-0.5 text-xs font-extrabold" style={{ color: C.red }}>2024</p>
        </div>

        {/* Extremos de la escala */}
        <div className="mt-1.5 flex justify-between pb-20 text-xs font-extrabold">
          <span style={{ color: C.red }}>Bajo bienestar</span>
          <span style={{ color: G[4] }}>Alto bienestar</span>
        </div>
      </div>
    </div>
  )
}

// Medidor de la vista informe (v1): degradé continuo con aguja.
function GaugeBienestar() {
  const { ref, val } = useCountUp(4.9, { start: 1, duration: 1600 })
  const done = val >= 4.89

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <p className="text-7xl font-extrabold leading-none tabular-nums md:text-8xl" style={{ color: C.red }}>
          {val.toFixed(1).replace('.', ',')}
        </p>
        <div className="pb-1.5">
          <p className="text-sm font-bold">sobre 10 puntos · 2024</p>
          <m.p
            initial={{ opacity: 0, y: 6 }}
            animate={done ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="mt-1.5 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: C.red }}
          >
            <TrendingDown className="h-3.5 w-3.5" /> 0,8 puntos menos que en 2022
          </m.p>
        </div>
      </div>

      <div className="relative mb-8 mt-14">
        <m.div
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute -top-7 z-10"
          style={{ left: `${posEscala(5.7)}%` }}
        >
          <p className="-translate-x-1/2 whitespace-nowrap text-xs font-bold" style={{ color: C.inkMid }}>
            5,7 · 2022
          </p>
          <span
            className="absolute left-0 top-[22px] h-9 w-[2px] -translate-x-1/2 rounded"
            style={{ background: C.inkMid, opacity: 0.55 }}
          />
        </m.div>

        <div
          className="relative h-4 rounded-full"
          style={{ background: `linear-gradient(90deg, ${G[1]}, ${G[2]} 34%, ${G[3]} 64%, ${G[4]})` }}
        >
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => (
            <span key={t} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${posEscala(t)}%` }} />
          ))}
          <div
            className="absolute top-1/2 z-10 h-9 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded"
            style={{ left: `${posEscala(val)}%`, background: C.ink }}
          >
            <p
              className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs font-extrabold"
              style={{ color: C.red }}
            >
              {val.toFixed(1).replace('.', ',')} · 2024
            </p>
          </div>
        </div>

        <div className="mt-9 flex justify-between text-xs" style={{ color: C.inkMid }}>
          <p><span className="font-extrabold" style={{ color: C.ink }}>1</span> · Bajo bienestar</p>
          <p>Alto bienestar · <span className="font-extrabold" style={{ color: C.ink }}>10</span></p>
        </div>
      </div>
    </div>
  )
}

// ---------- Config de gráficos (§10.3) ----------

const tooltipBase = {
  backgroundColor: C.ink,
  cornerRadius: 8,
  padding: 12,
  titleFont: { family: MONT, size: 12 },
  bodyFont: { family: MONT, size: 12 },
}

const mkBarOpts = max => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { max, ticks: { font: { size: 12, family: MONT }, callback: v => v + '%' }, grid: { color: C.rule } },
    y: { ticks: { font: { size: 12, family: MONT } }, grid: { display: false } },
  },
  plugins: {
    legend: { display: false },
    tooltip: { ...tooltipBase, callbacks: { label: ctx => ` ${pct(ctx.parsed.x)}` } },
  },
})

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  layout: { padding: { right: 52 } },
  scales: {
    x: { ticks: { font: { size: 12, family: MONT } }, grid: { display: false } },
    y: { min: 0, max: 70, ticks: { font: { size: 12, family: MONT }, callback: v => v + '%' }, grid: { color: C.rule } },
  },
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12, family: MONT }, usePointStyle: true, boxWidth: 8 } },
    tooltip: { ...tooltipBase, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${pct(ctx.parsed.y)}` } },
  },
}

const donutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '58%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12, family: MONT }, boxWidth: 12 } },
    tooltip: { ...tooltipBase, callbacks: { label: ctx => ` ${ctx.label}: ${pct(ctx.parsed)}` } },
  },
}

// Columnas apiladas de la infografía (panel 2): sin eje Y, % sobre
// los segmentos, leyenda arriba en el orden visual (No / Sí / NR).
const stackOpts = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 12, family: MONT, weight: 700 }, color: C.ink } },
    y: { stacked: true, display: false, max: 100 },
  },
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      reverse: true,
      labels: { font: { size: 11, family: MONT }, boxWidth: 10, boxHeight: 10 },
    },
    tooltip: { ...tooltipBase, callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } },
  },
}

// Barras horizontales de la infografía (panel 3): sin eje X, valor al
// final de cada barra con el formato del original (14,50%).
const evoOpts = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { right: 64 } },
  scales: {
    x: { display: false, max: 44 },
    y: { ticks: { font: { size: 11, family: MONT }, color: C.inkMid }, grid: { display: false }, border: { display: false } },
  },
  plugins: {
    legend: { display: false },
    tooltip: { ...tooltipBase, callbacks: { label: ctx => ` ${pct2(ctx.parsed.x)}` } },
  },
}

// Etiqueta directa sobre el último punto de cada línea (el dato 2024)
const endpointLabels = {
  id: 'endpointLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    ctx.save()
    ctx.font = `800 13px ${MONT}`
    ctx.fillStyle = C.ink
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    chart.data.datasets.forEach((ds, i) => {
      if (!chart.isDatasetVisible(i)) return
      const meta = chart.getDatasetMeta(i)
      const last = meta.data[meta.data.length - 1]
      if (last) ctx.fillText(pct(ds.data[ds.data.length - 1]), last.x + 10, last.y)
    })
    ctx.restore()
  },
}

// % centrado dentro de cada segmento apilado (solo si entra: >= 10%)
const stackLabels = {
  id: 'stackLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    ctx.save()
    ctx.font = `800 12px ${MONT}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    chart.data.datasets.forEach((ds, di) => {
      if (!chart.isDatasetVisible(di)) return
      const meta = chart.getDatasetMeta(di)
      meta.data.forEach((seg, i) => {
        const v = ds.data[i]
        if (v < 10) return
        ctx.fillStyle = ds.backgroundColor === G[1] ? '#FFFFFF' : C.ink
        ctx.fillText(`${v}%`, seg.x, (seg.y + seg.base) / 2)
      })
    })
    ctx.restore()
  },
}

// Valor al final de cada barra horizontal (formato 14,50%)
const barEndLabels = {
  id: 'barEndLabels',
  afterDatasetsDraw(chart) {
    const { ctx } = chart
    ctx.save()
    ctx.font = `800 12px ${MONT}`
    ctx.fillStyle = C.ink
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const ds = chart.data.datasets[0]
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      ctx.fillText(pct2(ds.data[i]), bar.x + 8, bar.y)
    })
    ctx.restore()
  },
}

// ---------- Datos del estudio (infografía oficial diciembre 2024) ----------

const INGRESOS = {
  labels: ['2021', '2022', '2024'],
  datasets: [
    {
      label: 'Sí le alcanza',
      data: [58, 56, 47],
      borderColor: G[4], backgroundColor: G[4],
      borderWidth: 3, tension: 0.3,
      pointRadius: 5, pointHoverRadius: 7, pointBorderColor: '#FFFFFF', pointBorderWidth: 2,
      pointStyle: 'circle',
    },
    {
      label: 'No le alcanza',
      data: [38, 37, 50],
      borderColor: G[1], backgroundColor: G[1],
      borderWidth: 3, tension: 0.3,
      pointRadius: 5, pointHoverRadius: 7, pointBorderColor: '#FFFFFF', pointBorderWidth: 2,
      pointStyle: 'rectRot',
    },
  ],
}

const INGRESOS_APILADO = {
  labels: ['2021', '2022', '2024'],
  datasets: [
    { label: 'No responde', data: [4, 7, 3], backgroundColor: C.divider, borderColor: '#FFFFFF', borderWidth: 2, barThickness: 46 },
    { label: 'Sí', data: [58, 56, 47], backgroundColor: G[4], borderColor: '#FFFFFF', borderWidth: 2, barThickness: 46 },
    { label: 'No', data: [38, 37, 50], backgroundColor: G[1], borderColor: '#FFFFFF', borderWidth: 2, barThickness: 46, borderRadius: 3 },
  ],
}

const EVOLUCION = {
  labels: [['Mejoró mucho', 'o bastante'], ['Se mantuvo', 'igual'], ['Empeoró mucho', 'o bastante']],
  datasets: [{ data: [14.5, 43.3, 39.9], backgroundColor: G[0], borderRadius: 4, barThickness: 30 }],
}

const EVOLUCION_INFO = {
  labels: [['Mejoró mucho', 'o bastante'], ['Se mantuvo', 'igual'], ['Empeoró mucho', 'o bastante']],
  datasets: [{ data: [14.5, 43.3, 39.9], backgroundColor: [G[4], G[3], G[1]], borderRadius: 3, barThickness: 26 }],
}

const COBERTURA = {
  labels: ['Obra social / PAMI', 'Hospital / centro de salud público', 'Prepaga', 'No responde'],
  datasets: [{
    data: [71.6, 13.6, 12.9, 1.9],
    backgroundColor: [G[0], G[3], G[1], C.divider],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  }],
}

// Segmentos de la barra 100% de cobertura médica (vista infografía)
const COBERTURA_SEG = [
  { label: 'Obra social / PAMI', v: 71.6, color: G[3] },
  { label: 'Hospital / centro de salud público', v: 13.6, color: G[2] },
  { label: 'Prepaga', v: 12.9, color: N[2] },
  { label: 'No responde', v: 1.9, color: C.divider },
]

const MEDICAMENTOS = {
  labels: [
    ['Cobertura parcial PAMI /', 'obra social (descuento)'],
    ['Cobertura total', 'PAMI / obra social'],
    ['Cobertura parcial', 'prepaga (descuento)'],
    ['Los paga por', 'su cuenta'],
    ['Cobertura total', 'prepaga'],
  ],
  datasets: [{ data: [59.2, 16.1, 8.8, 6.2, 3.7], backgroundColor: G[1], borderRadius: 4, barThickness: 24 }],
}

// Filas de medicamentos (vista infografía): rampa N por magnitud,
// textos literales del original.
const MEDICAMENTOS_FILAS = [
  { label: 'Cobertura parcial PAMI / Obra social (descuento)', v: 59.2, color: N[0], dentro: true },
  { label: 'Los cubre totalmente PAMI / Obra social', v: 16.1, color: N[1] },
  { label: 'Los cubre parcialmente la prepaga (descuento)', v: 8.8, color: N[2] },
  { label: 'Los pago por mi cuenta', v: 6.2, color: N[2] },
  { label: 'Los cubre totalmente la prepaga', v: 3.7, color: N[3] },
]

const RECOMENDACIONES = [
  ['1', 'Impulsar la participación de las personas adultas mayores en la construcción de planes y programas de vida activa y saludable, autocuidado y bienestar integral.'],
  ['2', 'Fortalecer el sistema previsional y garantizar el acceso mínimo a medios de subsistencia con instrumentos efectivos y sostenibles.'],
  ['3', 'Promover el rol de las organizaciones humanitarias y de la sociedad civil en el acompañamiento y desarrollo del bienestar de las personas adultas mayores.'],
]

// Animación de entrada del hero (escalonada)
const heroStagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const heroItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// ---------- Piezas de la vista infografía ----------

// Burbujas decorativas flotantes (guiño a la ilustración central del
// original). Solo desktop; framer respeta prefers-reduced-motion.
function Burbujas() {
  const BUBBLES = [
    { size: 150, top: '4%', left: '12%', color: C.bgAlt, dur: 9 },
    { size: 72, top: '18%', left: '62%', color: G[4], opacity: 0.28, dur: 7 },
    { size: 46, top: '46%', left: '24%', color: G[2], opacity: 0.22, dur: 6 },
    { size: 104, top: '52%', left: '55%', color: N[3], opacity: 0.5, dur: 8 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <m.div
          key={i}
          className="absolute rounded-full"
          style={{ width: b.size, height: b.size, top: b.top, left: b.left, background: b.color, opacity: b.opacity ?? 1 }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: b.dur, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function BadgeEncuestas() {
  return (
    <div
      className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded border bg-white px-5 py-3 shadow-card"
      style={{ borderColor: C.divider }}
    >
      <ClipboardList className="h-5 w-5 shrink-0" style={{ color: C.red }} />
      <span className="text-sm font-extrabold whitespace-nowrap">1164 encuestas</span>
      <MoveRight className="h-4 w-4 shrink-0" style={{ color: C.inkMid }} />
      <span className="text-[11px] font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: C.inkMid }}>
        23 provincias y CABA · Argentina
      </span>
    </div>
  )
}

// Barra 100% de cobertura médica con callouts como el original y
// tooltip propio al pasar el mouse.
function CoberturaBar() {
  const [tip, setTip] = useState(null)
  const inicios = COBERTURA_SEG.reduce((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + COBERTURA_SEG[i - 1].v)
    return acc
  }, [])

  return (
    <div
      role="img"
      aria-label="Cobertura médica: obra social o PAMI 71,6%; hospital o centro de salud público 13,6%; prepaga 12,9%; no responde 1,9%."
    >
      {/* Callouts superiores (desktop) */}
      <div className="relative hidden h-5 text-[11px] font-bold md:block">
        <span className="absolute left-0" style={{ color: C.red }}>Obra social / PAMI</span>
        <span className="absolute right-0 flex items-center gap-1.5" style={{ color: C.inkMid }}>
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: N[2] }} /> Prepaga · 12,9%
        </span>
      </div>

      {/* Barra apilada */}
      <div className="relative mt-1 flex h-10 w-full" onMouseLeave={() => setTip(null)}>
        {COBERTURA_SEG.map((s, i) => (
          <m.div
            key={s.label}
            className={`relative h-full min-w-0 ${i === 0 ? 'rounded-l-sm' : ''} ${i === COBERTURA_SEG.length - 1 ? 'rounded-r-sm' : ''}`}
            style={{ background: s.color, marginRight: i < COBERTURA_SEG.length - 1 ? 2 : 0 }}
            initial={{ width: 0 }}
            whileInView={{ width: `${s.v}%` }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
            onMouseEnter={() => setTip(i)}
          >
            {s.v > 30 && (
              <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-white">
                {pct(s.v)}
              </span>
            )}
          </m.div>
        ))}

        {tip != null && (
          <div
            className="pointer-events-none absolute -top-11 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs text-white"
            style={{ background: C.ink, left: `${inicios[tip] + COBERTURA_SEG[tip].v / 2}%` }}
          >
            {COBERTURA_SEG[tip].label}: <b>{pct(COBERTURA_SEG[tip].v)}</b>
          </div>
        )}
      </div>

      {/* Callouts inferiores (desktop) */}
      <div className="mt-1.5 hidden justify-end gap-5 text-[11px] font-bold md:flex" style={{ color: C.inkMid }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: G[2] }} /> Hospital / centro de salud público · 13,6%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: C.divider }} /> 1,9% No responde
        </span>
      </div>

      {/* Lista (mobile) */}
      <ul className="mt-3 space-y-1.5 md:hidden">
        {COBERTURA_SEG.map(s => (
          <li key={s.label} className="flex items-center gap-2 text-xs" style={{ color: C.inkMid }}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="min-w-0 flex-1">{s.label}</span>
            <b style={{ color: C.ink }}>{pct(s.v)}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Filas de acceso a medicamentos: caja de etiqueta gris + barra animada,
// como el bloque 5 del original.
function FilasMedicamentos() {
  return (
    <div className="space-y-2">
      {MEDICAMENTOS_FILAS.map((f, i) => (
        <div key={f.label} className="group grid grid-cols-[minmax(0,46%)_1fr] items-stretch gap-1.5">
          <div
            className="flex items-center justify-end rounded-sm px-3 py-1.5 text-right text-[11px] font-medium leading-tight"
            style={{ background: C.bgAlt, color: C.ink }}
          >
            {f.label}
          </div>
          <div className="flex min-w-0 items-center">
            <m.div
              className="relative h-7 shrink-0 rounded-r-sm transition-opacity group-hover:opacity-85"
              style={{ background: f.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(f.v / 59.2) * 100}%` }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
            >
              {f.dentro && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-extrabold text-white">
                  {pct(f.v)}
                </span>
              )}
            </m.div>
            {!f.dentro && <span className="ml-2 shrink-0 text-sm font-extrabold">{pct(f.v)}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- Vista infografía (réplica interactiva del original) ----------

function VistaInfografia() {
  return (
    <m.div {...fadeUp()} className="mx-auto max-w-container px-4 pb-16 md:px-6">
      <DownloadableViz nombre="personas-mayores-infografia">
        <div className="overflow-hidden rounded border shadow-card" style={{ borderColor: C.rule, background: C.bg }}>

          {/* Cabecera: título gris + tira de logos institucionales */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-6 md:px-8 md:pt-8">
            <h2
              className="max-w-[22ch] text-xl font-extrabold uppercase leading-tight tracking-wide md:text-2xl"
              style={{ color: C.inkMid }}
            >
              Calidad de vida de personas adultas mayores
            </h2>
            <img
              src="/logos/logo-bar-observatorio-transparente.png"
              alt="Cruz Roja Argentina · Observatorio Humanitario · IFRC · RC3"
              className="h-11 w-auto md:h-14"
              data-no-capture
            />
          </div>

          {/* 1 · Índice de bienestar (franja gris) */}
          <div className="mx-5 mt-6 rounded p-5 md:mx-8 md:p-6" style={{ background: C.bgAlt }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              <div className="flex items-center gap-3 lg:mt-6">
                <NumBadge n={1} />
                <p className="border-2 px-3 py-2 text-sm font-extrabold uppercase leading-snug" style={{ borderColor: C.ink }}>
                  Índice de bienestar<br />de adultos/as mayores
                </p>
                <MoveRight className="hidden h-5 w-5 shrink-0 lg:block" style={{ color: C.ink }} />
              </div>
              <GaugeInfografia />
            </div>
          </div>

          {/* Cuerpo: 2/3 a la izquierda, centro ilustrativo, 4/5 a la derecha */}
          <div className="grid gap-10 px-5 py-8 md:px-8 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 space-y-10 lg:col-span-4">
              <div>
                <PanelTitle n={2}>Suficiencia del principal ingreso para cubrir gastos y necesidades del mes</PanelTitle>
                <div className="mt-3 h-72">
                  <InViewChart>
                    <Bar data={INGRESOS_APILADO} options={stackOpts} plugins={[stackLabels]} />
                  </InViewChart>
                </div>
              </div>
              <div>
                <PanelTitle n={3} sub="en los últimos 6 meses">Evolución de su situación económica</PanelTitle>
                <div className="mt-3 h-44">
                  <InViewChart>
                    <Bar data={EVOLUCION_INFO} options={evoOpts} plugins={[barEndLabels]} />
                  </InViewChart>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[90px] flex-col items-center justify-end lg:col-span-3">
              <Burbujas />
              <BadgeEncuestas />
            </div>

            <div className="min-w-0 space-y-10 lg:col-span-5">
              <div>
                <PanelTitle n={4}>Cobertura médica</PanelTitle>
                <div className="mt-5">
                  <CoberturaBar />
                </div>
              </div>
              <div>
                <PanelTitle n={5}>Acceso a medicamentos con indicación médica</PanelTitle>
                <div className="mt-4">
                  <FilasMedicamentos />
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="px-5 pb-8 md:px-8">
            <div className="flex items-center gap-5">
              <span className="h-px flex-1" style={{ background: C.divider }} />
              <h3 className="text-lg font-extrabold uppercase tracking-wide md:text-xl">Recomendaciones</h3>
              <span className="h-px flex-1" style={{ background: C.divider }} />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
              {RECOMENDACIONES.map(([n, texto]) => (
                <div key={n} className="flex gap-3">
                  <span className="text-3xl font-extrabold leading-none" style={{ color: C.red }}>{n}</span>
                  <p className="text-sm leading-relaxed" style={{ color: C.inkMid }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pie de la lámina */}
          <div className="border-t px-5 py-4 md:px-8" style={{ borderColor: C.rule }}>
            <div className="flex items-center gap-4">
              <span className="h-px flex-1" style={{ background: C.divider }} />
              <a
                href="https://www.cruzroja.org.ar/observatorio-humanitario"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold tracking-wide transition-colors hover:text-cruz-redOh"
                style={{ color: C.inkMid }}
              >
                www.cruzroja.org.ar/observatorio-humanitario
              </a>
              <span className="h-px flex-1" style={{ background: C.divider }} />
            </div>
            <p className="mt-2 text-center text-[10px]" style={{ color: C.inkMid }}>
              Fuente: {FUENTE} · 1164 encuestas en 23 provincias y CABA
            </p>
          </div>
        </div>
      </DownloadableViz>
    </m.div>
  )
}

// ---------- Vista informe (lectura editorial larga, v1) ----------

function VistaInforme() {
  return (
    <div>
      {/* Franja de stats del hero (§10.1) */}
      <div className="mx-auto max-w-container px-4 md:px-6">
        <m.div {...fadeUp()} className="mb-2 flex flex-wrap gap-y-4 border-y py-5" style={{ borderColor: C.rule }}>
          {[
            ['1.164', 'encuestas realizadas'],
            ['23 + CABA', 'provincias relevadas'],
            ['4,9', 'índice de bienestar 2024 (sobre 10)'],
            ['50%', 'no cubre sus gastos del mes'],
          ].map(([v, l], i) => (
            <div key={l} className={`px-6 ${i > 0 ? 'divider-v' : ''}`}>
              <p className="text-2xl font-extrabold" style={{ color: C.red }}>{v}</p>
              <p className="text-xs" style={{ color: C.inkMid }}>{l}</p>
            </div>
          ))}
        </m.div>
      </div>

      {/* 1 - Índice de bienestar */}
      <section className="mt-10 border-y" style={{ background: C.bgAlt, borderColor: C.rule }}>
        <div className="mx-auto max-w-container px-4 py-12 md:px-6 md:py-16">
          <m.div {...fadeUp()}>
            <SH n={1}>Índice de bienestar</SH>
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                <DownloadableViz nombre="personas-mayores-indice-bienestar">
                  <div className="rounded border bg-white p-5 md:p-8" style={{ borderColor: C.rule }}>
                    <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-extrabold">Índice de bienestar de adultos/as mayores</h3>
                      <p className="text-xs" style={{ color: C.inkMid }}>
                        Escala de 1 (bajo bienestar) a 10 (alto bienestar)
                      </p>
                    </div>
                    <GaugeBienestar />
                    <p className="text-xs" style={{ color: C.inkMid }}>Fuente: {FUENTE}</p>
                  </div>
                </DownloadableViz>
              </div>
              <div className="space-y-6 self-center lg:col-span-4">
                <MC
                  value="4,9"
                  label="puntos promedio de bienestar en 2024. En 2022 el índice era de 5,7: la percepción cayó por debajo del punto medio de la escala."
                  accent
                />
                <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
                  El índice resume en un solo número cómo evalúan su bienestar las
                  personas adultas mayores. La caída de 0,8 puntos en dos años marca
                  el tono del resto del estudio: ingresos que no alcanzan, economía
                  que empeora y acceso parcial a los medicamentos.
                </p>
              </div>
            </div>
          </m.div>
        </div>
      </section>

      {/* 2 - Suficiencia del ingreso */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={2}>El ingreso ya no alcanza</SH>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <DownloadableViz nombre="personas-mayores-suficiencia-ingreso">
              <ChartCard
                titulo="Suficiencia del principal ingreso para cubrir gastos y necesidades del mes"
                fuente={FUENTE}
                nota="No se grafica «No responde»: 4% (2021) · 7% (2022) · 3% (2024)."
                alto="h-72"
              >
                <InViewChart>
                  <Line data={INGRESOS} options={lineOpts} plugins={[endpointLabels]} />
                </InViewChart>
              </ChartCard>
            </DownloadableViz>
          </div>
          <div className="space-y-6 self-center lg:col-span-5">
            <div className="grid grid-cols-2 gap-6">
              <MC value="50%" label="declara que su ingreso principal NO le alcanza para cubrir el mes (2024)." accent />
              <MC value="47%" label="logra cubrir sus gastos y necesidades con el ingreso principal." />
            </div>
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              Las líneas se cruzaron: quienes no llegan a cubrir el mes pasaron del 37%
              al 50% desde 2022, y por primera vez superan a quienes sí pueden hacerlo.
            </p>
          </div>
        </div>
      </m.section>

      {/* 3 - Evolución de la situación económica */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={3}>La economía de los últimos 6 meses</SH>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="order-2 space-y-6 self-center lg:order-1 lg:col-span-5">
            <MC
              value="4 de cada 10"
              label="sienten que su situación económica empeoró mucho o bastante en los últimos seis meses (39,9%)."
              accent
            />
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              La percepción de mejora es minoritaria: solo el 14,5% siente que su
              economía mejoró, mientras que el 43,3% se mantuvo igual y casi 4 de
              cada 10 la vieron empeorar.
            </p>
          </div>
          <div className="order-1 min-w-0 lg:order-2 lg:col-span-7">
            <DownloadableViz nombre="personas-mayores-situacion-economica">
              <ChartCard titulo="Evolución de su situación económica en los últimos 6 meses" fuente={FUENTE}>
                <InViewChart>
                  <Bar data={EVOLUCION} options={mkBarOpts(50)} />
                </InViewChart>
              </ChartCard>
            </DownloadableViz>
          </div>
        </div>
      </m.section>

      {/* 4 - Cobertura médica */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={4}>Cobertura médica</SH>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            <DownloadableViz nombre="personas-mayores-cobertura-medica">
              <ChartCard titulo="Cobertura médica de las personas adultas mayores" fuente={FUENTE} alto="h-72">
                <InViewChart>
                  <Doughnut data={COBERTURA} options={donutOpts} />
                </InViewChart>
              </ChartCard>
            </DownloadableViz>
          </div>
          <div className="space-y-6 self-center lg:col-span-7">
            <MC value="71,6%" label="se atiende a través de una obra social o de PAMI." accent />
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              La cobertura de salud descansa casi por completo en el sistema solidario:
              7 de cada 10 personas mayores dependen de una obra social o de PAMI, el
              13,6% se atiende en hospitales y centros de salud públicos, y solo el
              12,9% accede a una prepaga.
            </p>
          </div>
        </div>
      </m.section>

      {/* 5 - Acceso a medicamentos */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={5}>Acceso a medicamentos</SH>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <DownloadableViz nombre="personas-mayores-medicamentos">
              <ChartCard
                titulo="Acceso a medicamentos con indicación médica"
                fuente={FUENTE}
                alto="h-80"
              >
                <InViewChart>
                  <Bar data={MEDICAMENTOS} options={mkBarOpts(70)} />
                </InViewChart>
              </ChartCard>
            </DownloadableViz>
          </div>
          <div className="space-y-6 self-center lg:col-span-5">
            <MC
              value="2 de cada 10"
              label="acceden a sus medicamentos con cobertura total: 16,1% por PAMI u obra social y 3,7% por prepaga."
              accent
            />
            <blockquote className="border-l-[3px] p-5" style={{ borderColor: C.redOh, background: C.bgAlt }}>
              <p className="font-bold">El 74,2% paga al menos una parte</p>
              <p className="mt-1 text-sm" style={{ color: C.inkMid }}>
                de los medicamentos que le indicaron: 59,2% accede con descuento de
                PAMI u obra social, 8,8% con descuento de prepaga y 6,2% los paga
                por su cuenta.
              </p>
            </blockquote>
          </div>
        </div>
      </m.section>

      {/* 6 - Recomendaciones */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={6}>Recomendaciones</SH>
        <div className="grid gap-6 md:grid-cols-3">
          {RECOMENDACIONES.map(([n, texto]) => (
            <div
              key={n}
              className="rounded border bg-white p-5 transition-shadow hover:shadow-card"
              style={{ borderColor: C.rule }}
            >
              <p className="text-2xl font-extrabold" style={{ color: C.redOh }}>{n}</p>
              <p className="mt-2 text-sm" style={{ color: C.inkMid }}>{texto}</p>
            </div>
          ))}
        </div>
      </m.section>

      {/* Cierre "El argumento" (§10.1) */}
      <m.section {...fadeUp()} className="mt-8 border-t-[3px]" style={{ borderColor: C.red, background: C.bgAlt }}>
        <div className="mx-auto max-w-container px-4 py-16 md:px-6">
          <SectionLabel>El argumento</SectionLabel>
          <p className="mt-4 max-w-[72ch] text-xl font-bold leading-relaxed">
            La calidad de vida de las personas adultas mayores se deterioró en todos
            los frentes que mide el estudio: el índice de bienestar cayó a{' '}
            <span style={{ color: C.red }}>4,9 puntos</span> (0,8 menos que en 2022),
            el <span style={{ color: C.red }}>50%</span> ya no cubre los gastos del mes
            con su ingreso principal, <span style={{ color: C.red }}>4 de cada 10</span>{' '}
            sienten que su economía empeoró y solo{' '}
            <span style={{ color: C.red }}>2 de cada 10</span> acceden a sus medicamentos
            con cobertura total. Sostener su bienestar exige fortalecer el sistema
            previsional, garantizar el acceso a la salud y dar protagonismo a las
            propias personas mayores — con las organizaciones humanitarias acompañando.
          </p>
          <div className="mt-10 border-t pt-6" style={{ borderColor: C.divider }}>
            <p className="text-sm font-bold">Metodología</p>
            <p className="mt-2 max-w-[72ch] text-sm" style={{ color: C.inkMid }}>
              1.164 encuestas a personas adultas mayores en las 23 provincias y la
              Ciudad Autónoma de Buenos Aires, Argentina. Publicado en diciembre de 2024.
            </p>
            <p className="mt-3 text-xs" style={{ color: C.inkMid }}>Fuente: {FUENTE}</p>
          </div>
          <div className="mt-8">
            <BotonInforme />
          </div>
        </div>
      </m.section>
    </div>
  )
}

// ---------- Página ----------

export default function EstudioPersonasMayores() {
  const [vista, setVista] = useState('infografia')

  return (
    <article>
      {/* Hero claro (§10.1), compartido por ambas vistas */}
      <m.header
        variants={heroStagger}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-container px-4 pb-10 pt-16 md:px-6"
      >
        <m.div variants={heroItem}>
          <SectionLabel>Personas mayores · En Argentina · Diciembre 2024</SectionLabel>
        </m.div>
        <m.h1 variants={heroItem} className="mt-4 max-w-[24ch] text-3xl font-extrabold md:text-5xl">
          Calidad de vida de personas adultas mayores en Argentina
        </m.h1>
        <m.p variants={heroItem} className="mt-5 max-w-[72ch] text-lg" style={{ color: C.inkMid }}>
          Índice de bienestar, suficiencia de ingresos, situación económica, cobertura
          médica y acceso a medicamentos: una radiografía de cómo viven las personas
          adultas mayores en el país.
        </m.p>
        <m.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
          <BotonInforme />
          <button
            onClick={() => setVista(v => (v === 'infografia' ? 'informe' : 'infografia'))}
            className="inline-flex items-center gap-2 rounded border px-6 py-3 font-medium transition-colors hover:border-cruz-redOh hover:text-cruz-redOh"
            style={{ borderColor: C.divider, color: C.ink }}
          >
            <ArrowLeftRight className="h-4 w-4" />
            {vista === 'infografia' ? 'Ver versión informe' : 'Ver versión infografía'}
          </button>
        </m.div>
      </m.header>

      <AnimatePresence mode="wait" initial={false}>
        {vista === 'infografia' ? (
          <m.div
            key="infografia"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <VistaInfografia />
          </m.div>
        ) : (
          <m.div
            key="informe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <VistaInforme />
          </m.div>
        )}
      </AnimatePresence>
    </article>
  )
}
