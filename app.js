// --- CONFIGURAÇÃO DO SUPABASE ---
// Cole suas chaves aqui (mantenha as aspas)
const SUPABASE_URL = 'https://kpajxjpliyqclkmdowbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OURRIqDVKngWfW8rOfJdQw_OyQFczHm';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

let transactions = [];
let user = null;

// --- AUTENTICAÇÃO ---
const Auth = {
    async init() {
        const { data } = await supabaseClient.auth.getSession();
        user = data.session?.user;
        
        // Listener: Monitora se entrou ou saiu
        supabaseClient.auth.onAuthStateChange((event, session) => {
            user = session?.user;
            Auth.toggleScreen();
            if(user) {
                document.getElementById('user-email').innerText = user.email;
                DataManager.load(); // Carrega dados DO USUÁRIO
            }
        });
        Auth.toggleScreen();
    },

    toggleScreen() {
        if (user) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app-content').style.display = 'block';
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('app-content').style.display = 'none';
        }
    },

    async loginOrRegister(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const msg = document.getElementById('login-msg');
        const btn = document.getElementById('login-btn');

        btn.innerText = "Carregando...";
        
        // 1. Tenta Login
        const { error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });
        
        if (!loginError) {
            btn.innerText = "Sucesso!";
            return; // O listener vai lidar com o resto
        }

        // 2. Se falhar (usuário não existe?), tenta Cadastrar
        if (loginError.message.includes("Invalid login")) {
             // Tenta criar conta
             const { error: signupError } = await supabaseClient.auth.signUp({ email, password });
             if (signupError) {
                 msg.style.color = "red";
                 msg.innerText = "Erro: " + signupError.message;
             } else {
                 msg.style.color = "#10b981";
                 msg.innerText = "Conta criada! Entrando...";
                 // Faz login automático após criar
                 await supabaseClient.auth.signInWithPassword({ email, password });
             }
        } else {
            msg.style.color = "red";
            msg.innerText = "Erro: " + loginError.message;
        }
        btn.innerText = "Entrar / Cadastrar";
    },

    async logout() {
        await supabaseClient.auth.signOut();
        window.location.reload();
    }
}

// --- DADOS (CLOUD) ---
const DataManager = {
    async load() {
        if(!user) return;
        // O Supabase filtra automaticamente pelo user_id graças ao RLS que criamos
        const { data, error } = await supabaseClient
            .from('transactions')
            .select('*')
            .order('date', { ascending: true });

        if (!error) {
            transactions = data;
            App.reload();
        }
    },

    async add(transaction) {
        // Adiciona user_id automaticamente na inserção
        const { error } = await supabaseClient
            .from('transactions')
            .insert([{ ...transaction, user_id: user.id }]); // Garante o ID

        if (error) alert("Erro ao salvar: " + error.message);
        else DataManager.load();
    },

    async remove(id) {
        if(confirm("Excluir?")) {
            const { error } = await supabaseClient.from('transactions').delete().eq('id', id);
            if (!error) {
                DataManager.load();
                App.closeDetails();
            }
        }
    }
}

// --- CATEGORIAS (Local) ---
const Category = {
    list: JSON.parse(localStorage.getItem("gideon.categories")) || ["Alimentação", "Moradia", "Transporte", "Salário", "Lazer"],
    load() {
        const select = document.getElementById('category');
        select.innerHTML = '<option value="" disabled selected>Categoria</option>';
        Category.list.forEach(cat => {
            const op = document.createElement('option');
            op.value = op.innerText = cat;
            select.appendChild(op);
        });
    },
    create() {
        const newCat = prompt("Nova categoria:");
        if (newCat) {
            Category.list.push(newCat);
            localStorage.setItem("gideon.categories", JSON.stringify(Category.list));
            Category.load();
            document.getElementById('category').value = newCat;
        }
    }
}

// --- UI & UTILS ---
const Utils = {
    formatCurrency: val => Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    formatDate: d => d.split("-").reverse().join("/"),
    getMonthIndex: d => {
         const date = new Date(d);
         return new Date(date.valueOf() + date.getTimezoneOffset() * 60000).getMonth();
    }
}

const App = {
    init() { Auth.init(); Category.load(); },
    reload() { App.updateSummary(); App.updateCards(); },
    
    updateSummary() {
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const tbody = document.getElementById('monthly-summary-body');
        tbody.innerHTML = "";
        
        let mData = months.map(name => ({ name, income: 0, expense: 0, balance: 0 }));
        
        transactions.forEach(t => {
            const idx = Utils.getMonthIndex(t.date);
            const val = Number(t.amount);
            if(val > 0) mData[idx].income += val; else mData[idx].expense += val;
            mData[idx].balance += val;
        });

        mData.forEach((m, i) => {
            const tr = document.createElement('tr');
            tr.onclick = () => App.showDetails(i, m.name);
            tr.style.opacity = (m.income === 0 && m.expense === 0) ? "0.3" : "1";
            tr.style.cursor = "pointer";
            tr.innerHTML = `<td>${m.name}</td><td class="text-right text-green">${Utils.formatCurrency(m.income)}</td><td class="text-right text-red">${Utils.formatCurrency(m.expense)}</td><td class="text-right ${m.balance >= 0 ? 'text-green' : 'text-red'}"><strong>${Utils.formatCurrency(m.balance)}</strong></td>`;
            tbody.appendChild(tr);
        });
    },

    updateCards() {
        let inc = 0, exp = 0;
        transactions.forEach(t => { if(t.amount > 0) inc += t.amount; else exp += t.amount; });
        document.getElementById('incomeDisplay').innerText = Utils.formatCurrency(inc);
        document.getElementById('expenseDisplay').innerText = Utils.formatCurrency(exp);
        document.getElementById('display-total').innerText = Utils.formatCurrency(inc + exp);
    },

    showDetails(idx, name) {
        const filtered = transactions.filter(t => Utils.getMonthIndex(t.date) === idx);
        const section = document.getElementById('transaction-details');
        document.getElementById('month-title').innerText = `Extrato de ${name}`;
        const tbody = document.querySelector('#data-table tbody');
        tbody.innerHTML = "";
        
        section.classList.remove('hidden');
        if(filtered.length === 0) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">Vazio</td></tr>`;
        else filtered.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${t.description}</td><td>${t.category}</td><td class="${t.amount > 0 ? 'text-green' : 'text-red'}">${Utils.formatCurrency(t.amount)}</td><td>${Utils.formatDate(t.date)}</td><td style="text-align:right"><span style="cursor:pointer" onclick="DataManager.remove(${t.id})">✕</span></td>`;
            tbody.appendChild(tr);
        });
        section.scrollIntoView({ behavior: 'smooth' });
    },
    closeDetails() { document.getElementById('transaction-details').classList.add('hidden'); }
}

// Event Listeners
document.getElementById('login-form').addEventListener('submit', Auth.loginOrRegister);

document.getElementById('form-transaction').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="type"]:checked').value;
    let amount = Number(document.getElementById('amount').value);
    if(type === 'expense') amount *= -1;
    
    DataManager.add({
        description: document.getElementById('description').value,
        amount: amount,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        type: type
    });
    
    document.getElementById('description').value = "";
    document.getElementById('amount').value = "";
    document.getElementById('date').value = "";
});

// Start
App.init();