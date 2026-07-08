# Desarrollo web - Observatorio Humanitario de Cruz Roja Argentina

> **Propósito de este documento:** especificación técnica y funcional completa para construir la nueva página del Observatorio Humanitario en un repositorio nuevo. Se combina con `diseno-web-observatorio-humanitario.md` (el md de diseño), que es **normativo** en todo lo visual y de marca: ante cualquier conflicto entre este documento y el de diseño, gana el de diseño; ante cualquier conflicto entre ambos y el Manual de Identidad de CRA, gana el manual.
>
> **De dónde sale cada cosa:**
> - **Funcionamiento y arquitectura** → heredados de DatosPBA (www.datospba.com), sitio ya probado en producción con el mismo stack.
> - **Diseño visual** → md de diseño del Observatorio (tokens, layout, restricciones de marca).
> - **Títulos, secciones y copy** → sitio vigente `cruzroja.org.ar/observatorio-humanitario/` (se conserva la nomenclatura propia del Observatorio, no la de DatosPBA).

---

## 0. Cómo usar este documento

1. Este archivo y `diseno-web-observatorio-humanitario.md` viven juntos en la raíz del repo nuevo. Leer los dos antes de escribir código.
2. Orden de construcción sugerido (fase 1):
   1. Scaffold Vite + React + Tailwind con la configuración de §4.
   2. `Layout.jsx` (header + footer, §6) y rutas vacías (§8).
   3. `Home.jsx` sección por sección (§9.1) con el copy real de este documento.
   4. `/estudios` + `EstudioCard` + filtros (§9.2).
   5. Supabase: schema + seed (§11) + `SearchOverlay` (§7).
   6. `/metodologia`, formulario de comentarios, deploy (§14).
3. Los estudios de detalle (páginas propias tipo informe) se migran progresivamente después de la fase 1; mientras tanto las cards linkean a las URLs actuales (§11, campo `url`).
4. Todo lo marcado **TODO** en §15 se valida con el coordinador del Lab antes de publicar. No inventar cifras, logos ni testimonios.

---

## 1. Qué es el sitio (resumen)

- Página del **Observatorio Humanitario de Cruz Roja Argentina**, Centro de Referencia de la IFRC y miembro del consorcio RC3 desde 2022.
- Trabajo único: transmitir que el Observatorio produce **investigación seria, rigurosa y con estándares internacionales**, y llevar al visitante a (a) leer los estudios o (b) solicitar una investigación o servicio.
- Audiencias en orden: instituciones que pueden contratar investigaciones → red del Movimiento (IFRC, RC3) → público general.
- Tono: institucional pero humano, español rioplatense con voseo en CTAs. Sin lenguaje de marketing.
- Detalle completo en §1 del md de diseño.

---

## 2. Equivalencias DatosPBA → Observatorio

La arquitectura es la de DatosPBA con la nomenclatura del Observatorio. La correspondencia va "de la misma mano":

| DatosPBA (origen) | Observatorio (nuevo) | Ruta nueva |
|---|---|---|
| Informes (`/informes`) | **Estudios** | `/estudios` |
| Informe detalle estático (`Informe*.jsx`) | Estudio detalle estático (`Estudio*.jsx`) | `/estudios/<slug>` |
| `InformeDetalle.jsx` (fallback dinámico) | `EstudioDetalle.jsx` | `/estudios/:id` |
| ¿Quiénes somos? | **Metodología** ("Conocé cómo trabajamos") | `/metodologia` |
| SearchOverlay (buscador global Ctrl+K) | Buscador de estudios (la lupa del isologo como concepto) | overlay global |
| Tabla `informes` (Supabase) | Tabla `estudios` | - |
| Tabla `visualizaciones` | Tabla `visualizaciones` (igual) | - |
| TickerBar animado | **Franja de datos duros del hero** (estática, con divisores verticales) | Home |
| Home con últimas publicaciones | Home institucional completa (§7 del md de diseño) | `/` |

**Qué NO se migra de DatosPBA** (no tiene equivalente en el Observatorio, no construir):
- Hilos, Reportes rápidos, Beta, Datasets, Atlas/mapa municipal (Leaflet), dark mode (nunca existió acá y la identidad CRA vive sobre blanco), ticker animado.

**Qué es nuevo respecto de DatosPBA** (viene del sitio vigente del Observatorio):
- Sección Servicios (bloque rojo con CTA de presupuesto), formulario de Comentarios (tabla `comentarios`), módulo Donación, franja institucional con video RC3, sección "Con el apoyo de", logo bar oficial de 4 logos en el footer.

---

## 3. Stack técnico

Igual a DatosPBA, sin Leaflet y con Montserrat en lugar de Poppins:

```json
{
  "name": "observatorio-humanitario",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@fontsource/montserrat": "^5",
    "@supabase/supabase-js": "^2",
    "@vercel/analytics": "^2",
    "chart.js": "^4.4",
    "framer-motion": "^11",
    "html2canvas": "^1.4",
    "lucide-react": "^0.400",
    "react": "^18.3",
    "react-chartjs-2": "^5.2",
    "react-dom": "^18.3",
    "react-router-dom": "^6.24"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3",
    "autoprefixer": "^10.4",
    "postcss": "^8.4",
    "tailwindcss": "^3.4",
    "vite": "^5.3"
  }
}
```

