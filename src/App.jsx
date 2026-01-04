// src/App.jsx - Versão atualizada com melhorias
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Componente de loading global
const GlobalLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Componente de erro global
const GlobalError = ({ error, resetError }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    textAlign: 'center'
  }}>
    <h2 style={{ color: '#e74c3c' }}>Oops! Algo deu errado</h2>
    <p style={{ margin: '10px 0' }}>{error?.message || 'Erro desconhecido'}</p>
    <button
      onClick={resetError}
      style={{
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px'
      }}
    >
      Tentar novamente
    </button>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Mantém a estrutura atual */}
        <AppRoutes />
        
        {/* Adiciona componentes úteis que não interferem na lógica existente */}
        
        {/* Exemplo: Adicione um Toast/Notification Provider se necessário */}
        {/* <ToastProvider>
          <AppRoutes />
        </ToastProvider> */}
        
        {/* Exemplo: Adicione um Theme Provider se necessário */}
        {/* <ThemeProvider>
          <AppRoutes />
        </ThemeProvider> */}
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;