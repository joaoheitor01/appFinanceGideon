import { useState } from "react";
import { supabase } from "../services/supabase";

export default function Login({ onToggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    await supabase.auth.signInWithPassword({ email, password });
  }

  return (
    <main>
      <h1>Gideon Finance</h1>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />
        <button>Entrar</button>
      </form>
      <p onClick={onToggleView}>Criar conta</p>
    </main>
  );
}
