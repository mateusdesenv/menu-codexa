import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button, Icon, Avatar } from 'codexa-ui'
import { useAuth } from '../contexts/AuthContext'
import menuCodexaLogo from 'codexa-ui/logos/menu-codexa-logo-variations/horizontal-primary-light.svg'

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { to: '/', label: 'Cardápio', icon: 'home' as const },
    { to: '/lists', label: 'Listas', icon: 'file' as const },
    { to: '/friends', label: 'Amigos', icon: 'users' as const },
    { to: '/random', label: 'Sortear', icon: 'refresh' as const },
  ]

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <img src={menuCodexaLogo} alt="Menu Codexa" height="32" />
        </Link>
        <nav className="app-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`app-nav-link ${location.pathname === item.to ? 'is-active' : ''}`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="app-user">
          {user && (
            <>
              <Avatar name={user.name} src={user.photoUrl} size="small" />
              <span className="app-user-name">{user.name}</span>
              <Button variant="ghost" size="small" onClick={logout}>
                <Icon name="logout" size={16} />
              </Button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
