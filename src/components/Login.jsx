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
    <div className="login-screen">
      <div className="login-card">
        <h2>Gideon Finance</h2> 
        <p className="subtitle">Login para continuar</p> 
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required /> 
          <input type="password" placeholder="Senha" onChange={(e) => setPassword(e.target.value)} required /> 
          <button type="submit">Entrar</button> 
        </form>
        <div className="login-footer">
          Ainda não tem conta? <span onClick={onToggleView}>Criar conta</span> 
        </div>
      </div>
    </div>
  );
}