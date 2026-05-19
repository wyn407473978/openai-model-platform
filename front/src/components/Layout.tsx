import { Outlet, Link } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>AI Model Platform</div>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Dashboard</Link>
          <Link to="/models" className={styles.navLink}>Models</Link>
          <Link to="/images/generate" className={styles.navLink}>图片生成</Link>
          <Link to="/images/edit" className={styles.navLink}>图片编辑</Link>
          <Link to="/admin/models" className={styles.navLink}>Admin</Link>
        </nav>
        <div className={styles.userInfo}>
          <span>Guest</span>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
