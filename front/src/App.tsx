import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ModelsPage from './pages/ModelsPage'
import UsersPage from './pages/UsersPage'
import ImageGeneratePage from './pages/ImageGeneratePage'
import ImageEditPage from './pages/ImageEditPage'
import ModelsAdminPage from './pages/admin/ModelsAdminPage'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="images/generate" element={<ImageGeneratePage />} />
        <Route path="images/edit" element={<ImageEditPage />} />
        <Route path="admin/models" element={<ModelsAdminPage />} />
      </Route>
    </Routes>
  )
}

export default App