Notas:
- **SPA sin SSR**, deploy automático en Vercel (push a `main`).
- **react-router-dom 6**: todas las rutas en `src/App.jsx`, páginas con `lazy()`.
- **framer-motion vía LazyMotion**: siempre importar `m`, nunca `motion`. Envolver la app en `<LazyMotion features={domAnimation}>` y `<MotionConfig reducedMotion="user">` (esto resuelve `prefers-reduced-motion` solo).
- **Chart.js 4 + react-chartjs-2** para todos los gráficos. **html2canvas** para descargar PNG con branding.
- **Supabase** para contenido dinámico (§11). Cliente en `src/lib/supabase.js`, credenciales en `.env.local`: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. **Proyecto Supabase nuevo, no reutilizar el de DatosPBA.**
- **Tipografía**: Montserrat vía `@fontsource/montserrat` importada en `main.jsx` (pesos 400, 500, 700, 800). Es el reemplazo libre de Gotham definido en §4 del md de diseño. Si aparece la licencia de Gotham: woff2 en `public/fonts/` + `@font-face`, y cambiar solo `tailwind.config.js`. Dejar este comentario en el config.

---

## 4. Estructura del proyecto y configuración

```
index.html
vite.config.js  tailwind.config.js  postcss.config.js  vercel.json  jsconfig.json
.env.local            (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY - no se commitea)
diseno-web-observatorio-humanitario.md
desarrollo-web-observatorio-humanitario.md   (este archivo)
supabase/schema.sql
public/
  logos/              logo-cra.svg, logo-bar-observatorio.png, isologo-lupa.png
  images/             fotos de campo, portadas de estudios (ratio 3:2)
  og-image.png        (PNG, no SVG: WhatsApp/X/Facebook no renderizan SVG)
src/
  main.jsx            entry: fonts + App + <Analytics />
  App.jsx             router: acá se registran TODAS las rutas
  index.css           estilos globales (focus, divisores, selection)
  lib/supabase.js     cliente Supabase
  components/
    Layout.jsx        header sticky + nav + buscador + footer (envuelve todo)
    SearchOverlay.jsx buscador global (tabla estudios)
    ScrollToTop.jsx   scroll al top en cada cambio de ruta + scroll a #hash
    shared/           EstudioCard.jsx, FilterBar.jsx, LogoBar.jsx
  pages/
    Home.jsx          landing institucional (todas las secciones de §9.1)
    Estudios.jsx      índice completo de estudios
    EstudioDetalle.jsx fallback dinámico
    Metodologia.jsx   página "Conocé cómo trabajamos"
    Estudio*.jsx      un archivo autocontenido por estudio migrado (§10)
```

