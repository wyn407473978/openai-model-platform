import { Outlet, Link, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/models', label: '模型' },
  { path: '/images/generate', label: '图片生成' },
  { path: '/images/edit', label: '图片编辑' },
  { path: '/logs', label: '调用历史' },
  { path: '/admin/models', label: '管理' },
]

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>AI Platform</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>G</div>
          <span>Guest</span>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
