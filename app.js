// --- CONFIGURAÇÃO DO SUPABASE ---
// Cole suas chaves aqui (mantenha as aspas)
const SUPABASE_URL = 'https://kpajxjpliyqclkmdowbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OURRIqDVKngWfW8rOfJdQw_OyQFczHm';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CATEGORIAS (Mantemos local por enquanto ou podemos migrar depois) ---
const Storage = {
    getCategories() { 
        return JSON.parse(localStorage.getItem("gideon.categories")) || ["Alimentação", "Moradia", "Transporte", "Salário", "Lazer", "Saúde", "Outros"];
    },
    setCategories(data) { localStorage.setItem("gideon.categories", JSON.stringify(data)); }
}

let transactions = [];

// --- GERENCIAMENTO DE DADOS (CLOUD) ---
const DataManager = {
    async load() {
        // Busca dados do Supabase
        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .order('date', { ascending: true }); // Ordena por data

        if (error) {
            console.error("Erro ao carregar:", error);
            alert("Erro de conexão. Verifique o console.");
        } else {
            transactions = data;
            App.reload();
        }
    },

    async add(transaction) {
        // Envia para o Supabase
        const { error } = await supabaseClient
            .from('transactions')
            .insert([transaction]);

        if (error) {
            alert("Erro ao salvar na nuvem: " + error.message);
        } else {
            DataManager.load(); // Recarrega tudo para atualizar a tela
        }
    },

    async remove(id) {
        if(confirm("Deseja realmente excluir?")) {
            // Deleta do Supabase pelo ID
            const { error } = await supabaseClient
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
            } else {
                DataManager.load();
                App.closeDetails();
            }
        }
    }
}

// --- CATEGORIAS ---
const Category = {
    list: Storage.getCategories(),

    load() {
        const select = document.getElementById('category');
        select.innerHTML = '<option value="" disabled selected>Categoria</option>';
        Category.list.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.innerHTML = cat;
            select.appendChild(option);
        });
    },

    create() {
        const newCat = prompt("Digite o nome da nova categoria:");
        if (newCat && newCat.trim() !== "") {
            Category.list.push(newCat.trim());
            Storage.setCategories(Category.list);
            Category.load();
            document.getElementById('category').value = newCat.trim();
        }
    }
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
        return new Date(date.getTime() + userTimezoneOffset).getMonth();
    }
}

// --- APP PRINCIPAL ---
const App = {
    init() {
        Category.load();
        DataManager.load(); // Carrega do Banco de Dados
    },
    reload() { 
        App.updateSummaryTable();
        App.updateCards();
    },

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
            
            const rowOpacity = (m.income === 0 && m.expense === 0) ? "0.3" : "1";
            const balanceClass = m.balance >= 0 ? 'text-green' : 'text-red';

            tr.innerHTML = `
                <td style="opacity: ${rowOpacity}">${m.name}</td>
                <td class="text-right text-green" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.income)}</td>
                <td class="text-right text-red" style="opacity: ${rowOpacity}">${Utils.formatCurrency(m.expense)}</td>
                <td class="text-right ${balanceClass}" style="opacity: ${rowOpacity}; font-weight: 600;">
                    ${Utils.formatCurrency(m.balance)}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    },

    updateCards() {
        let income = 0, expense = 0;
        transactions.forEach(t => {
            if(t.amount > 0) income += t.amount;
            else expense += t.amount;
        });
        document.getElementById('incomeDisplay').innerText = Utils.formatCurrency(income);
        document.getElementById('expenseDisplay').innerText = Utils.formatCurrency(expense);
        
        const total = income + expense;
        const totalDisplay = document.getElementById('display-total');
        totalDisplay.innerText = Utils.formatCurrency(total);
        totalDisplay.style.color = total >= 0 ? "var(--text-primary)" : "var(--accent-red)";
    },

    showMonthDetails(monthIndex, monthName) {
        const detailsSection = document.getElementById('transaction-details');
        const detailsTitle = document.getElementById('month-title');
        const detailsBody = document.querySelector('#data-table tbody');

        const filtered = transactions.filter(t => Utils.getMonthFromDate(t.date) === monthIndex);
        
        detailsSection.classList.remove('hidden');
        detailsTitle.innerText = `Extrato de ${monthName}`;
        detailsBody.innerHTML = "";

        if(filtered.length === 0) {
            detailsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-secondary)">Sem transações neste mês.</td></tr>`;
        } else {
            filtered.forEach(t => {
                // Aqui usamos o ID do Supabase para deletar
                const tr = document.createElement('tr');
                const amountClass = t.amount > 0 ? "text-green" : "text-red";
                
                tr.innerHTML = `
                    <td>${t.description}</td>
                    <td><span style="background: var(--bg-input); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem">${t.category || 'Geral'}</span></td>
                    <td class="${amountClass}">${Utils.formatCurrency(t.amount)}</td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem">${Utils.formatDate(t.date)}</td>
                    <td style="text-align: right;">
                         <span style="cursor:pointer; color: var(--text-secondary); font-size: 1rem;" onclick="DataManager.remove(${t.id})" title="Excluir">✕</span>
                    </td>
                `;
                detailsBody.appendChild(tr);
            });
        }
        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    closeDetails() {
        document.getElementById('transaction-details').classList.add('hidden');
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    category: document.querySelector('select#category'),

    getValues() {
        const type = document.querySelector('input[name="type"]:checked').value;
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            category: Form.category.value,
            type: type
        }
    },

    validateFields() {
        const { description, amount, date, category } = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" || category === "") {
            throw new Error("Preencha todos os campos!");
        }
    },

    formatValues() {
        let { description, amount, date, category, type } = Form.getValues();
        amount = Number(amount);
        if(type === 'expense') amount = amount * -1;
        return { description, amount, date, category, type };
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
            DataManager.add(transaction); // Salva na Nuvem
            Form.clearFields();
        } catch (error) {
            alert(error.message);
        }
    }
}

App.init();
document.querySelector("#form-transaction").addEventListener("submit", Form.submit);