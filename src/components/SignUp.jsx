import { useState } from "react";
import { supabase } from "../services/supabase";

export default function SignUp({ onToggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Conta criada com sucesso! Verifique seu email para confirmar.");
    }
    
    setLoading(false);
  }

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <div className="auth-logo">Criar Conta</div>
        <p className="auth-subtitle">Comece a gerenciar suas finanças hoje</p>
      </div>

      <form onSubmit={handleSignUp} className="auth-form">
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
          minLength={6}
        />

        {error && (
          <div className="text-red text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green text-center">
            {success}
          </div>
        )}

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <div className="auth-footer">
        <span className="text-muted">Já tem uma conta? </span>
        <span className="auth-link" onClick={onToggleView}>
          Fazer login
        </span>
      </div>
    </div>
  );
}