### 4.1 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Montserrat = sustituto libre de Gotham (md de diseño §4).
        // Si llega licencia Gotham: reemplazar acá y cargar woff2 en public/fonts/.
        sans:    ['Montserrat', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Montserrat', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.78rem',  { lineHeight: '1.15rem' }],
        'sm':   ['0.925rem', { lineHeight: '1.4rem'  }],
        'base': ['1.05rem',  { lineHeight: '1.65rem' }],
        'lg':   ['1.15rem',  { lineHeight: '1.75rem' }],
        'xl':   ['1.28rem',  { lineHeight: '1.85rem' }],
      },
      colors: {
        cruz: {
          red:      '#E32219',  // Pantone 485 - emblema y CTAs primarios
          redHover: '#C41E16',
          redOh:    '#e73743',  // rojo OH - titulares destacados, links, hovers
          ink:      '#231f20',  // texto principal
          gris:     '#5e686f',  // texto secundario, metadata
          bgAlt:    '#F5F5F6',  // fondos alternos de sección
          border:   '#EFEFF1',  // bordes de cards y header
          divider:  '#D9DCDE',  // líneas verticales de la firma visual
        },
        grafico: {
          azul:    '#4886c6',
          coral:   '#f1635e',
          salmon:  '#f58980',
          durazno: '#f6b07b',
          verde:   '#b8d491',
        },
      },
      borderRadius: { DEFAULT: '8px' },   // un solo radio en todo el sitio
      boxShadow: { card: '0 2px 12px rgba(35,31,32,0.08)' },
      maxWidth: { container: '1200px' },
    },
  },
  plugins: [],
}
```

Sin `darkMode`: el sitio no tiene modo oscuro ni clases `dark:` (restricción de marca, no decisión técnica reversible).

### 4.2 index.css (globales)

```css
/* Firma visual: divisores verticales finos (heredados del logo bar) */
.divider-v { border-left: 1px solid #D9DCDE; }

/* Focus visible en todos los interactivos (md diseño §10) */
:focus-visible { outline: 2px solid #e73743; outline-offset: 2px; }

::selection { background: #F9D2D5; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

### 4.3 vite.config.js

Igual a DatosPBA sin el chunk de leaflet:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router':        ['react-router-dom'],
          'framer-motion': ['framer-motion'],
          'chart':         ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```

### 4.4 vercel.json

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 4.5 index.html (SEO)

```html
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Observatorio Humanitario | Cruz Roja Argentina</title>
    <meta name="description" content="Estudios interdisciplinarios desde una perspectiva centrada en las personas. Centro de Referencia de la Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja (IFRC)." />

    <link rel="icon" href="/logos/isologo-lupa.png" />
    <link rel="apple-touch-icon" href="/logos/isologo-lupa.png" />
    <meta name="theme-color" content="#E32219" />

    <meta property="og:title" content="Observatorio Humanitario | Cruz Roja Argentina" />
    <meta property="og:description" content="Estudios interdisciplinarios desde una perspectiva centrada en las personas." />
    <meta property="og:image" content="https://DOMINIO/og-image.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ResearchOrganization",
      "name": "Observatorio Humanitario de Cruz Roja Argentina",
      "parentOrganization": { "@type": "NGO", "name": "Cruz Roja Argentina", "url": "https://www.cruzroja.org.ar" },
      "address": "Hipólito Yrigoyen 2070, Ciudad Autónoma de Buenos Aires",
      "email": "observatorio@cruzroja.org.ar"
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- Fuentes: NO usar Google Fonts CDN; se cargan por `@fontsource` en `main.jsx` (self-hosted).
- `og-image.png`: armarla con el logo bar sobre blanco + claim. Siempre PNG (aprendizaje de DatosPBA: los SVG no previsualizan en redes).
- Favicon: el isologo de la lupa o el logo CRA reducido. **TODO validar con Comunicación** (§15).

---

## 5. Sistema de diseño aplicado (resumen operativo)

El md de diseño es la fuente completa; esto es lo mínimo que el código tiene que respetar en todo momento:

- **Proporción 90/8/2**: ~90% blanco/grises claros/texto `ink`, ~8% rojos en CTAs y acentos, ~2% paleta de gráficos solo en visualizaciones. El rojo es quirúrgico, no empapelado.
- **Un solo bloque de fondo rojo pleno en toda la home**: la sección Servicios. Nada más lleva fondo rojo.
- **Tipografía**: display en MAYÚSCULAS (Montserrat 500, tracking 0.02-0.04em) solo para hero y títulos de sección mayores. Titulares h2/h3 en Montserrat 800 sentence case. Cuerpo Montserrat 400, line-height 1.6, máximo `72ch`.
- **Botones**: primario fondo `#E32219` texto blanco hover `#C41E16`; secundario borde 1.5px `#231f20` con hover invertido. Radio 8px. Texto en sentence case con voseo ("Ver el estudio", "Solicitá una investigación"). Nunca degradés.
- **Cards**: fondo blanco, borde 1px `#EFEFF1`, sombra `shadow-card` SOLO en hover, radio 8px. Toda la card es clickeable; sin botones "VER ESTUDIO" repetidos.
- **Firma visual**: líneas divisorias verticales finas (`.divider-v`) entre columnas de datos, metadata de cards, columnas del footer. Es el elemento memorable del sitio; usarla con consistencia.
- **Motion**: transiciones 150-200ms en hovers; un solo `fadeUp` por sección al entrar al viewport; nada más. Animación única permitida:

```js
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})
```

- **Imágenes**: fotos reales de campo, sin overlays oscuros ni filtros. Portadas de estudios (ilustraciones existentes) siempre contenidas en ratio 3:2 con `object-fit: cover`. Placeholders de desarrollo: bloques grises neutros, jamás stock ni IA con branding.
- **Respiración**: `--space-section: clamp(4rem, 8vw, 7rem)` entre secciones; container max 1200px.

---

## 6. Layout.jsx (header + footer)

Envuelve todas las rutas, como en DatosPBA. Incluye `ScrollToTop` (scroll al top en cada cambio de ruta; si la URL trae `#hash`, scrollear a esa sección).

### 6.1 Header

- Sticky, 64-72px, fondo blanco, borde inferior `1px #EFEFF1`. Sin transparencias.
- Izquierda: logo CRA horizontal + wordmark "Observatorio Humanitario" (Montserrat 800, `ink`). NO usar el logo bar de 4 logos acá (viola tamaños mínimos).
- Navegación (títulos del sitio vigente):
  - **Estudios** → `/estudios`
  - **Servicios** → `/#servicios`
  - **Metodología** → `/metodologia`
  - **Solicitá una investigación** → botón CTA primario rojo → `/#servicios` (donde vive el formulario de presupuesto)
- Ícono de lupa que abre el `SearchOverlay` + atajo de teclado **Ctrl/Cmd+K** (heredado de DatosPBA; además la lupa es parte del isologo del Observatorio, la búsqueda es identidad acá).
- Mobile: menú hamburguesa con los mismos 4 items; el CTA se mantiene visible.

### 6.2 Footer

- Fondo gris muy claro `#F5F5F6`, borde superior `1px #EFEFF1` (se eligió la variante clara del md de diseño §7.9: la identidad vive sobre blanco; sostenerla, no alternar con footer oscuro).
- Bloque 1: **logo bar oficial de 4 logos** (`logo-bar-observatorio.png`) dentro de su contenedor blanco con padding, centrado, max-width ~900px. Es el único lugar de la página donde va el lockup completo (además de la franja institucional si le da el aire).
- Bloque 2: tres columnas separadas por `.divider-v` en desktop (apiladas en mobile), con los títulos del sitio vigente:
  - **Dirección**: Hipólito Yrigoyen 2070, Ciudad Autónoma de Bs. As., C1089 AAN
  - **Contacto**: Tel.: (5411) 6065-0450 · info@cruzroja.org.ar (TODO §15: confirmar si el fax queda)
  - **Redes sociales**: Instagram, Facebook, X, YouTube, LinkedIn (íconos lucide-react monocromos `gris`, hover `redOh`; URLs TODO §15)
- Bloque 3: línea legal: "© {año dinámico} Cruz Roja Argentina · Observatorio Humanitario" + link a cruzroja.org.ar.

---

## 7. SearchOverlay (buscador global)

Mismo patrón que DatosPBA, simplificado a una tabla:

- Se abre con la lupa del header, Ctrl/Cmd+K, o el buscador de la sección Estudios de la home. Se cierra con Esc o click afuera.
- Query a Supabase sobre `estudios`: `or(ilike)` en `titulo`, `bajada`, `tema`. Debounce ~250ms.
- Resultados: lista de filas con título (hover a `redOh`), chip de tema y año; separadores horizontales finos. Click navega a `url`.
- Estado vacío: "No encontramos estudios sobre eso. Probá con otra palabra clave."

---

## 8. Rutas y páginas

Todas registradas en `src/App.jsx` con `lazy()` + `<Suspense fallback={null}>`:

| Ruta | Archivo | Qué muestra |
|---|---|---|
| `/` | `Home.jsx` | Landing institucional completa (§9.1) |
| `/estudios` | `Estudios.jsx` | Índice completo de estudios (§9.2) |
| `/estudios/<slug>` | `Estudio*.jsx` | Estudios estáticos autocontenidos (§10) |
| `/estudios/:id` | `EstudioDetalle.jsx` | Fallback dinámico: estudio desde Supabase + visualizaciones relacionadas |
| `/metodologia` | `Metodologia.jsx` | "Conocé cómo trabajamos" (§9.3) |
| `*` | redirect a `/` | 404 |

**La ruta genérica `estudios/:id` va siempre al final**, después de todas las rutas estáticas de estudios (regla heredada de DatosPBA).

---

## 9. Especificación de páginas (con el copy real del sitio vigente)

### 9.1 Home.jsx

Sigue el orden del md de diseño §7. Secciones con `id` para anchors: `#institucional`, `#estudios`, `#buscan`, `#servicios`, `#metodologia`, `#comentarios`, `#donacion`, `#apoyo`.

**a) Hero (tipográfico, fondo blanco - sin foto con overlay, sin popup)**
- Eyebrow caps `gris`: `CRUZ ROJA ARGENTINA · CENTRO DE REFERENCIA IFRC`
- H1 display caps (clamp 2.5rem-4.5rem): **OBSERVATORIO HUMANITARIO**
- Bajada (Montserrat 400, `ink`): "Estudios interdisciplinarios desde una perspectiva centrada en las personas." (el claim del sitio actual, máx ~60 caracteres por línea)
- CTAs: **"Ver nuestros estudios"** (primario → `/estudios`) · **"Solicitá una investigación"** (secundario → `#servicios`)
- A la derecha (desktop) o debajo (mobile): UNA foto fuerte de trabajo de campo real, radio 8px, sin overlay.
- Debajo, franja fina de datos duros separados por `.divider-v` (reemplaza al TickerBar de DatosPBA, estática):
  `+20 estudios publicados | 24 jurisdicciones | Centro de Referencia IFRC desde 2022 | Consorcio RC3`
  **TODO §15: verificar cada cifra antes de publicar. No inventar números.**

**b) Franja institucional (`#institucional`)**
- H2: **"Observatorio Humanitario de Cruz Roja Argentina"**
- Texto (completar del sitio vigente, empieza así): "Desde el año 2022, el Observatorio Humanitario forma parte del Consorcio de Investigación de la Cruz Roja y de la Media Luna Roja (RC3) como Centro de Referencia e Investigación. [...]" **TODO §15: copiar el párrafo completo del sitio actual.**
- Video de YouTube institucional embebido con thumbnail custom: imagen + botón play, el iframe se inyecta recién al click (no player crudo). **TODO §15: ID del video.**
- Si el layout le da aire, acá puede ir el logo bar completo con respiración.

**c) Estudios (`#estudios`) - corazón de la página**
- H2: **"Conocé todos nuestros estudios"**
- Input de búsqueda (placeholder: "Buscar por palabra clave") que abre el `SearchOverlay`.
- **Estudio destacado**: el más reciente (campo `destacado`, si no el primero por `fecha_orden`) en card ancha arriba de la grilla. Reemplaza al popup "Investigación Global" del sitio actual: mismo rol, cero intrusión.
- Grilla de los 6 estudios más recientes (`EstudioCard`, 3 columnas desktop / 1 mobile):
  - Imagen ratio 3:2 fija, `object-fit: cover` (unifica ilustraciones y fotos).
  - Metadata caps chicas `gris`: `EN ARGENTINA · 2024` (campos `alcance` · año).
  - Chip de tema (fondo `bgAlt`, texto `gris`).
  - Título Montserrat 800, máx 2 líneas con ellipsis.
  - Toda la card clickeable → `url`. Hover: elevación (`shadow-card`) + título a `redOh`. Sin botón "Ver estudio".
