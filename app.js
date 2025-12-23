// --- CONFIGURAÇÃO E DADOS ---
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("gideon.finances:v1")) || [];
    },
    set(transactions) {
        localStorage.setItem("gideon.finances:v1", JSON.stringify(transactions));
    }
}

// Dados iniciais para não começar vazio (Backup do seu Notion)
const initialData = [
    { description: "Salário", amount: 1354.05, date: "2025-10-30" },
    { description: "Despesas Diversas", amount: -662.62, date: "2025-10-30" },
    { description: "Renda Extra", amount: 330.00, date: "2025-11-05" },
    { description: "Gastos Novembro", amount: -730.10, date: "2025-11-05" },
];

// Se for o primeiro acesso, carrega os dados iniciais
let transactions = Storage.get();
if (transactions.length === 0) {
    transactions = initialData;
    Storage.set(transactions);
}

// --- UTILITÁRIOS ---
const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        return signal + value; // Remove o sinal duplo se o toLocaleString já colocar
    },
    
    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    // Retorna o índice do mês (0 = Janeiro, 10 = Novembro) baseado na data "AAAA-MM-DD"
    getMonthFromDate(dateString) {
        const date = new Date(dateString);
        // Pequeno fix para fuso horário não pular o dia/mês
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctDate = new Date(date.getTime() + userTimezoneOffset);
        return correctDate.getMonth();
    }
}

// --- LÓGICA PRINCIPAL ---
const App = {
    init() {
        App.updateSummaryTable();
        App.updateGlobalBalance();
    },

    reload() {
        App.init();
    },

    // 1. Recalcula a tabela de Resumo Mensal baseada nas transações reais
    updateSummaryTable() {
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const tableBody = document.getElementById('monthly-summary-body');
        tableBody.innerHTML = "";

        // Cria um array zerado para acumular os valores
        let monthlyData = months.map(name => ({ name, income: 0, expense: 0, balance: 0 }));

        // Percorre TODAS as transações e soma no mês correto
        transactions.forEach(t => {
            const monthIndex = Utils.getMonthFromDate(t.date);
            const amount = Number(t.amount);

            if (amount > 0) {
                monthlyData[monthIndex].income += amount;
            } else {
                monthlyData[monthIndex].expense += amount;
            }
            monthlyData[monthIndex].balance += amount;
        });

        // Desenha a tabela
        monthlyData.forEach((m, index) => {
            const tr = document.createElement('tr');
            // Torna a linha clicável
            tr.onclick = () => App.showMonthDetails(index, m.name);
            tr.style.cursor = "pointer";
            
            // Define cor do saldo
            const balanceClass = m.balance >= 0 ? 'text-green' : 'text-red';
            const rowOpacity = (m.income === 0 && m.expense === 0) ? "0.5" : "1"; // Deixa meses vazios mais apagados

            tr.innerHTML = `
                <td style="opacity: ${rowOpacity}; font-weight: 500;">${m.name} <small style="font-size: 0.7rem">🔍</small></td>
                <td class="text-right text-green" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.income)}</td>
                <td class="text-right text-red" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.expense)}</td>
                <td class="text-right ${balanceClass}" style="font-weight: bold; opacity: ${rowOpacity}">
                    ${Utils.formatCurrency(m.balance)}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    },

    // 2. Atualiza o Card Grandão lá em cima
    updateGlobalBalance() {
        const total = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
        const displayTotal = document.getElementById('display-total');
        
        displayTotal.innerText = Utils.formatCurrency(total);
        displayTotal.style.color = total >= 0 ? "#2ecc71" : "#e74c3c";
    },

    // 3. Mostra os detalhes quando clica no mês
    showMonthDetails(monthIndex, monthName) {
        const detailsSection = document.getElementById('transaction-details');
        const detailsTitle = document.getElementById('month-title');
        const detailsBody = document.querySelector('#data-table tbody');

        // Filtra transações daquele mês
        const filtered = transactions.filter(t => Utils.getMonthFromDate(t.date) === monthIndex);
        
        // Exibe a seção
        detailsSection.style.display = "block";
        detailsTitle.innerText = `Extrato de ${monthName}`;
        detailsBody.innerHTML = "";

        if(filtered.length === 0) {
            detailsBody.innerHTML = `<tr><td colspan="4" style="text-align:center">Nenhuma movimentação neste mês.</td></tr>`;
            // Rola a tela até os detalhes
            detailsSection.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        filtered.forEach((t, indexInFiltered) => {
            const tr = document.createElement('tr');
            const cssClass = t.amount > 0 ? "text-green" : "text-red";
            
            // Precisamos encontrar o índice real no array principal para poder deletar
            const originalIndex = transactions.indexOf(t);

            tr.innerHTML = `
                <td>${t.description}</td>
                <td class="${cssClass}">${Utils.formatCurrency(t.amount)}</td>
                <td>${Utils.formatDate(t.date)}</td>
                <td>
                    <img onclick="Transaction.remove(${originalIndex})" src="./assets/minus.svg" alt="Remover" style="cursor: pointer; width: 20px;"> 
                    </td>
            `;
            detailsBody.appendChild(tr);
        });

        // Rola a tela até os detalhes
        detailsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- GERENCIAMENTO DE TRANSAÇÕES ---
const Transaction = {
    add(transaction) {
        transactions.push(transaction);
        Storage.set(transactions);
        App.reload();
        // Tenta reabrir os detalhes do mês da transação adicionada
        const monthIdx = Utils.getMonthFromDate(transaction.date);
        // App.showMonthDetails(monthIdx, "Recente"); // Opcional
    },

    remove(index) {
        transactions.splice(index, 1);
        Storage.set(transactions);
        App.reload();
        // Esconde detalhes após remover para evitar erro de índice visual
        document.getElementById('transaction-details').style.display = "none";
    }
}

// --- FORMULÁRIO E MODAL ---
const Modal = {
    open() { document.querySelector('.modal-overlay').classList.add('active'); },
    close() { document.querySelector('.modal-overlay').classList.remove('active'); }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();
        amount = Number(amount);
        return { description, amount, date };
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    }
}

// Inicialização
App.init();