import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Importações de componentes de página
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

//LAYOUT

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas que usam o Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        {/* Adicione outras rotas protegidas aqui */}
      </Route>
      
      {/* Rotas sem Layout (login, register, etc.) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

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
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal de rotas
  return (
    <Routes>
      {/* Rota raiz - redireciona baseado no estado de autenticação */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/dashboard" replace />
          </PublicRoute>
        }
      />

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
            <Register />
          </PublicRoute>
        }
      />

      {/* Rotas protegidas - requerem autenticação */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 - não encontrado */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );


export default AppRoutes;