- Link final: **"Ver todas las investigaciones"** → `/estudios` (botón secundario centrado).

**d) Qué buscan nuestras investigaciones (`#buscan`)**
- Fondo `#F5F5F6`. H2: **"Nuestras investigaciones buscan:"**
- Tres columnas separadas por `.divider-v`, verbo en Montserrat 800 rojo `redOh` + texto en 400:
  - **Identificar** necesidades humanitarias y situaciones de vulnerabilidad
  - **Acompañar** el diseño de proyectos de incidencia social y políticas públicas
  - **Sensibilizar y educar** para contribuir a mejorar la vida de las personas
- Cierre (párrafo `gris`): "Todos los estudios cuentan con los estándares más altos de confiabilidad y excelencia. Así como también representatividad federal de acuerdo a los alcances territoriales de cada investigación."

**e) Servicios (`#servicios`) - ÚNICO bloque rojo de la página**
- Fondo `#E32219`, todo el contenido en blanco (práctica del manual CRA).
- H2: **"Nuestros servicios"**
- Intro: "El Observatorio Humanitario cuenta con amplia capacidad de análisis de datos para comprender realidades de diversas temáticas y poblaciones."
- "Esto nos permite realizar:" + lista (separadores finos):
  - Investigaciones especiales
  - Informes analíticos
  - Diseño de cuestionarios
  - Toma de registro
  - Elaboración de muestras
  - Procesamiento de datos
