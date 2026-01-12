import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import RegisterPage from './pages/Register';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componente para rotas públicas (acessíveis sem login)
const PublicRoute = ({ children, restricted = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  // Se a rota é restrita (como login/register) e usuário já está autenticado
  // redireciona para dashboard
  if (restricted && user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente principal de rotas
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        {/* TODO: Create Profile page */}
      </Route>

      {/* Rotas públicas acessíveis sem autenticação */}
      <Route
        path="/login"
        element={
          <PublicRoute restricted>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute restricted>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
