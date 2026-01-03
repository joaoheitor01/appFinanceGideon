import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import "../styles/dashboard.css";

export default function Dashboard({ session, userPlan }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("income");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchTransactions();
  }, [month]);

  async function fetchTransactions() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let finalValue = parseFloat(value);
    if (type === "expense") finalValue = -Math.abs(finalValue);

    await supabase.from("transactions").insert([
      {
        user_id: session.user.id,
        description,
        value: finalValue,
      },
    ]);

    setDescription("");
    setValue("");
    fetchTransactions();
  }

  const filtered = transactions.filter((t) => {
    const date = new Date(t.created_at);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  const income = filtered
    .filter((t) => t.value > 0)
    .reduce((a, b) => a + b.value, 0);

  const expense = filtered
    .filter((t) => t.value < 0)
    .reduce((a, b) => a + b.value, 0);

  const balance = income + expense;

  return (
    <main>
      <h1>Gideon Finance</h1>

      <section className="summary">
        <p><strong>Entradas:</strong> R$ {income.toFixed(2)}</p>
        <p><strong>Saídas:</strong> R$ {Math.abs(expense).toFixed(2)}</p>
        <p><strong>Saldo:</strong> R$ {balance.toFixed(2)}</p>
      </section>

      <section className="form-section">
        <h2>Novo Lançamento</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />

          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Entrada</option>
            <option value="expense">Saída</option>
          </select>

          <button type="submit">Salvar</button>
        </form>
      </section>

      <section className="table-section">
        <h2>Movimentações</h2>

        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td className={t.value < 0 ? "neg" : "pos"}>
                  R$ {t.value.toFixed(2)}
                </td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer>
        Plano atual: <strong>{userPlan}</strong>
      </footer>
    </main>
  );
}