- Columna derecha: "Los servicios e investigaciones se adaptan a las necesidades de las organizaciones no gubernamentales, organizaciones públicas y sector privado, entre otros." + "Para solicitar un presupuesto, completá este breve formulario:"
- CTA blanco (texto rojo): **"Completar formulario"** → **TODO §15: URL del formulario.**
- "También podés contactarnos al **+54 9 11-6065-0450** o por mail a **observatorio@cruzroja.org.ar**"

**f) Metodología teaser (`#metodologia`)**
- Fondo blanco. H2: **"Conocé cómo trabajamos"**
- Texto: "Relevamos información de manera presencial, virtual o mixta. Antes y después de cada investigación se realiza un monitoreo digital de redes sociales en tiempo real mediante herramientas de análisis de Big Data."
- Botón secundario **"Conocé más"** → `/metodologia`. Íconos (si los hay): línea fina, monocromos `gris`, nunca formas que evoquen el emblema.

**g) Comentarios + Donación (`#comentarios` / `#donacion`)**
- Dos módulos lado a lado (apilados en mobile). Sin teal: comentarios sobre `bgAlt`, donación como card blanca con borde superior 3px rojo.
- **Comentarios**: "Si tenés algún comentario o recomendación sobre nuestros estudios, podés cargarlos a continuación y nos ayudará a seguir creciendo."
  - Campos: Nombre · Dirección de correo electrónico · Mensaje · botón **"Enviar"** (primario).
  - Submit: insert en tabla `comentarios` (§11). Validación en cliente (campos requeridos, email válido, límites de longitud) + campo honeypot oculto. Estado de éxito: "¡Gracias! Recibimos tu comentario."
- **Donación**: "Tu colaboración mensual o por única vez nos permite seguir transformando realidades."
  - CTA primario **"Doná ahora"** → **TODO §15: URL de donación** · "o llamá al **0810-999-2222**"

**h) Con el apoyo de (`#apoyo`)**
- H2: **"Con el apoyo de"**. Logos de aliados en escala de grises, tamaño uniforme, sobre blanco. **TODO §15: lista definitiva de logos.**

### 9.2 Estudios.jsx (índice completo)

Equivalente funcional de `/informes` de DatosPBA:

- H2 display: **"Todos nuestros estudios"** + contador ("N estudios publicados").
- Lee la tabla `estudios` ordenada por `fecha_orden desc`.
- **FilterBar**: chips de tema (generados de los valores únicos de `tema` + chip "Todos") + input de búsqueda por palabra clave. Filtrado client-side (el volumen es chico; si supera ~40 estudios, paginar con "Cargar más").
- Grilla de `EstudioCard` (mismas cards que la home).
- Estado vacío del filtro: mensaje + botón "Limpiar filtros".

### 9.3 Metodologia.jsx

Página institucional (equivalente de QuienesSomos en DatosPBA):

- H1 display: **"Conocé cómo trabajamos"**
- Contenido: metodología de relevamiento (presencial, virtual o mixta), monitoreo digital con Big Data, estándares de confiabilidad, representatividad federal, pertenencia a RC3/IFRC. **TODO §15: traer el texto completo de la página de metodología vigente.**
- Cierre con CTA doble: "Ver nuestros estudios" + "Solicitá una investigación".

