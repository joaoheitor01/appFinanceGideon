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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <h2>Entrar no Gideon</h2>
        <p>Bem-vindo de volta, Capitão.</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Entrando...' : 'ACESSAR SISTEMA'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Ainda não tem conta?{' '}
          <span 
            onClick={onToggleView} 
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Criar Conta
          </span>
        </p>
      </div>
    </div>
  );
}