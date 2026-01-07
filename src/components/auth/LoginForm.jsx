import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useTheme } from "../../contexts/ThemeContext";

export default function LoginForm({ onToggleView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Obter funções do tema
  const { theme, toggleTheme, isDark } = useTheme();

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
      {/* Cabeçalho com botão de tema */}
      <div className="auth-header">
        <div className="auth-header-top">
          <h1>Gideon Finance</h1>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
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
          <div className="error-message">
            <span className="error-icon">⚠️</span>
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
