import { useRef } from 'react'
import { m } from 'framer-motion'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend,
} from 'chart.js'
import html2canvas from 'html2canvas'
import { Download } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend)

// ============================================================
// ESTUDIO DE REFERENCIA (§10): autocontenido. Para un estudio
// nuevo, copiar este archivo y adaptar datos, textos y gráficos.
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

const FUENTE = 'Observatorio Humanitario CRA - Apuestas Online y Adolescencia (2025)'

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

function DownloadableViz({ children, nombre }) {
  const ref = useRef(null)

  const descargar = async () => {
    const canvas = await html2canvas(ref.current, { backgroundColor: '#FFFFFF', scale: 2 })
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

function ChartCard({ titulo, fuente, children }) {
  return (
    <div className="rounded border p-6" style={{ borderColor: C.rule }}>
      <h3 className="font-extrabold">{titulo}</h3>
      <div className="mt-4 h-64">{children}</div>
      <p className="mt-4 text-xs" style={{ color: C.inkMid }}>Fuente: {fuente}</p>
    </div>
  )
}

// ---------- Config de gráficos (§10.3) ----------

const barOpts = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { max: 100, ticks: { font: { size: 12 }, callback: v => v + '%' }, grid: { color: C.rule } },
    y: { ticks: { font: { size: 12 } }, grid: { display: false } },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.ink, cornerRadius: 8, padding: 12,
      callbacks: { label: ctx => ` ${ctx.parsed.x}%` },
    },
  },
}

const donutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '58%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 12 } },
    tooltip: {
      backgroundColor: C.ink, cornerRadius: 8, padding: 12,
      callbacks: { label: ctx => ` ${ctx.parsed}%` },
    },
  },
}

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { ticks: { font: { size: 12 } }, grid: { display: false } },
    y: { min: 0, max: 30, ticks: { font: { size: 12 }, callback: v => v + '%' }, grid: { color: C.rule } },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.ink, cornerRadius: 8, padding: 12,
      callbacks: { label: ctx => ` ${ctx.parsed.y}%` },
    },
  },
}

const barras = (labels, values, color = G[1]) => ({
  labels,
  datasets: [{ data: values, backgroundColor: color, borderRadius: 4, barThickness: 28 }],
})

// ---------- Datos del estudio (infografía oficial 2025) ----------

const RECOMENDACIONES = [
  ['A', 'Fortalecer la seguridad y transparencia de las plataformas de las billeteras virtuales, priorizando la protección de adolescentes.'],
  ['B', 'Implementar el bloqueo de dominios y URL de apuestas ilegales con restricción etaria.'],
  ['C', 'Regular la publicidad y promover la responsabilidad de empresas e influencers.'],
  ['D', 'Desarrollar campañas de prevención digital co-creadas con adolescentes, con lenguaje cotidiano y formatos atractivos.'],
  ['E', 'Reforzar el rol de las organizaciones sociales en talleres y espacios de confianza sobre apuestas online.'],
  ['F', 'Fortalecer entornos protectores: integrar alfabetización digital crítica en escuelas, promover el diálogo en el hogar y apoyar a referentes comunitarios.'],
]

const PROVINCIAS = 'Buenos Aires, Ciudad Autónoma de Buenos Aires, Córdoba, Santa Fe, Mendoza, San Juan, San Luis, Formosa, Entre Ríos, Corrientes, Salta, Santiago del Estero, Jujuy, La Rioja, Chubut y Tierra del Fuego'

// ---------- Página ----------