### 9.4 EstudioDetalle.jsx (fallback dinámico)

Igual que `InformeDetalle` de DatosPBA: busca el estudio en la tabla por id/slug, renderiza hero claro con título, bajada, metadata y contenido, y lista las `visualizaciones` relacionadas (por `estudio_url`) en `VizCard`s. Sirve para estudios cargados solo en Supabase, sin página estática propia.

---

## 10. Estudios de detalle (páginas estáticas autocontenidas)

Mismo sistema editorial que los informes de DatosPBA: **cada estudio es UN archivo JSX autocontenido** en `src/pages/` (define su paleta, componentes UI, datos y gráficos adentro; no comparten componentes entre sí, por diseño: se copia del estudio de referencia y se adapta). El primero que se construya queda como referencia.

### 10.1 Paleta base de los estudios (adaptación CRA del sistema DatosPBA)

```js
const C = {
  bg:      '#FFFFFF',    // fondo general (la identidad vive sobre blanco)
  bgAlt:   '#F5F5F6',    // secciones alternas
  ink:     '#231f20',    // texto principal
  inkMid:  '#5e686f',    // texto secundario
  rule:    '#EFEFF1',    // bordes sutiles
  divider: '#D9DCDE',    // líneas verticales (firma visual)
  red:     '#E32219',    // acento primario (cifras clave, CTAs)
  redOh:   '#e73743',    // links, SectionLabel, hovers
}

// Paleta diferencial: categorías distintas en un mismo gráfico
const G = ['#4886c6', '#f1635e', '#f58980', '#f6b07b', '#b8d491']

// Paleta neutral: escala monocromática de intensidad
const N = ['#E94E58', '#F1858B', '#F6ACB1', '#F9D2D5']
```

Diferencias clave con DatosPBA (por restricciones de marca, md diseño §11):
- **Hero CLARO**: fondo blanco con título `ink` y acentos rojos. Nada de hero navy oscuro.
- **Conclusión clara**: el bloque final "El argumento" va sobre `bgAlt` con borde superior 3px `red` y cifras clave en rojo, no bloque oscuro con círculos decorativos.
- **Stats del hero**: franja de 4 números separados por `.divider-v` (números Montserrat 800 en `red` o paleta G, labels `inkMid`), en lugar de cards translúcidas.

### 10.2 Componentes internos del estudio

Los mismos de DatosPBA, restilados con la paleta de arriba (se copian del estudio de referencia):

- `SectionLabel` - etiqueta chica uppercase en `redOh` (fuentes · área temática).
- `SH` - encabezado de sección numerada: número chico rojo + línea divisoria + título grande.
- `MC` - tarjeta de métrica (label, value, unit; `accent` para la más importante).
- `ChartCard` - contenedor de gráfico con título y prop `fuente` siempre visible.
- `Tag` - chip de categoría (fondos claros de la paleta G con texto oscuro).
- `DownloadableViz` - wrapper con botón "Descargar PNG" (html2canvas). El footer del PNG dice **"Observatorio Humanitario · Cruz Roja Argentina · cruzroja.org.ar"** en texto, con línea de acento roja. **Nunca dibujar la cruz/emblema en canvas**: el emblema solo existe como asset oficial sin alterar.
- Blockquote de cita: borde izquierdo 3px `redOh`, fondo `bgAlt`.

### 10.3 Gráficos (Chart.js)

- Defaults: `responsive: true`, `maintainAspectRatio: false`, ticks 12px, grilla `#EFEFF1`, tooltips `backgroundColor: '#231f20'`, `cornerRadius: 8`, `padding: 12`.
- Colores: SOLO paleta G (categorías) y N (intensidades). Jamás teal ni colores fuera de §5 del md de diseño.
- Cuándo usar cada tipo (heredado de DatosPBA): barras horizontales para rankings · barras verticales para evolución corta o dos grupos · línea con área para series largas · donut para composición de 4-8 categorías (nunca más de 8) · tabla cuando hay 5+ entidades con 3+ atributos · tarjetas MC para los 3-4 números clave de una sección (acompañan al gráfico, no lo reemplazan).
- Todo gráfico publicable va envuelto en `DownloadableViz` y declara su fuente.

### 10.4 Slugs

Todo en minúsculas · espacios → guiones · sin acentos ni caracteres especiales · terminar con el año si no está en el título. Ej: "Investigación sobre cambio climático en Argentina" → `cambio-climatico-argentina-2023`.

---

## 11. Supabase

### 11.1 Schema (`supabase/schema.sql`)

