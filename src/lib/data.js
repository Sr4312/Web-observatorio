import { supabase } from './supabase'

// Seed local: los 22 estudios del sitio vigente (categoría 72 "Español",
// via WP REST API). Títulos, fechas, portadas y URLs reales.
// Temas propuestos (TODO §15: validar temas definitivos).
const UP = 'https://cruzroja.org.ar/observatorio-humanitario/wp-content/uploads'
const SEED = [
  {
    titulo: 'Apuestas Online y Adolescencia: construyendo entornos seguros',
    bajada: 'El 59% de las y los adolescentes no logra diferenciar plataformas de apuestas legales e ilegales. Encuesta a 11.421 adolescentes de 13 a 18 años en 231 escuelas de 16 provincias del país.',
    tema: 'Adolescencias y entornos digitales',
    fecha: 'Mayo 2026',
    fecha_orden: '2026-05-11',
    url: '/estudios/apuestas-online-adolescencia',
    imagen: '/images/portada-apuestas-online.png',
    slug: 'apuestas-online-adolescencia',
    destacado: true,
  },
  { titulo: 'Acceso al agua y condiciones de vida de las comunidades Wichi', tema: 'Agua y comunidades', fecha: 'Mayo 2025', fecha_orden: '2025-05-08', url: `${UP}/2025/05/INFORME-SALTA-2025-OHCRA-2.pdf`, imagen: `${UP}/2025/05/INFORME-SALTA-2025-OHCRA-1_page-0001-scaled.jpg` },
  {
    titulo: 'Calidad de vida de personas adultas mayores en Argentina',
    bajada: 'El índice de bienestar cayó de 5,7 a 4,9 puntos y, por primera vez, la mitad de las personas mayores declara que su ingreso no alcanza para cubrir el mes. 1.164 encuestas en 23 provincias y CABA.',
    tema: 'Personas mayores',
    fecha: 'Diciembre 2024',
    fecha_orden: '2024-12-12',
    url: '/estudios/calidad-vida-personas-mayores-2024',
    imagen: `${UP}/2024/12/INFORME-CALIDAD-VIDA-PERSONAS-ADULTAS-MAYORES-2-1_page-0001-scaled.jpg`,
    slug: 'calidad-vida-personas-mayores-2024',
  },
  { titulo: 'Investigación sobre cambio climático en Argentina', tema: 'Cambio climático', fecha: 'Septiembre 2024', fecha_orden: '2024-09-23', url: `${UP}/2024/09/INFORME-CAMBIO-CLIMATICO-2024.pdf`, imagen: `${UP}/2024/09/portada-cambio-climatico_page-0001-scaled.jpg` },
  { titulo: 'Investigación sobre percepciones y experiencias de mujeres en tratamiento por consumo problemático en Argentina', tema: 'Salud mental y consumos', fecha: 'Septiembre 2024', fecha_orden: '2024-09-19', url: `${UP}/2024/09/INFORME-CONSUMO-PROBLEMATICO-EN-MUJERES.pdf`, imagen: `${UP}/2024/09/PORTADA-INFORME-CONSUMO-PROBLEMATICO-EN-MUJERES_page-0001.jpg` },
  { titulo: 'Investigación sobre donación de órganos y tejidos en Argentina', tema: 'Donación de órganos', fecha: 'Noviembre 2023', fecha_orden: '2023-11-09', url: `${UP}/2023/11/Investigacion-sobre-donacion-de-organos-y-tejidos-informe-.pdf`, imagen: `${UP}/2023/11/PLACA-1-e1699533278288.jpg` },
  { titulo: 'Investigación global - «Aprendizajes adquiridos por sectores estratégicos a partir de la pandemia»', tema: 'Salud global', alcance: 'Global', fecha: 'Octubre 2023', fecha_orden: '2023-10-19', url: 'https://cruzroja.org.ar/observatorio-humanitario/aprendizajes-covid/', imagen: `${UP}/2023/10/Investigacion-Global-scaled.jpg` },
  { titulo: 'Investigación sobre barreras de acceso a servicios de salud mental en Argentina', tema: 'Salud mental', fecha: 'Abril 2023', fecha_orden: '2023-04-12', url: `${UP}/2023/04/Barreras-en-el-acceso-a-servicios-de-salud-mental-Observatorio-Humanitario.pdf`, imagen: `${UP}/2023/04/Foto-portada-Informe-Barrera-scaled.jpg` },
  { titulo: 'Investigación sobre el impacto de la pandemia en las relaciones familiares y la salud mental en el hogar', tema: 'Salud mental', fecha: 'Diciembre 2022', fecha_orden: '2022-12-22', url: `${UP}/2022/12/Impacto-Pandemia-Relaciones-Familiales-Salud-Mental.pdf`, imagen: `${UP}/2022/12/pexels-elina-fairytale-3893532-scaled.jpg` },
  { titulo: 'Investigación sobre Medios de Vida en Argentina', tema: 'Medios de vida', fecha: 'Agosto 2022', fecha_orden: '2022-08-01', url: `${UP}/2022/08/Informe-Medios-de-Vida-2022-Observatorio-Humanitario.pdf`, imagen: `${UP}/2022/08/pexels-andrea-piacquadio-3811855-scaled.jpg` },
  { titulo: 'Investigación sobre Calidad de Vida en Argentina', tema: 'Calidad de vida', fecha: 'Julio 2022', fecha_orden: '2022-07-18', url: `${UP}/2022/07/Estudio-Calidad-de-Vida-en-Argentina-2022-Observatorio-Humanitario-de-Cruz-Roja-Argentina.pdf`, imagen: `${UP}/2022/08/MG_0512-1-scaled.jpg` },
  { titulo: 'Investigación sobre Personas Adultas Mayores en Argentina', tema: 'Personas mayores', fecha: 'Mayo 2022', fecha_orden: '2022-05-02', url: `${UP}/2022/05/INVESTIGACION-ADULTOS-MAYORES-ARGENTINA-2022-vr.pdf`, imagen: `${UP}/2022/05/1559-scaled.jpg` },
  { titulo: 'Juventud en Contexto de Pandemia', tema: 'Niñez y juventud', fecha: 'Febrero 2022', fecha_orden: '2022-02-11', url: `${UP}/2022/02/INFORME-JUVENTUD-2022-3.pdf`, imagen: `${UP}/2021/11/disruptivo-Fx276Za-kUk-unsplash-scaled-e1644596795718.jpg` },
  { titulo: 'Investigación sobre Personal de Salud en Argentina', tema: 'Salud', fecha: 'Diciembre 2021', fecha_orden: '2021-12-21', url: `${UP}/2021/12/INFORME-PERSONAL-DE-SALUD.pdf`, imagen: `${UP}/2021/12/front-view-woman-wearing-protective-wear-hospital-scaled-e1640015633970.jpg` },
  { titulo: 'Estudio de campo en Salta', tema: 'Agua y comunidades', alcance: 'Salta', fecha: 'Noviembre 2021', fecha_orden: '2021-11-29', url: `${UP}/2021/11/Estudio-de-campo_SALTA_MARZO_2021-1.pdf`, imagen: `${UP}/2021/11/CAPTURA-SLATA.png` },
  { titulo: 'Investigación sobre Calidad de Vida en Argentina', tema: 'Calidad de vida', fecha: 'Noviembre 2021', fecha_orden: '2021-11-20', url: `${UP}/2021/11/INFORME-CALIDAD-DE-VIDA-FINAL-PR-1-1.pdf`, imagen: `${UP}/2021/11/MG_0341-scaled-e1637763889268.jpg` },
  { titulo: 'Los Adultos Mayores en Argentina', tema: 'Personas mayores', fecha: 'Septiembre 2021', fecha_orden: '2021-09-16', url: `${UP}/2021/09/INVESTIGACION-ADULTOS-MAYORES-ARGENTINA-2.pdf`, imagen: `${UP}/2021/09/adultos-mayores-investigacion-cruz-roja-argentina.jpg` },
  { titulo: 'Investigación sobre Adolescencia en contexto de pandemia en Argentina', tema: 'Niñez y juventud', fecha: 'Julio 2021', fecha_orden: '2021-07-14', url: `${UP}/2021/07/INFORME-ADOLESCENTES-final.pdf`, imagen: `${UP}/2021/07/Adolescentes.jpg` },
  { titulo: 'Investigación sobre la niñez en Argentina', tema: 'Niñez y juventud', fecha: 'Junio 2021', fecha_orden: '2021-06-11', url: `${UP}/2021/06/INVESTIGACION_SOBRE_NINEZ_EN_ARGENTINA.pdf`, imagen: `${UP}/2021/06/Ninez.jpg` },
  { titulo: 'Estudio de acceso al agua en Salta', tema: 'Agua y comunidades', alcance: 'Salta', fecha: 'Octubre 2020', fecha_orden: '2020-10-05', url: `${UP}/2020/09/observatorio-humanitario-estudio-campo-salta-2020.pdf`, imagen: `${UP}/2020/09/observatorio-humanitario-estudio-acceso-agua-salta.jpg` },
  { titulo: 'Impacto de la pandemia sobre la población migrante argentina', tema: 'Personas migrantes', fecha: 'Octubre 2020', fecha_orden: '2020-10-05', url: `${UP}/2020/09/observatorio-humanitario-estudio-poblacion-migrante.pdf`, imagen: `${UP}/2020/09/observatorio-humanitario-estudio-impacto-poblacion-migrante.jpg` },
  { titulo: 'Estudio de percepción COVID-19', tema: 'Salud', fecha: 'Octubre 2020', fecha_orden: '2020-10-05', url: `${UP}/2020/09/observatorio-humanitario-estudio-percepcion-covid-19.pdf`, imagen: `${UP}/2020/09/observatorio-humanitario-estudio-percepcion-covid-19.jpg` },
].map((e, i) => ({
  id: i + 1,
  bajada: null,
  alcance: 'En Argentina',
  destacado: false,
  insights: null,
  ...e,
}))

