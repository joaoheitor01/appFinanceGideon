// src/components/dashboard/EvolutionChart.jsx
import React, { memo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import useChartResize from '../../hooks/useChartResize';
import { useChartOptions } from '../../hooks/useChartOptions';
import { useChartData } from '../../hooks/useChartData';
import ChartSkeleton from '../common/ChartSkeleton';
import { useChartPeriodSelection } from '../../hooks/useChartPeriodSelection';
import { useQueryClient } from '@tanstack/react-query';

// Import compound components
import ChartContainer from '../charts/ChartContainer';
import ChartHeader from '../charts/ChartHeader';
import ChartToolbar from '../charts/ChartToolbar';
import ChartLegend from '../charts/ChartLegend';
import ChartStateDisplay from '../common/ChartStateDisplay';
import ErrorBoundary from '../common/ErrorBoundary';

const EvolutionChart = memo(() => {
  const chartRef = useRef(null);
  const { chartSize } = useChartResize(chartRef);
  const { chartOptions } = useChartOptions(chartSize);
  const { chartData, isLoading, isError, error, refetch } = useChartData('evolution-chart'); // Example key
  const { periods, activePeriod, handlePeriodChange, handlePeriodPrefetch } = useChartPeriodSelection();
  const queryClient = useQueryClient();

  const legendItems = chartData?.datasets.map(dataset => ({
    label: dataset.label,
    color: dataset.borderColor,
  })) || [];

  return (
    <ErrorBoundary>
      <ChartContainer 
        innerRef={chartRef}
      > 
        <ChartHeader title="Evolução Financeira">
            <div className="flex gap-2">
                {periods.map(period => (
                    <button 
                        key={period} 
                        className={`btn btn-sm ${activePeriod === period ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handlePeriodChange(period)}
                        onMouseEnter={() => handlePeriodPrefetch('evolution-chart', period)}
                    >
                        {period}
                    </button>
                ))}
            </div>
      </ChartHeader>
      
      {/* The main chart content, including state display and the Line chart */}
      <div className="h-[400px] mt-4">
        <ChartStateDisplay
            isLoading={isLoading}
            isError={isError}
            error={error}
            chartData={chartData}
            refetch={refetch}
        >
            <Line options={chartOptions} data={chartData} />
        </ChartStateDisplay>
      </div>

      <div id="evolution-chart-description" className="sr-only">
        Este gráfico exibe a evolução das entradas e saídas financeiras ao longo dos últimos 6 meses.
        As entradas são representadas pela linha verde e as saídas pela linha vermelha.
      </div>

      {!isLoading && !isError && chartData && chartData.datasets.some(dataset => dataset.data.length > 0) && (
        <ChartLegend items={legendItems} />
      )}
    </ChartContainer>
    </ErrorBoundary>
  );
});

export default EvolutionChart;
