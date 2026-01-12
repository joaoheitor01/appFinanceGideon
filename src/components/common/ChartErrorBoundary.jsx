// src/components/common/ChartErrorBoundary.jsx
import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Chart rendering error caught by Error Boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="card-main min-h-[300px] flex items-center justify-center text-red-500 bg-red-900 bg-opacity-20 rounded-lg p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Erro ao renderizar o gráfico!</h2>
            <p className="text-sm">
              Ocorreu um problema ao exibir este gráfico.
              <br />
              Tente recarregar a página ou contate o suporte.
            </p>
            {/* Optional: Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs text-red-300">
                <summary>Detalhes do Erro</summary>
                <pre className="whitespace-pre-wrap break-words text-left p-2 bg-red-800 rounded mt-2">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
