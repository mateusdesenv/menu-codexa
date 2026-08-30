import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button, Icon, Avatar } from 'codexa-ui'
import { useAuth } from '../contexts/AuthContext'
import menuCodexaLogo from 'codexa-ui/logos/menu-codexa-logo-variations/horizontal-primary-light.svg'

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navItems = [
    { to: '/', label: 'Cardápio', icon: 'home' as const },
    { to: '/lists', label: 'Listas', icon: 'file' as const },
    { to: '/friends', label: 'Amigos', icon: 'users' as const },
    { to: '/random', label: 'Sortear', icon: 'refresh' as const },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="app-shell">
      <button
        type="button"
        className="app-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <Icon name={isMobileOpen ? 'close' : 'menu'} size={24} />
      </button>

      <aside className={`app-sidebar ${isMobileOpen ? 'is-open' : ''}`}>
        <div className="app-sidebar-header">
          <Link to="/" className="app-logo">
            <img src={menuCodexaLogo} alt="Menu Codexa" height="32" />
          </Link>
        </div>

        <nav className="app-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-nav-link ${isActive(item.to) ? 'is-active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          {user && (
            <>
              <div className="app-user">
                <Avatar name={user.name} src={user.photoUrl} size="small" />
                <span className="app-user-name" title={user.name}>
                  {user.name}
                </span>
              </div>
              <Button variant="ghost" size="small" onClick={logout}>
                <Icon name="logout" size={18} />
                <span>Sair</span>
              </Button>
            </>
          )}
        </div>
      </aside>

      <div
        className={`app-overlay ${isMobileOpen ? 'is-visible' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
