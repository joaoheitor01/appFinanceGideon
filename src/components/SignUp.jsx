import { useState } from "react";
import { supabase } from "../services/supabase";

export default function SignUp({ onToggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignUp(e) {
    e.preventDefault();
    await supabase.auth.signUp({ email, password });
  }

  return (
    <main>
      <h1>Criar Conta</h1>
      <form onSubmit={handleSignUp}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} />
        <button>Cadastrar</button>
      </form>
      <p onClick={onToggleView}>Já tenho conta</p>
    </main>
  );
}
