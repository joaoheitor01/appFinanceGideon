const STORAGE_KEY = 'dev.finances:transactions';

const Storage = {
    get() {
        const data = localStorage.getItem(STORAGE_KEY);
        return JSON.parse(data) || [];
    },

    set(transactions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        if (!transaction.id) {
            transaction.id = Date.now();
        }
        this.all.push(transaction);
        Storage.set(this.all);
        console.log("Gideon: Transação registrada com sucesso.", transaction);
    },

    remove(index) {
        this.all.splice(index, 1);
        Storage.set(this.all);
        console.log(`Gideon: Transação removida do índice ${index}.`);
    },

    getMonthlySummary(year) {
        const monthlySummary = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            income: 0,
            expense: 0,
            balance: 0
        }));

        this.all.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            if (transactionDate.getFullYear() === year) {
                const month = transactionDate.getMonth();
                if (transaction.type === 'income') {
                    monthlySummary[month].income += transaction.amount;
                } else {
                    monthlySummary[month].expense += transaction.amount;
                }
            }
        });

        monthlySummary.forEach(monthData => {
            monthData.balance = monthData.income - monthData.expense;
        });

        return monthlySummary;
    }
};

const Utils = {
    formatAmount(value) {
        value = Number(value);
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    getMonthName(monthIndex) {
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return months[monthIndex];
    }
};

const DOM = {
    transactionsContainer: document.querySelector('#transactions-list'),
    monthlySummaryContainer: document.querySelector('#monthly-summary-body'),

    addTransaction(transaction, index) {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        DOM.transactionsContainer.appendChild(li);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.type === "expense" ? "expense" : "income";
        const amount = Utils.formatAmount(Math.abs(transaction.amount));

        const html = `
            <div class="transaction-info">
                <span class="description">${transaction.description}</span>
                <span class="date">${Utils.formatDate(transaction.date)}</span>
            </div>
            <div class="transaction-values">
                <span class="${CSSclass}">${transaction.type === 'expense' ? '- ' : ''}${amount}</span>
                <img onclick="App.removeTransaction(${index})" class="remove-icon" src="https://img.icons8.com/ios-glyphs/30/e92929/trash--v1.png" alt="Remover" style="cursor: pointer; width: 20px; vertical-align: middle; margin-left: 10px;">
            </div>
        `;

        return html;
    },

    updateBalance() {
        let income = 0;
        let expense = 0;

        Transaction.all.forEach(transaction => {
            const amount = Number(transaction.amount);

            if (transaction.type === 'income') {
                income += amount;
            } else {
                expense += amount;
            }
        });

        const total = income - expense;

        document.getElementById('display-income').innerHTML = Utils.formatAmount(income);
        document.getElementById('display-expense').innerHTML = Utils.formatAmount(expense);
        document.getElementById('display-total').innerHTML = Utils.formatAmount(total);
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
        if (Transaction.all.length === 0) {
            const li = document.createElement('li');
            li.classList.add('empty-state');
            li.innerText = 'Nenhuma transação registrada.';
            DOM.transactionsContainer.appendChild(li);
        }
    },

    renderMonthlySummary(summary) {
        DOM.monthlySummaryContainer.innerHTML = "";
        summary.forEach(monthData => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${Utils.getMonthName(monthData.month)}</td>
                <td class="text-right positive">${Utils.formatAmount(monthData.income)}</td>
                <td class="text-right negative">${Utils.formatAmount(monthData.expense)}</td>
                <td class="text-right ${monthData.balance >= 0 ? 'positive' : 'negative'}">${Utils.formatAmount(monthData.balance)}</td>
            `;
            DOM.monthlySummaryContainer.appendChild(tr);
        });
    }
};

const App = {
    init() {
        App.reload();
    },

    reload() {
        DOM.clearTransactions();
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });
        DOM.updateBalance();
        const currentYear = new Date().getFullYear();
        const monthlySummary = Transaction.getMonthlySummary(currentYear);
        DOM.renderMonthlySummary(monthlySummary);
    },

    addTransaction(transaction) {
        Transaction.add(transaction);
        App.reload();
        modalOverlay.classList.add('hidden');
        document.getElementById('form-transaction').reset();
    },

    removeTransaction(index) {
        Transaction.remove(index);
        App.reload();
    }
};

const modalOverlay = document.getElementById('modal-overlay');
const settingsOverlay = document.getElementById('settings-overlay');

document.getElementById('btn-add-transaction').addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
    console.log("Abrir modal nova transação");
});

document.getElementById('modal-close').addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
});

document.getElementById('btn-settings').addEventListener('click', () => {
    settingsOverlay.classList.remove('hidden');
    console.log("Abrir configurações");
});

document.getElementById('settings-close').addEventListener('click', () => {
    settingsOverlay.classList.add('hidden');
});

document.getElementById('form-transaction').addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Submissão do formulário detectada");

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const type = document.querySelector('input[name="type"]:checked').value;

    if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const transaction = {
        description,
        amount: parseFloat(amount),
        date,
        type
    };

    App.addTransaction(transaction);
});

document.getElementById('btn-export').addEventListener('click', () => {
    console.log("Solicitado exportação de dados");
    const data = JSON.stringify(Transaction.all, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.json';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('file-import').addEventListener('change', (event) => {
    console.log("Arquivo selecionado para importação");
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const transactions = JSON.parse(e.target.result);
                Storage.set(transactions);
                App.reload();
            } catch (error) {
                alert("Erro ao importar o arquivo. Verifique se o formato é JSON válido.");
                console.error("Erro de parse no JSON:", error);
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('btn-clear').addEventListener('click', () => {
    console.log("Solicitada limpeza total");
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
        Storage.set([]);
        App.reload();
    }
});

App.init();