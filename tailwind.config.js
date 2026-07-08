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
          red:      '#E32219',
          redHover: '#C41E16',
          redOh:    '#e73743',
          ink:      '#231f20',
          gris:     '#5e686f',
          bgAlt:    '#F5F5F6',
          border:   '#EFEFF1',
          divider:  '#D9DCDE',
          teal:     '#43989B', // acento heredado del sitio anterior (pedido explícito;
                               // el md de diseño §13 lo prohíbe - validar con Comunicación)
          tealHover: '#3A8487',
        },
        grafico: {
          azul:    '#4886c6',
          coral:   '#f1635e',
          salmon:  '#f58980',
          durazno: '#f6b07b',
          verde:   '#b8d491',
        },
      },
      borderRadius: { DEFAULT: '8px' },
      boxShadow: { card: '0 2px 12px rgba(35,31,32,0.08)' },
      maxWidth: { container: '1200px' },
    },
  },
  plugins: [],
}
