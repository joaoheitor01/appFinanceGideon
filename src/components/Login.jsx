// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function Login({ onToggleView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2>Gideon Finance</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Bem-vindo de volta.</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          
          <button type="submit">
            {loading ? 'CARREGANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
          Novo aqui? <span onClick={onToggleView} style={{ color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Criar Conta</span>
        </div>
      </div>
    </div>
  );
}