```sql
create table estudios (
  id          bigint generated always as identity primary key,
  titulo      text not null,
  bajada      text,
  tema        text,
  alcance     text,           -- "En Argentina", "Global", provincia, etc.
  fecha       text,           -- legible: "Mayo 2026"
  fecha_orden date,           -- YYYY-MM-DD, define el orden del índice
  url         text not null,  -- /estudios/<slug> o URL externa (interim)
  imagen      text,           -- portada card (ratio 3:2)
  destacado   boolean default false,
  insights    text[]          -- puntos destacados para la card (opcional)
);

create table visualizaciones (
  id           bigint generated always as identity primary key,
  titulo       text not null,
  descripcion  text,
  imagen       text,
  estudio_url  text            -- FK lógica a estudios.url
);

create table comentarios (
  id      bigint generated always as identity primary key,
  nombre  text,
  email   text,
  mensaje text not null,
  creado  timestamptz default now()
);

alter table estudios       enable row level security;
alter table visualizaciones enable row level security;
alter table comentarios    enable row level security;

create policy "lectura publica"  on estudios        for select using (true);
create policy "lectura publica"  on visualizaciones for select using (true);
create policy "insert publico"   on comentarios     for insert with check (
  char_length(mensaje) between 1 and 2000 and char_length(coalesce(nombre,'')) <= 120
);
-- comentarios NO tiene policy de select: solo se leen desde el dashboard de Supabase.
```

### 11.2 Quién consume qué

| Tabla | Consumidores |
|---|---|
| `estudios` | Home (destacado + grilla), Estudios.jsx (índice), EstudioDetalle.jsx, SearchOverlay |
| `visualizaciones` | EstudioDetalle.jsx (relacionadas por `estudio_url`) |
| `comentarios` | Formulario de la home (solo insert) |

**CLAVE (regla heredada de DatosPBA):** un estudio estático nuevo NO aparece en `/estudios`, ni en el buscador, ni en la home hasta insertar su fila en la tabla `estudios` con `url = /estudios/<slug>`. El índice se arma desde la tabla, no desde las rutas.

### 11.3 Seed inicial: los 12 estudios del sitio vigente

Títulos exactos del sitio actual. Temas y slugs son propuesta; años y URLs actuales se completan del sitio vigente (**TODO §15**):

| Título | Tema (propuesto) | Slug (propuesto) |
|---|---|---|
| Apuestas Online y Adolescencia: construyendo entornos seguros | Adolescencias y entornos digitales | `apuestas-online-adolescencia` |
| Acceso al agua y condiciones de vida de las comunidades Wichí | Agua y comunidades | `acceso-agua-comunidades-wichi` |
| Calidad de vida de personas adultas mayores en Argentina | Personas mayores | `calidad-vida-adultas-mayores` |
| Investigación sobre cambio climático en Argentina | Cambio climático | `cambio-climatico-argentina` |
| Investigación sobre percepciones y experiencias de mujeres en tratamiento por consumo problemático en Argentina | Salud mental y consumos | `mujeres-consumo-problematico` |
| Investigación sobre donación de órganos y tejidos en Argentina | Donación de órganos | `donacion-organos-tejidos` |
| Investigación global - «Aprendizajes adquiridos por sectores estratégicos a partir de la pandemia» | Salud global | `investigacion-global-pandemia` |
| Investigación sobre barreras de acceso a servicios de salud mental en Argentina | Salud mental | `barreras-salud-mental` |
| Investigación sobre el impacto de la pandemia en las relaciones familiares y la salud mental en el hogar | Salud mental | `pandemia-salud-mental-hogar` |
| Investigación sobre Medios de Vida en Argentina | Medios de vida | `medios-de-vida-argentina` |
| Investigación sobre Calidad de Vida en Argentina | Calidad de vida | `calidad-de-vida-argentina` |
| Investigación sobre Personas Adultas Mayores en Argentina | Personas mayores | `personas-adultas-mayores-argentina` |

- En fase 1, `url` apunta a la página/PDF actual de cada estudio en cruzroja.org.ar (link externo). A medida que se migren como páginas propias (§10), se actualiza a `/estudios/<slug>`.
- `imagen`: las ilustraciones de carátula existentes, recortadas/contenidas a 3:2.
- El estudio destacado inicial: el más reciente (hoy "Apuestas Online y Adolescencia") con `destacado = true`.

---

## 12. Flujo de carga de un estudio nuevo

Adaptación directa del flujo de DatosPBA:

**Paso A - Crear la página** (si el estudio tiene página propia)
Archivo `Estudio[NombrePascalCase].jsx` autocontenido en `src/pages/`, copiado del estudio de referencia y adaptado (§10).

**Paso B - Registrar la ruta en App.jsx**
```jsx
const EstudioNuevo = lazy(() => import('./pages/EstudioNuevo'))
// dentro de <Routes>, ANTES de la ruta genérica estudios/:id
<Route path="estudios/slug-del-estudio" element={<Suspense fallback={null}><EstudioNuevo /></Suspense>} />
```

**Paso C - Insertar la fila en Supabase (tabla `estudios`)**
Sin este paso el estudio NO aparece en el índice, el buscador ni la home. Campos: `titulo`, `bajada`, `tema` (usar uno existente si aplica), `alcance`, `fecha` legible, `fecha_orden` YYYY-MM-DD, `url = /estudios/<slug>`, `imagen`, `destacado` si corresponde.

