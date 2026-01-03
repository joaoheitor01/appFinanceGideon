import { useState } from "react";
import { supabase } from "../services/supabase";

export default function Login({ onToggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  }

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <div className="auth-logo">Gideon Finance</div>
        <p className="auth-subtitle">Gerencie suas finanças com clareza e simplicidade</p>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Senha"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <div className="text-red text-center">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="auth-footer">
        <span className="text-muted">Novo por aqui? </span>
        <span className="auth-link" onClick={onToggleView}>
          Criar conta
        </span>
      </div>
    </div>
  );
}