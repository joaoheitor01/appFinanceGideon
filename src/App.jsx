import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  const simulateError = () => {
    throw new Error("This is a test error for Sentry!");
  };

  return (
    <ErrorBoundary>
      <AppRoutes />
      {/* Button to simulate an error for Sentry testing */}
      <button
        onClick={simulateError}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Simulate Sentry Error
      </button>
    </ErrorBoundary>
  );
}

export default App;