export default function EstudioApuestasOnline() {
  return (
    <article>
      {/* Hero claro (§10.1) */}
      <header className="mx-auto max-w-container px-4 pb-14 pt-16 md:px-6">
        <SectionLabel>Adolescencias y entornos digitales · En Argentina · 2025</SectionLabel>
        <h1 className="mt-4 max-w-[24ch] text-3xl font-extrabold md:text-5xl">
          Apuestas Online y Adolescencia: construyendo entornos seguros
        </h1>
        <p className="mt-5 max-w-[72ch] text-lg" style={{ color: C.inkMid }}>
          Cómo se vinculan las y los adolescentes escolarizados de 13 a 18 años con las
          apuestas online: exposición, medios de acceso, efectos en la salud mental y
          demandas de intervención.
        </p>
        <a
          href="https://cruzroja.org.ar/observatorio-humanitario/wp-content/uploads/2026/05/INFORME-APUESTAS-ONLINE-Y-ADOLESCENCIA-CORREGIDO.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded bg-cruz-red px-6 py-3 font-medium text-white transition-colors hover:bg-cruz-redHover"
        >
          <Download className="h-4 w-4" /> Descargar el informe completo
        </a>
        <div className="mt-10 flex flex-wrap gap-y-4 border-y py-5" style={{ borderColor: C.rule }}>
          {[
            ['11.421', 'encuestas realizadas'],
            ['231', 'escuelas participantes'],
            ['16', 'provincias del país'],
            ['13-18', 'años, población escolarizada'],
          ].map(([v, l], i) => (
            <div key={l} className={`px-6 ${i > 0 ? 'divider-v' : ''}`}>
              <p className="text-2xl font-extrabold" style={{ color: C.red }}>{v}</p>
              <p className="text-xs" style={{ color: C.inkMid }}>{l}</p>
            </div>
          ))}
        </div>
      </header>

      {/* 1 - Niveles de exposición */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={1}>¿Qué tan presentes están las apuestas online?</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-exposicion">
            <ChartCard titulo="Experiencia con las apuestas online" fuente={FUENTE}>
              <Doughnut
                data={{
                  labels: [
                    'Participa o participó alguna vez',
                    'Conoce gente cercana que participa',
                    'No participa ni conoce a nadie',
                    'Nunca escuchó hablar del tema',
                  ],
                  datasets: [{ data: [16, 45, 27, 12], backgroundColor: [G[1], G[0], G[4], G[3]], borderWidth: 2, borderColor: '#FFFFFF' }],
                }}
                options={donutOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div className="space-y-6 self-center">
            <MC value="6 de cada 10" label="adolescentes están expuestos al juego online, por participación directa (16%) o por vínculos cercanos que apuestan (45%)." accent />
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              La práctica circula socialmente mucho más allá de quienes apuestan: casi la
              mitad convive con amistades o familiares que lo hacen. Solo el 12% no escuchó
              hablar del tema.
            </p>
          </div>
        </div>
      </m.section>

      {/* 2 - Quiénes y cómo apuestan */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={2}>¿Quiénes y cómo apuestan?</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-edad">
            <ChartCard titulo="Participación directa según edad" fuente={FUENTE}>
              <Line
                data={{
                  labels: ['13 años', '14', '15', '16', '17', '18 años'],
                  datasets: [{
                    data: [6, 9, 18, 18, 23, 24],
                    borderColor: C.redOh,
                    backgroundColor: C.redOh,
                    pointRadius: 4,
                    tension: 0.35,
                  }],
                }}
                options={lineOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div className="space-y-6">
            <MC value="3 veces más" label="apuestan los varones que las mujeres: 24% frente a 8%, y con mayor frecuencia e intensidad de juego." accent />
            <div className="grid grid-cols-2 gap-6">
              <MC value="65%" label="probó alguna vez, pero no apuesta habitualmente." />
              <MC value="6%" label="apuesta o apostó todos los días." />
            </div>
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              Los casinos y loterías virtuales (ruleta, póker, tragamonedas) son el formato
              más elegido (56%), seguidos por quienes los combinan con apuestas deportivas
              (26%) y las apuestas exclusivamente deportivas (16%).
            </p>
          </div>
        </div>
      </m.section>

      {/* 3 - Motivaciones */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={3}>¿Por qué empiezan?</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-motivaciones">
            <ChartCard titulo="Motivaciones de quienes apuestan" fuente={FUENTE}>
              <Bar
                data={barras(
                  ['Quería probar suerte', 'Es divertido', 'Se gana plata fácil y rápido', 'Publicidad de influencers o famosos', 'Bonos, descuentos o créditos gratis', 'Competir con amistades'],
                  [89, 84, 53, 50, 44, 42],
                  G[3],
                )}
                options={barOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div className="space-y-6 self-center">
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              La puerta de entrada es lúdica: la curiosidad y la diversión encabezan las
              motivaciones. Pero detrás operan la promesa de plata fácil, las recomendaciones
              de influencers y los bonos de bienvenida con que las plataformas incentivan a
              empezar.
            </p>
            <blockquote className="border-l-[3px] p-5" style={{ borderColor: C.redOh, background: C.bgAlt }}>
              <p className="font-bold">1 de cada 8 quedó endeudado</p>
              <p className="mt-1 text-sm" style={{ color: C.inkMid }}>
                el 12% de quienes apuestan quedó debiendo plata por apostar online.
              </p>
            </blockquote>
          </div>
        </div>
      </m.section>

      {/* 4 - Plataformas legales e ilegales */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={4}>Plataformas de juegos legales e ilegales</SH>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <MC value="59%*" label="de las y los adolescentes no logran diferenciar plataformas de apuestas legales de aquellas que operan de forma ilegal." accent />
          <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
            La frontera entre el juego legal e ilegal es difusa para la mayoría: seis de cada
            diez adolescentes no pueden distinguir si la plataforma en la que apuestan (o que
            conocen) opera dentro o fuera de la regulación.
          </p>
        </div>
      </m.section>

      {/* 5 - Publicidad */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={5}>Publicidad o contenidos de apuestas online</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-publicidad">
            <ChartCard titulo="Exposición a publicidad entre quienes apuestan" fuente={FUENTE}>
              <Bar
                data={barras(
                  ['Redes sociales y medios', 'Influencers o famosos', 'Páginas web', 'Eventos deportivos', 'Videojuegos y streaming'],
                  [78, 76, 74, 73, 67],
                  G[0],
                )}
                options={barOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div className="space-y-6 self-center">
            <MC value="75%*" label="de las y los adolescentes vio publicidad o contenidos de apuestas online." accent />
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              La publicidad llega a todos los segmentos, apuesten o no: incluso entre quienes
              no participan ni conocen a nadie que lo haga, 7 de cada 10 vieron publicidad en
              redes sociales. La oferta llega antes que la práctica.
            </p>
          </div>
        </div>
      </m.section>

      {/* 6 - Riesgos y salud mental */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={6}>Riesgos percibidos y efectos en la salud mental</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-salud-mental">
            <ChartCard titulo="Efectos reportados por quienes apuestan" fuente={FUENTE}>
              <Bar
                data={barras(['Reconoce riesgo de adicción', 'Reporta ansiedad'], [79, 69])}
                options={barOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div className="space-y-6">
            <MC value="47-49%" label="afectación de hábitos de sueño y rendimiento escolar vinculados a la práctica." />
            <blockquote className="border-l-[3px] p-5" style={{ borderColor: C.redOh, background: C.bgAlt }}>
              <p className="font-bold">8 de cada 10 adolescentes</p>
              <p className="mt-1 text-sm" style={{ color: C.inkMid }}>
                consideran que las medidas actuales para impedir el acceso de menores no funcionan.
              </p>
            </blockquote>
          </div>
        </div>
      </m.section>

      {/* 7 - Medios de apuesta */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={7}>Medios de apuesta</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-medios">
            <ChartCard titulo="Cómo acceden quienes apuestan" fuente={FUENTE}>
              <Bar
                data={barras(['Utiliza billeteras virtuales', 'Accedió a través de intermediarios'], [83, 43], G[0])}
                options={barOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <div>
            <SectionLabel>Vínculo con las apuestas online</SectionLabel>
            <p className="mt-3 max-w-[72ch]" style={{ color: C.inkMid }}>
              El vínculo con las apuestas online empieza alrededor de los 13-14 años y crece
              de forma sostenida hasta los 17-18 años. Las billeteras virtuales son la
              principal vía de entrada, y cuatro de cada diez accedieron a través de
              intermediarios que les facilitaron el acceso a la práctica.
            </p>
          </div>
        </div>
      </m.section>

      {/* 8 - El silencio alrededor del tema */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={8}>El tema del que no se habla</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <MC value="8 de cada 10" label="hogares hablan poco o directamente nunca sobre apuestas online. En la escuela la proporción es casi idéntica." accent />
            <MC value="2 de cada 10" label="de quienes apuestan se preocupan por el tema: la cercanía con la práctica reduce la percepción del riesgo." />
          </div>
          <div className="space-y-6 self-center">
            <p className="max-w-[72ch]" style={{ color: C.inkMid }}>
              Mientras la publicidad les llega todos los días, los espacios de conversación
              son escasos: ni el hogar ni la escuela aparecen como lugares donde el tema se
              hable con frecuencia.
            </p>
            <blockquote className="border-l-[3px] p-5" style={{ borderColor: C.redOh, background: C.bgAlt }}>
              <p className="font-bold">Poder contarlo sin sentirse juzgados/as</p>
              <p className="mt-1 text-sm" style={{ color: C.inkMid }}>
                es la herramienta de ayuda más valorada: 67% de quienes están expuestos al
                fenómeno quisiera poder hablarlo con una persona adulta de confianza.
              </p>
            </blockquote>
          </div>
        </div>
      </m.section>

      {/* 9 - Demanda de intervención */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={9}>Existe una alta demanda de intervención</SH>
        <div className="grid gap-8 md:grid-cols-2">
          <DownloadableViz nombre="apuestas-online-demanda">
            <ChartCard titulo="Qué piden las y los adolescentes" fuente={FUENTE}>
              <Bar
                data={barras(['Pide controles más estrictos sobre plataformas*', 'Solicitan talleres y campañas educativas'], [75, 40])}
                options={barOpts}
              />
            </ChartCard>
          </DownloadableViz>
          <p className="max-w-[72ch] self-center" style={{ color: C.inkMid }}>
            La demanda no viene solo de personas adultas: son las y los propios adolescentes
            quienes piden controles más estrictos sobre las plataformas y espacios educativos
            para hablar del tema.
          </p>
        </div>
        <p className="mt-6 text-xs" style={{ color: C.inkMid }}>
          *Promedio (jóvenes que apuestan, no apuestan pero conocen, no apuestan ni conocen).
        </p>
      </m.section>

      {/* Recomendaciones */}
      <m.section {...fadeUp()} className="mx-auto max-w-container px-4 py-12 md:px-6">
        <SH n={10}>Recomendaciones</SH>
        <div className="grid gap-6 md:grid-cols-3">
          {RECOMENDACIONES.map(([letra, texto]) => (
            <div key={letra} className="rounded border p-5" style={{ borderColor: C.rule }}>
              <p className="text-2xl font-extrabold" style={{ color: C.redOh }}>{letra}</p>
              <p className="mt-2 text-sm" style={{ color: C.inkMid }}>{texto}</p>
            </div>
          ))}
        </div>
      </m.section>

      {/* Cierre "El argumento" (§10.1): bgAlt + borde superior rojo */}
      <m.section {...fadeUp()} className="mt-8 border-t-[3px]" style={{ borderColor: C.red, background: C.bgAlt }}>
        <div className="mx-auto max-w-container px-4 py-16 md:px-6">
          <SectionLabel>El argumento</SectionLabel>
          <p className="mt-4 max-w-[72ch] text-xl font-bold leading-relaxed">
            Las apuestas online llegaron a la adolescencia antes que las respuestas:{' '}
            <span style={{ color: C.red }}>6 de cada 10</span> adolescentes están expuestos
            al fenómeno, el <span style={{ color: C.red }}>59%</span> no distingue plataformas
            legales de ilegales, el <span style={{ color: C.red }}>83%</span> de quienes
            apuestan usa billeteras virtuales y <span style={{ color: C.red }}>8 de cada 10</span>{' '}
            creen que las medidas actuales no funcionan. Mientras tanto, en la mayoría de los
            hogares y escuelas el tema apenas se habla. Construir entornos seguros exige
            regulación, prevención digital y espacios de confianza - y las y los adolescentes
            ya los están pidiendo.
          </p>
          <div className="mt-10 border-t pt-6" style={{ borderColor: C.divider }}>
            <p className="text-sm font-bold">Metodología</p>
            <p className="mt-2 max-w-[72ch] text-sm" style={{ color: C.inkMid }}>
              11.421 encuestas a adolescentes escolarizados/as de 13 a 18 años en 231 escuelas
              de 16 provincias del país ({PROVINCIAS}). Trabajo de campo: agosto a octubre de 2025.
            </p>
            <p className="mt-3 text-xs" style={{ color: C.inkMid }}>Fuente: {FUENTE}</p>
          </div>
        </div>
      </m.section>
    </article>
  )
}
