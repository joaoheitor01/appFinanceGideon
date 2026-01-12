document.addEventListener('DOMContentLoaded', () => {
    const summaryBody = document.getElementById('monthly-summary-body');

    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function generateMockData() {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const data = [];

        for (let i = 0; i < 12; i++) {
            const income = Math.random() * 5000 + 1000;
            const expense = Math.random() * 4000 + 500;
            const balance = income - expense;
            data.push({
                month: months[i],
                income: income,
                expense: expense,
                balance: balance
            });
        }
        return data;
    }

    function showMonthDetails(monthData) {
        alert(
            `Detalhes para ${monthData.month}:\n` +
            `Entradas: ${formatCurrency(monthData.income)}\n` +
            `Saídas: ${formatCurrency(monthData.expense)}\n` +
            `Saldo: ${formatCurrency(monthData.balance)}`
        );
    }

    const mockData = generateMockData();

    mockData.forEach(data => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${data.month}</td>
            <td class="text-right positive">${formatCurrency(data.income)}</td>
            <td class="text-right negative">${formatCurrency(data.expense)}</td>
            <td class="text-right ${data.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(data.balance)}</td>
        `;

        row.addEventListener('click', () => showMonthDetails(data));
        summaryBody.appendChild(row);
    });

    // --- Chart.js Doughnut Chart ---

    const ctx = document.getElementById('categoryChart');
    if (ctx) {
        const categoryChartData = {
            labels: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação'],
            datasets: [{
                label: 'Distribuição por Categoria',
                data: [30, 15, 10, 8, 7, 5], // Mock data
                backgroundColor: [
                    '#22c55e', // Alimentação (verde)
                    '#3b82f6', // Moradia (azul)
                    '#8b5cf6', // Transporte (roxo)
                    '#f59e0b', // Lazer (laranja)
                    '#ef4444', // Saúde (vermelho)
                    '#06b6d4', // Educação (ciano)
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
            }]
        };

        const categoryChartConfig = {
            type: 'doughnut',
            data: categoryChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.chart.getDatasetMeta(0).total;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                }
            }
        };

        const categoryChart = new Chart(ctx, categoryChartConfig);

        /**
         * Atualiza o gráfico com novos dados.
         * @param {number[]} newData - Array com os novos valores para cada categoria.
         */
        function updateChart(newData) {
            categoryChart.data.datasets[0].data = newData;
            categoryChart.update();
        }

        // Exemplo de como usar a função updateChart após 3 segundos
        setTimeout(() => {
            // Valores de exemplo para atualização
            const updatedData = [10, 20, 5, 25, 15, 25]; 
            console.log("Atualizando dados do gráfico...", updatedData);
            updateChart(updatedData);
        }, 3000);
    }
});
