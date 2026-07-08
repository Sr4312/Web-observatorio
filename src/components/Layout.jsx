import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Search, Menu, X, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react'
import ScrollToTop from './ScrollToTop'
import SearchOverlay from './SearchOverlay'

const NAV = [
  { label: 'Estudios', to: '/estudios' },
  { label: 'Monitoreo digital', to: '/monitoreo-digital' },
  { label: 'Servicios', to: '/#servicios' },
  { label: 'Metodología', to: '/metodologia' },
]

// TODO §15: URLs de redes sociales definitivas
const REDES = [
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/cruzrojaarg' },
  { Icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/CruzRojaArgentina' },
  { Icon: Twitter, label: 'X', href: 'https://x.com/CruzRojaArg' },
  { Icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/user/CruzRojaArgentina' },
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/cruz-roja-argentina' },
]

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-white bg-dots font-sans text-cruz-ink">
      <ScrollToTop />
      <header className="sticky top-0 z-40 border-b border-cruz-border bg-white">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:h-[72px] md:px-6">
          <Link to="/" className="flex items-center">
            <img src="/logos/logo-cra.png" alt="Cruz Roja Argentina - Observatorio Humanitario" className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
            {NAV.map(({ label, to }) => (
              <NavLink key={to} to={to} className="text-sm font-medium hover:text-cruz-redOh">
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar estudios (Ctrl+K)"
              className="text-cruz-gris hover:text-cruz-redOh"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/#servicios"
              className="rounded bg-cruz-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cruz-redHover"
            >
              Solicitá una investigación
            </Link>
          </nav>

          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar estudios" className="text-cruz-gris">
              <Search className="h-5 w-5" />
            </button>
            <button onClick={() => setMenuOpen(o => !o)} aria-label="Menú" className="text-cruz-ink">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-cruz-border bg-white px-4 py-4 md:hidden" aria-label="Principal móvil">
            {NAV.map(({ label, to }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="block py-2 font-medium">
                {label}
              </NavLink>
            ))}
            <Link
              to="/#servicios"
              onClick={() => setMenuOpen(false)}
              className="mt-2 block rounded bg-cruz-red px-4 py-2 text-center font-medium text-white"
            >
              Solicitá una investigación
            </Link>
          </nav>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-cruz-border bg-cruz-bgAlt">
        <div className="mx-auto max-w-container px-4 py-12 md:px-6">
          {/* Logo bar oficial de 4 logos - único lugar del lockup completo */}
          <div className="mx-auto max-w-[900px] rounded bg-white p-6">
            <img
              src="/logos/logo-bar-observatorio.jpeg"
              alt="Cruz Roja Argentina - Observatorio Humanitario, Centro de Referencia IFRC - Consorcio RC3"
              className="mx-auto w-full"
            />
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
            <div className="md:px-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cruz-gris">Dirección</h2>
              <p className="mt-2 text-sm">Hipólito Yrigoyen 2070,<br />Ciudad Autónoma de Bs. As., C1089 AAN</p>
            </div>
            <div className="md:border-l md:border-cruz-divider md:px-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cruz-gris">Contacto</h2>
              {/* TODO §15: confirmar si el fax queda */}
              <p className="mt-2 text-sm">Tel.: (5411) 6065-0450<br />info@cruzroja.org.ar</p>
            </div>
            <div className="md:border-l md:border-cruz-divider md:px-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cruz-gris">Redes sociales</h2>
              <div className="mt-3 flex gap-4">
                {REDES.map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                     className="text-cruz-gris transition-colors hover:text-cruz-redOh">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 border-t border-cruz-border pt-6 text-center text-xs text-cruz-gris">
            © {new Date().getFullYear()} Cruz Roja Argentina · Observatorio Humanitario ·{' '}
            <a href="https://www.cruzroja.org.ar" target="_blank" rel="noopener noreferrer" className="underline hover:text-cruz-redOh">
              cruzroja.org.ar
            </a>
          </p>
        </div>
      </footer>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
