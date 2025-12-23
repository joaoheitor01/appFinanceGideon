// --- DADOS E STORAGE ---
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("gideon.finances:v2")) || [];
    },
    set(transactions) {
        localStorage.setItem("gideon.finances:v2", JSON.stringify(transactions));
    }
}

// Dados iniciais
const initialData = [
    { description: "Salário Inicial", amount: 1354.05, date: "2025-10-30" },
    { description: "Aluguel", amount: -662.62, date: "2025-10-30" },
];

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
        return signal + value;
    },
    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
    getMonthFromDate(dateString) {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctDate = new Date(date.getTime() + userTimezoneOffset);
        return correctDate.getMonth();
    }
}

// --- APP PRINCIPAL ---
const App = {
    init() {
        App.updateSummaryTable();
        App.updateCards();
    },
    reload() {
        App.init();
    },
    
    // Atualiza a tabela de Meses
    updateSummaryTable() {
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const tableBody = document.getElementById('monthly-summary-body');
        tableBody.innerHTML = "";

        let monthlyData = months.map(name => ({ name, income: 0, expense: 0, balance: 0 }));

        transactions.forEach(t => {
            const monthIndex = Utils.getMonthFromDate(t.date);
            const amount = Number(t.amount);
            if (amount > 0) monthlyData[monthIndex].income += amount;
            else monthlyData[monthIndex].expense += amount;
            monthlyData[monthIndex].balance += amount;
        });

        monthlyData.forEach((m, index) => {
            const tr = document.createElement('tr');
            tr.onclick = () => App.showMonthDetails(index, m.name);
            tr.style.cursor = "pointer";
            
            const balanceClass = m.balance >= 0 ? 'text-green' : 'text-red';
            const rowOpacity = (m.income === 0 && m.expense === 0) ? "0.5" : "1";

            tr.innerHTML = `
                <td style="opacity: ${rowOpacity}">${m.name}</td>
                <td class="text-right text-green" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.income)}</td>
                <td class="text-right text-red" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.expense)}</td>
                <td class="text-right ${balanceClass}" style="opacity: ${rowOpacity}; font-weight: bold;">
                    ${Utils.formatCurrency(m.balance)}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    },

    // Atualiza os Cards do topo
    updateCards() {
        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if(t.amount > 0) income += t.amount;
            else expense += t.amount;
        });

        const total = income + expense;

        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(income);
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(expense);
        document.getElementById('display-total').innerHTML = Utils.formatCurrency(total);
        document.getElementById('display-total').style.color = total >= 0 ? "#2ecc71" : "#e74c3c";
    },

    // Mostra detalhes ao clicar no mês
    showMonthDetails(monthIndex, monthName) {
        const detailsSection = document.getElementById('transaction-details');
        const detailsTitle = document.getElementById('month-title');
        const detailsBody = document.querySelector('#data-table tbody');

        const filtered = transactions.filter(t => Utils.getMonthFromDate(t.date) === monthIndex);
        
        detailsSection.style.display = "block";
        detailsTitle.innerText = `Extrato de ${monthName}`;
        detailsBody.innerHTML = "";

        if(filtered.length === 0) {
            detailsBody.innerHTML = `<tr><td colspan="4" style="text-align:center">Sem movimentos.</td></tr>`;
        } else {
            filtered.forEach(t => {
                const originalIndex = transactions.indexOf(t);
                const tr = document.createElement('tr');
                const cssClass = t.amount > 0 ? "text-green" : "text-red";
                tr.innerHTML = `
                    <td>${t.description}</td>
                    <td class="${cssClass}">${Utils.formatCurrency(t.amount)}</td>
                    <td>${Utils.formatDate(t.date)}</td>
                    <td>
                         <span style="cursor:pointer; font-size: 1.2rem;" onclick="Transaction.remove(${originalIndex})">🗑️</span>
                    </td>
                `;
                detailsBody.appendChild(tr);
            });
        }
        detailsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

const Transaction = {
    add(transaction) {
        transactions.push(transaction);
        Storage.set(transactions);
        App.reload();
    },
    remove(index) {
        transactions.splice(index, 1);
        Storage.set(transactions);
        App.reload();
    }
}

// --- MODAL ---
const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(event) {
        if(event) event.preventDefault(); // Impede recarregar se for link
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

// --- FORMULÁRIO ---
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        // Pega qual radio button está marcado
        const type = document.querySelector('input[name="type"]:checked').value;
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            type: type
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date, type } = Form.getValues();
        amount = Number(amount);

        // Se for Despesa, transforma em negativo
        if(type === 'expense') {
            amount = amount * -1;
        }

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

App.init();

// Adiciona evento ao formulário
const formElement = document.querySelector("#form-transaction");
if(formElement) formElement.addEventListener("submit", Form.submit);