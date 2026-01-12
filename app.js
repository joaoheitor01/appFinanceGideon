/* eslint-disable no-unused-vars */
/* ================================================================================= */
/* GIDEON FINANCE - APP.JS - LOGICA CENTRAL DA APLICAÇÃO                             */
/* ================================================================================= */

// IIFE (Immediately Invoked Function Expression) para encapsular o escopo
(function() {
    'use strict';

    /* =================================== */
    /* 1. ESTADO GLOBAL E MOCK DATA        */
    /* =================================== */
    const initialState = {
        user: {
            name: "Usuário Padrão",
            avatar: "https://via.placeholder.com/40",
            currency: "BRL",
        },
        categories: [
            { id: 1, name: "Alimentação", color: "#f97316" },
            { id: 2, name: "Moradia", color: "#3b82f6" },
            { id: 3, name: "Transporte", color: "#8b5cf6" },
            { id: 4, name: "Lazer", color: "#ef4444" },
            { id: 5, name: "Saúde", color: "#14b8a6" },
            { id: 6, name: "Educação", color: "#0ea5e9" },
            { id: 7, name: "Salário", color: "#22c55e", type: "income" },
            { id: 8, name: "Investimentos", color: "#a3e635", type: "income" },
        ],
        transactions: [],
        filters: {
            search: "",
            category: "all",
            dateRange: "this-month", // 'today', 'this-week', 'this-month', 'custom'
            startDate: null,
            endDate: null,
            sortBy: "date",
            sortDirection: "desc",
        },
        goals: [
            { id: 1, name: "Economia Mensal", current: 750, target: 1000 },
            { id: 2, name: "Limite de Gastos", current: 1800, target: 2500 },
        ],
    };

    let state;
    let charts = {};

    // --- Mock Data para Transações ---
    function generateMockTransactions() {
        const today = new Date();
        const mockTransactions = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i * 2); // Transações a cada 2 dias
            const isIncome = Math.random() > 0.85;
            const category = isIncome 
                ? state.categories.find(c => c.type === 'income')
                : state.categories.filter(c => c.type !== 'income')[Math.floor(Math.random() * 6)];

            mockTransactions.push({
                id: Date.now() + i,
                date: date.toISOString().split('T')[0],
                description: `Transação de Exemplo ${i + 1}`,
                amount: isIncome ? Math.random() * 2000 + 1000 : -(Math.random() * 150 + 10),
                categoryId: category.id,
            });
        }
        return mockTransactions;
    }

    /* =================================== */
    /* 2. PERSISTÊNCIA (LOCALSTORAGE)      */
    /* =================================== */
    function saveState() {
        try {
            localStorage.setItem('gideonFinanceState', JSON.stringify(state));
        } catch (error) {
            console.error("Erro ao salvar estado no LocalStorage:", error);
        }
    }

    function loadState() {
        try {
            const savedState = localStorage.getItem('gideonFinanceState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Garantir que as funções não estão no estado salvo
                delete parsedState.updateUI;
                state = { ...initialState, ...parsedState };
            } else {
                state = { ...initialState };
                state.transactions = generateMockTransactions();
            }
        } catch (error) {
            console.error("Erro ao carregar estado do LocalStorage:", error);
            state = { ...initialState };
            state.transactions = generateMockTransactions();
        }
    }

    /* =================================== */
    /* 3. FUNÇÕES UTILITÁRIAS              */
    /* =================================== */
    const formatCurrency = (value, currency = state.user.currency) => {
        if (typeof value !== 'number') value = 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Adiciona o timezone offset para corrigir a data
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    };

    const getCategoryById = (id) => {
        return state.categories.find(c => c.id === id) || { name: "Desconhecida", color: "#777" };
    };
    
    // --- Funções de Cálculo ---
    function calculateTotals(transactions) {
        return transactions.reduce((acc, t) => {
            if (t.amount > 0) acc.income += t.amount;
            else acc.expense += t.amount;
            acc.balance = acc.income + acc.expense;
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }

    function getFilteredAndSortedTransactions() {
        let filtered = [...state.transactions];

        // Filtro por busca
        if (state.filters.search) {
            filtered = filtered.filter(t => t.description.toLowerCase().includes(state.filters.search.toLowerCase()));
        }

        // Filtro por categoria
        if (state.filters.category !== 'all') {
            filtered = filtered.filter(t => t.categoryId === parseInt(state.filters.category));
        }

        // TODO: Implementar filtro por data

        // Ordenação
        filtered.sort((a, b) => {
            const key = state.filters.sortBy;
            const direction = state.filters.sortDirection === 'asc' ? 1 : -1;
            if (a[key] > b[key]) return direction;
            if (a[key] < b[key]) return -direction;
            return 0;
        });

        return filtered;
    }


    /* =================================== */
    /* 4. CRUD DE TRANSAÇÕES               */
    /* =================================== */
    function createTransaction(data) {
        // Validação simples
        if (!data.description || !data.amount || !data.date || !data.categoryId) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const newTransaction = {
            id: Date.now(),
            ...data,
            amount: parseFloat(data.amount)
        };
        state.transactions.unshift(newTransaction);
        saveState();
        updateDashboard();
    }

    function updateTransaction(id, data) {
        const index = state.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            state.transactions[index] = { ...state.transactions[index], ...data };
            saveState();
            updateDashboard();
        }
    }

    function deleteTransaction(id) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        updateDashboard();
    }


    /* =================================== */
    /* 5. ATUALIZAÇÃO DA UI (RENDER)       */
    /* =================================== */
    function updateDashboard() {
        // Esta função centraliza todas as atualizações de DOM
        console.log("Atualizando dashboard com o estado:", state);
        
        const filteredTransactions = getFilteredAndSortedTransactions();
        const totals = calculateTotals(filteredTransactions);

        updateSummaryCards(totals);
        updateTransactionTable(filteredTransactions);
        updateCategoryFilters();
        updateCharts(filteredTransactions);
        // Outras atualizações...
    }

    function updateSummaryCards(totals) {
        const incomeEl = document.getElementById('total-income');
        const expenseEl = document.getElementById('total-expense');
        const balanceEl = document.getElementById('total-balance');

        if(incomeEl) incomeEl.textContent = formatCurrency(totals.income);
        if(expenseEl) expenseEl.textContent = formatCurrency(totals.expense);
        if(balanceEl) balanceEl.textContent = formatCurrency(totals.balance);
    }
    
    function updateTransactionTable(transactions) {
        const tableBody = document.querySelector('#transactions-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = transactions.map(t => {
            const category = getCategoryById(t.categoryId);
            return `
                <tr>
                    <td><input type="checkbox" data-id="${t.id}" /></td>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.description}</td>
                    <td><span class="badge" style="background-color: ${category.color};">${category.name}</span></td>
                    <td class="${t.amount > 0 ? 'income' : 'expense'}">${formatCurrency(t.amount)}</td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" data-id="${t.id}">✏️</button>
                        <button class="action-btn delete-btn" data-id="${t.id}">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Adiciona event listeners aos novos botões
        addTableActionListeners();
    }

    function updateCategoryFilters() {
        const categoryList = document.querySelector('.category-list');
        if(!categoryList) return;

        const transactionCounts = state.transactions.reduce((acc, t) => {
            acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
            return acc;
        }, {});

        categoryList.innerHTML = `
            <li>
                <label><input type="checkbox" value="all" checked> Todas</label>
                <span class="count">(${state.transactions.length})</span>
            </li>
            ${state.categories.map(c => `
                <li>
                    <label><input type="checkbox" value="${c.id}"> ${c.name}</label>
                    <span class="count">(${transactionCounts[c.id] || 0})</span>
                </li>
            `).join('')}
        `;
    }

    /* =================================== */
    /* 6. GRÁFICOS (CHART.JS)              */
    /* =================================== */
    function initializeCharts() {
        // Carrega Chart.js do CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js carregado.');
            const transactions = getFilteredAndSortedTransactions();
            createEvolutionChart(transactions);
            createCategoryChart(transactions);
            updateDashboard(); // Renderiza os gráficos com dados iniciais
        };
        document.head.appendChild(script);
    }
    
    function updateCharts(transactions) {
        if (!window.Chart) return;
        updateEvolutionChart(transactions);
        updateCategoryChart(transactions);
    }

    function createEvolutionChart(transactions) {
        const ctx = document.getElementById('evolutionChart');
        if (!ctx) return;
        if(charts.evolution) charts.evolution.destroy();

        // Lógica para agrupar dados por mês
        const monthlyData = transactions.reduce((acc, t) => {
            const month = t.date.substring(0, 7); // YYYY-MM
            if (!acc[month]) acc[month] = { income: 0, expense: 0 };
            if (t.amount > 0) acc[month].income += t.amount;
            else acc[month].expense += Math.abs(t.amount);
            return acc;
        }, {});

        const labels = Object.keys(monthlyData).sort();
        const incomeData = labels.map(m => monthlyData[m].income);
        const expenseData = labels.map(m => monthlyData[m].expense);

        charts.evolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        borderColor: '#22c55e',
                        backgroundColor: '#22c55e20',
                        fill: true,
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444420',
                        fill: true,
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function createCategoryChart(transactions) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        if(charts.category) charts.category.destroy();

        const expenseTransactions = transactions.filter(t => t.amount < 0);
        const categoryData = expenseTransactions.reduce((acc, t) => {
            const category = getCategoryById(t.categoryId);
            acc[category.name] = (acc[category.name] || 0) + Math.abs(t.amount);
            return acc;
        }, {});

        charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: Object.keys(categoryData).map(name => state.categories.find(c=>c.name === name)?.color || '#777'),
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
    
    // Wrapper para atualização (para evitar recriar a todo momento)
    function updateEvolutionChart(transactions) {
        if (!charts.evolution) {
            createEvolutionChart(transactions);
            return;
        }
        // ... Lógica de atualização de dados do Chart.js
    }

    function updateCategoryChart(transactions) {
        if (!charts.category) {
            createCategoryChart(transactions);
            return;
        }
        // ... Lógica de atualização de dados do Chart.js
    }


    /* =================================== */
    /* 7. EVENT LISTENERS                  */
    /* =================================== */
    function initializeEventListeners() {
        // Toggle da Sidebar
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');
        
        if (sidebarToggle && sidebar && sidebarOverlay) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                sidebarOverlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            });
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.style.display = 'none';
            });
        }

        // Filtro de busca (genérico, pode estar em qualquer lugar)
        const searchInput = document.querySelector('input[placeholder*="Buscar"]');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.filters.search = e.target.value;
                updateDashboard();
            });
        }

        // Filtro de Categoria
        const categoryList = document.querySelector('.category-list');
        if (categoryList) {
            categoryList.addEventListener('change', (e) => {
                if(e.target.type === 'checkbox') {
                    // Lógica para lidar com seleção múltipla ou única.
                    // Por enquanto, simples filtro único.
                    state.filters.category = e.target.value;
                    updateDashboard();
                }
            });
        }

        // Ações da tabela (deleção/edição)
        addTableActionListeners();
        
        // Outros listeners para modais, etc.
    }

    function addTableActionListeners() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('Tem certeza que deseja excluir esta transação?')) {
                    deleteTransaction(id);
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                // Lógica para abrir o modal de edição
                console.log(`Abrir modal de edição para o ID: ${id}`);
            });
        });
    }

    /* =================================== */
    /* 8. INICIALIZAÇÃO DA APLICAÇÃO       */
    /* =================================== */
    function initializeApp() {
        // Carrega o estado salvo ou inicial
        loadState();

        // Inicia os event listeners
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM Carregado. Inicializando a aplicação...");
            
            // Injeta o HTML dos componentes onde for necessário (exemplo)
            // fetch('sidebar.html').then(res => res.text()).then(html => {
            //     document.getElementById('sidebar-container').innerHTML = html;
            // });

            initializeEventListeners();
            initializeCharts(); // Vai carregar o script e depois atualizar o dashboard
        });
    }

    // Inicia a aplicação
    initializeApp();

})();