**Paso D - Verificación antes de dar por terminado**
- `npm run build` compila sin errores.
- La ruta `/estudios/<slug>` carga el estudio.
- El estudio aparece en `/estudios` y en el buscador.
- Los gráficos descargan bien el PNG (botón de DownloadableViz).
- Las cifras del estudio fueron validadas por el coordinador del Lab.

---

## 13. Estándares que nunca se rompen

Fusión de los estándares de DatosPBA y las restricciones de marca CRA/OH. Lista de cumplimiento permanente:

**De marca (md de diseño §3 y §11 - normativos):**
1. El emblema de la cruz roja JAMÁS como ornamento, patrón, ícono decorativo, favicon improvisado ni marca de agua. Nunca alterar proporciones/colores de ningún logotipo.
2. El logo IFRC solo dentro del logo bar autorizado; nunca suelto.
3. Logo bar completo solo en footer (y franja institucional si tiene aire); en el header, logo CRA + wordmark.
4. Nada de teal ni colores fuera de la paleta de §5 del md de diseño.
5. Sin degradés, glassmorphism, popups, interstitials ni estética de landing tech.
6. Sin fondos oscuros dominantes ni dark mode: la identidad vive sobre blanco. Un solo bloque rojo pleno (Servicios).
7. No inventar cifras, testimonios ni logos: todo dato duro se valida antes de publicar.
8. Registro humanitario y riguroso, voseo en CTAs. Sin "soluciones innovadoras" ni marketing corporativo.

**De funcionamiento (heredados de DatosPBA):**
9. Gráficos siempre interactivos con Chart.js + envueltos en DownloadableViz; nunca imágenes estáticas de gráficos.
10. Fuentes de datos siempre visibles (prop `fuente` del ChartCard + pie del estudio).
11. Animaciones solo con `fadeUp()` de framer-motion (`m`, no `motion`); nada de CSS animations ni otras librerías.
12. Párrafos de cuerpo con `maxWidth: '72ch'`. Fechas internas YYYY-MM-DD.
13. Tipografía única: Montserrat (o Gotham si llega la licencia). Sin serifs, sin fuentes "de personalidad".
14. Nunca em-dash en el contenido: siempre guión simple (-).
15. Los estudios estáticos son autocontenidos: cada JSX define sus componentes y datos. No importar componentes de otro estudio ni crear shared/ para ellos.
16. `npm run build` verde antes de cada push.

**De accesibilidad (md de diseño §10 - piso de calidad):**
17. Contraste AA en todo texto (`#5e686f` sobre blanco solo en ≥16px; blanco sobre rojo verificar en tamaños chicos).
18. El rojo nunca es el único portador de significado (links con subrayado o ícono).
19. Focus visible en todos los interactivos (ya resuelto en index.css).
20. Un solo h1 por página, h2 por sección, jerarquía semántica real. Alt text descriptivo en todas las imágenes de estudios. `lang="es-AR"`.

---

## 14. Build, deploy y verificación

- Dev: `npm run dev` · Build: `npm run build` · Preview: `npm run preview`
- Deploy: repo en GitHub → proyecto en Vercel → push a `main` deploya automático. Variables de entorno de Supabase cargadas en Vercel.
- `@vercel/analytics`: `<Analytics />` montado en `main.jsx`.
- Dominio: **TODO §15** (candidato natural: subdominio de cruzroja.org.ar; lo define infraestructura de CRA).

Checklist de lanzamiento:
- [ ] Build verde y sin warnings de chunks gigantes.
- [ ] Lighthouse: accesibilidad ≥ 95, contraste AA verificado.
- [ ] OG image PNG previsualiza bien en WhatsApp/X (probar con URL real).
- [ ] Probado en mobile real: header, grilla de estudios, formulario, franja de datos.
- [ ] `prefers-reduced-motion` respetado (sin fadeUp ni smooth scroll).
- [ ] Todos los TODO de §15 resueltos o explícitamente diferidos.

---

## 15. Decisiones pendientes de validación (TODO)

Marcar en el código como `TODO` hasta resolverse. Ninguna bloquea el desarrollo; todas bloquean el lanzamiento:

- [ ] Licencia web de Gotham sí/no → define Gotham vs Montserrat (§3).
- [ ] Cifras de la franja de datos del hero (cantidad de estudios, jurisdicciones, año de designación IFRC).
- [ ] Años, temas definitivos y URLs actuales de los 12 estudios del seed (§11.3).
- [ ] Texto institucional completo (párrafo RC3) y texto completo de metodología, del sitio vigente.
- [ ] URL del formulario "Completar formulario" (Servicios) y URL de donación.
- [ ] ID del video de YouTube institucional.
- [ ] URLs de redes sociales del footer y si se mantiene el fax.
- [ ] Lista definitiva de logos "Con el apoyo de" (+ assets en escala de grises).
- [ ] Favicon (isologo lupa vs logo CRA) → validar con Dirección de Comunicación.
- [ ] Confirmar que el uso del logo bar (con IFRC y RC3) en la nueva página está cubierto por la autorización vigente.
- [ ] Codificación por color de temáticas en los chips (paleta diferencial) sí/no.
- [ ] Dominio/subdominio definitivo y botón "About us" (versión en inglés) sí/no.
