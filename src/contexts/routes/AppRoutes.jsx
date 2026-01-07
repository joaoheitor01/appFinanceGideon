import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Dashboard from '../../components/dashboard/Dashboard';
import LoginForm from '../../components/auth/LoginForm';
import SignUpForm from '../../components/auth/SignUpForm';
import Layout from '../../components/layout/Layout';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Pode ser um spinner ou skeleton screen
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não houver usuário, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o componente
  return children;
};

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
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute restricted>
            <SignUpForm />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
