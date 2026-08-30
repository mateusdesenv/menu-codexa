import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Lists from './pages/Lists'
import ListDetail from './pages/ListDetail'
import DishForm from './pages/DishForm'
import DishDetail from './pages/DishDetail'
import Friends from './pages/Friends'
import RandomPicker from './pages/RandomPicker'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:id" element={<ListDetail />} />
          <Route path="/dishes/new" element={<DishForm />} />
          <Route path="/dishes/:id" element={<DishDetail />} />
          <Route path="/dishes/:id/edit" element={<DishForm />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/random" element={<RandomPicker />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
