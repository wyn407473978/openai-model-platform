import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ModelsPage from './pages/ModelsPage'
import UsersPage from './pages/UsersPage'
import ImageGeneratePage from './pages/ImageGeneratePage'
import ImageEditPage from './pages/ImageEditPage'
import HistoryPage from './pages/HistoryPage'
import ModelsAdminPage from './pages/admin/ModelsAdminPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="images/generate" element={<ImageGeneratePage />} />
        <Route path="images/edit" element={<ImageEditPage />} />
        <Route path="logs" element={<HistoryPage />} />
        <Route path="admin/models" element={<ModelsAdminPage />} />
      </Route>
    </Routes>
  )
}

export default App
