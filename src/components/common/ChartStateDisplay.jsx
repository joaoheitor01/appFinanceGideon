// src/components/common/ChartStateDisplay.jsx
import React from 'react';
import ChartSkeleton from './ChartSkeleton'; // Assuming ChartSkeleton is in the same common directory

/**
 * Component to display loading, error, or empty states for charts.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isLoading - Whether the chart data is currently loading.
 * @param {boolean} props.isError - Whether an error occurred during data fetching.
 * @param {object} props.error - The error object, if an error occurred.
 * @param {object} props.chartData - The chart data object.
 * @param {function} props.refetch - Function to refetch the chart data.
 * @param {function} props.children - Render prop to display the actual chart when data is available.
 */
const ChartStateDisplay = ({ isLoading, isError, error, chartData, refetch, children }) => {
  const renderErrorState = (err, showRetry = true) => (
    <div className="flex flex-col items-center justify-center h-full text-danger-color bg-bg-card rounded-lg p-4 text-center">
      <p className="text-lg font-semibold mb-2">Ops! Ocorreu um erro.</p>
      <p className="mb-4">{err?.message || 'Ocorreu um erro desconhecido.'}</p>
      {showRetry && (
        <button
          onClick={() => refetch()}
          className="btn btn-primary"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );

  const renderEmptyDataState = () => (
    <div className="flex flex-col items-center justify-center h-full text-text-secondary bg-bg-card rounded-lg p-4 text-center">
      <p className="text-lg font-semibold mb-2">Nenhum dado disponível.</p>
      <p>Parece que não há dados para exibir este gráfico no momento.</p>
    </div>
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError) {
    return renderErrorState(error);
  }

  // Check if chartData exists and if all datasets are empty
  const hasNoData = chartData && chartData.datasets && chartData.datasets.every(dataset => dataset.data.length === 0);

  if (!isLoading && !isError && hasNoData) {
    return renderEmptyDataState();
  }

  // If none of the above, render the children (the actual chart)
  return children;
};

export default ChartStateDisplay;