// Estudios de Monitoreo Digital (categoría 13 del sitio vigente, via WP REST API).
// url e imagen apuntan al sitio actual (interim, igual que los estudios sin migrar).
const WP = 'https://cruzroja.org.ar/observatorio-humanitario/wp-content/uploads'
export const MONITOREOS = [
  { titulo: 'Informe de monitoreo digital sobre Salud Mental en Argentina - Primera quincena de Mayo', fecha: 'Junio 2023', fecha_orden: '2023-06-13', url: `${WP}/2023/06/Informe-de-Monitoreo-Digital-Salud-Mental-Mayo15.pdf`, imagen: `${WP}/2023/05/smaps-1-2.png` },
  { titulo: 'Informe de monitoreo digital «Salud Mental en Argentina»', fecha: 'Mayo 2023', fecha_orden: '2023-05-16', url: `${WP}/2023/05/Informe-de-Monitoreo-Digital-Salud-Mental-Abr-1.pdf`, imagen: `${WP}/2023/05/smaps-1-2.png` },
  { titulo: 'Personal de Salud en Argentina', fecha: 'Diciembre 2021', fecha_orden: '2021-12-30', url: `${WP}/2021/12/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-PERSONAL-DE-LA-SALUD-29-11-21.pptx`, imagen: `${WP}/2021/12/personal-de-salud-qsocial.png` },
  { titulo: 'Género', fecha: 'Noviembre 2021', fecha_orden: '2021-11-29', url: `${WP}/2021/11/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-GENERO-15-11.pdf`, imagen: `${WP}/2021/11/Genero--e1638200949100.png` },
  { titulo: 'Trabajo', fecha: 'Noviembre 2021', fecha_orden: '2021-11-29', url: `${WP}/2021/11/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-TRABAJO-08-11-1.pdf`, imagen: `${WP}/2021/11/Trabajo-e1638200976149.png` },
  { titulo: 'Vacunas', fecha: 'Noviembre 2021', fecha_orden: '2021-11-20', url: `${WP}/2021/11/QSN-MITOS-SOBRE-VACUNAS-09-11-21.pdf`, imagen: `${WP}/2021/11/Vacunas-QS-1.png` },
  { titulo: 'Cambio Climático', fecha: 'Noviembre 2021', fecha_orden: '2021-11-20', url: `${WP}/2021/11/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-CAMBIO-CLIMATICO-18-10-1.pdf`, imagen: `${WP}/2021/11/Portada-cambio-climatico-24-agosto-al-18-de-octubre-de-2021-1.png` },
  { titulo: 'Adultos Mayores', fecha: 'Noviembre 2021', fecha_orden: '2021-11-20', url: `${WP}/2021/11/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-ADULTOS-MAYORES-07-10-11-1.pdf`, imagen: `${WP}/2021/11/Portada-Adultos-mayores-del-02-de-agosto-al-04-de-octubre-de-2021-1.png` },
  { titulo: 'Cambio Climático', fecha: 'Agosto 2021', fecha_orden: '2021-08-30', url: `${WP}/2021/08/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-CAMBIO-CLIMATICO-23-08.pdf`, imagen: `${WP}/2021/08/CC308.jpg` },
  { titulo: 'Terremoto Haití', fecha: 'Agosto 2021', fecha_orden: '2021-08-30', url: encodeURI(`${WP}/2021/08/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-TERREMOTO-EN-HAITÍ-20-08-2021.pdf`), imagen: `${WP}/2021/08/HAITI.jpg` },
  { titulo: 'Niñez y Juventud', fecha: 'Agosto 2021', fecha_orden: '2021-08-18', url: encodeURI(`${WP}/2021/08/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-NIÑEZ-Y-JUVENTUD-15-08-2021.pdf`), imagen: `${WP}/2021/08/Ninez_y_Juventud.jpg` },
  { titulo: 'Trabajo', fecha: 'Julio 2021', fecha_orden: '2021-07-27', url: `${WP}/2021/07/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-TRABAJO-24-07-2021.pdf`, imagen: `${WP}/2021/07/Trabajo..jpg` },
  { titulo: 'Sensibilidad Social', fecha: 'Julio 2021', fecha_orden: '2021-07-22', url: `${WP}/2021/07/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-SENSIBILIDAD-SOCIAL-15-07.pdf`, imagen: `${WP}/2021/07/Sensibilidad-Social.jpg` },
  { titulo: 'Educación', fecha: 'Julio 2021', fecha_orden: '2021-07-22', url: encodeURI(`${WP}/2021/07/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-EDUCACIÓN-12-07-2021.pdf`), imagen: `${WP}/2021/07/Educacion.jpg` },
  { titulo: 'Adultos Mayores', fecha: 'Junio 2021', fecha_orden: '2021-06-22', url: `${WP}/2021/06/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-ADULTOS-MAYORES.pdf`, imagen: `${WP}/2021/06/ADULTOS-MAYORES.jpg` },
  { titulo: 'Informe sobre género', fecha: 'Junio 2021', fecha_orden: '2021-06-14', url: encodeURI(`${WP}/2021/06/CRUZ-ROJA-OBSERVATORIO-HUMANITARIO-GÉNERO.pdf`), imagen: `${WP}/2021/06/Genero.jpg` },
].map((m, i) => ({ id: `m${i + 1}`, alcance: null, tema: null, bajada: null, ...m }))

export async function getEstudios() {
  if (supabase) {
    const { data, error } = await supabase
      .from('estudios')
      .select('*')
      .order('fecha_orden', { ascending: false })
    if (!error && data?.length) return data
  }
  return SEED
}

export async function searchEstudios(q) {
  if (supabase) {
    const { data, error } = await supabase
      .from('estudios')
      .select('*')
      .or(`titulo.ilike.%${q}%,bajada.ilike.%${q}%,tema.ilike.%${q}%`)
      .order('fecha_orden', { ascending: false })
    if (!error) return data ?? []
  }
  const s = q.toLowerCase()
  return SEED.filter(e =>
    [e.titulo, e.bajada, e.tema].some(v => v && v.toLowerCase().includes(s))
  )
}
