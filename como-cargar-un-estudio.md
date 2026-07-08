# Cómo cargar un estudio nuevo

> Versión sin Supabase (fase actual). Los estudios se cargan a mano en `src/lib/data.js`.
> Cuando exista el proyecto Supabase del Observatorio, el Paso 3 pasa a ser un insert en la tabla `estudios` (ver §11 y §12 de `desarrollo-web-observatorio-humanitario.md`) y este archivo se actualiza.

## Paso A - Crear la página del estudio

Archivo autocontenido en `src/pages/Estudio[NombrePascalCase].jsx`: define su propia paleta, componentes y datos, no importa nada de otro estudio.

- **Si ya existe un estudio de referencia**: copiarlo y adaptar título, datos y gráficos.
- **Si es el primer estudio**: queda como referencia para los próximos. Estructura mínima:

```jsx
import { m } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import DownloadableViz from '../components/shared/DownloadableViz' // crear si no existe

const C = {
  bg: '#FFFFFF', bgAlt: '#F5F5F6', ink: '#231f20', inkMid: '#5e686f',
  rule: '#EFEFF1', divider: '#D9DCDE', red: '#E32219', redOh: '#e73743',
}
const G = ['#4886c6', '#f1635e', '#f58980', '#f6b07b', '#b8d491']

export default function EstudioNombre() {
  return (
    <article>
      {/* Hero claro: título, bajada, franja de 4 stats con .divider-v */}
      {/* Secciones numeradas (SH), tarjetas de métrica (MC), gráficos (ChartCard + DownloadableViz) */}
      {/* Cierre "El argumento": bgAlt, borde superior 3px red, cifras clave en rojo */}
    </article>
  )
}
```

Componentes internos de referencia (§10.2 del md de desarrollo): `SectionLabel`, `SH`, `MC`, `ChartCard`, `Tag`, `DownloadableViz`, blockquote de cita.

Reglas fijas (no negociables, §13):
- Gráficos siempre Chart.js interactivos, nunca imágenes estáticas.
- Paleta solo `G` (categorías) o `N` (intensidades) — nunca teal ni colores fuera de la paleta.
- Toda visualización publicable va envuelta en `DownloadableViz` (botón "Descargar PNG" con html2canvas) y declara su `fuente`.
- Nunca dibujar el emblema de la cruz en canvas.
- Slug: minúsculas, guiones, sin acentos, termina en año si no está en el título.

## Paso B - Registrar la ruta en `App.jsx`

```jsx
const EstudioNombre = lazy(() => import('./pages/EstudioNombre'))
// dentro de <Routes>, ANTES de la ruta genérica estudios/:id
<Route path="estudios/slug-del-estudio" element={<S><EstudioNombre /></S>} />
```

## Paso C - Agregar la entrada en `src/lib/data.js`

Sin este paso el estudio NO aparece en `/estudios`, ni en el buscador, ni en la home — el índice se arma desde `SEED`, no desde las rutas (misma regla que DatosPBA con Supabase, adaptada a local).

Agregar un objeto al array `SEED`:

```js
{
  titulo: 'Título exacto del estudio',
  bajada: 'Bajada corta (opcional)',
  tema: 'Tema (reutilizar uno existente si aplica, para que el filtro de /estudios lo agrupe)',
  alcance: 'En Argentina', // o 'Global', provincia, etc.
  fecha: 'Mayo 2026',       // legible
  fecha_orden: '2026-05-01', // YYYY-MM-DD, define el orden del índice
  url: '/estudios/slug-del-estudio',
  imagen: '/images/portada-slug.jpg', // ratio 3:2
  destacado: false, // true si es el que va arriba en la home (solo uno)
  slug: 'slug-del-estudio',
},
```

## Paso D - Verificación antes de dar por terminado

- [ ] `npm run build` compila sin errores.
- [ ] La ruta `/estudios/<slug>` carga el estudio.
- [ ] El estudio aparece en `/estudios` y en el buscador (Ctrl/Cmd+K).
- [ ] Si es el destacado, aparece arriba de la grilla en la home.
- [ ] Los gráficos descargan bien el PNG (botón de `DownloadableViz`).
- [ ] Las cifras del estudio fueron validadas antes de publicar (nunca inventar datos).

## Migración futura a Supabase

Cuando se cree el proyecto Supabase: correr `supabase/schema.sql`, migrar cada objeto de `SEED` a una fila de la tabla `estudios`, y `src/lib/data.js` empieza a leer de ahí automáticamente (ya tiene el fallback armado — ver `getEstudios()` y `searchEstudios()`). El Paso C de este documento pasa a ser "insertar la fila en Supabase" en vez de editar `SEED`.
