// src/components/SignUp.jsx
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function SignUp({ onToggleView }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    usage: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            gender: formData.gender,
            usage_type: formData.usage
          }
        }
      });

      if (error) throw error;
      alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
      onToggleView(); // Vai para a tela de login
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="card">
        <h2>Criar Conta</h2>
        <p>Preencha seus dados para começar.</p>
        
        <form onSubmit={handleSignUp}>
          <input name="fullName" placeholder="Nome Completo" onChange={handleChange} required />
          <input name="email" type="email" placeholder="E-mail" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Senha" onChange={handleChange} required />
          
          <div className="row">
            <input name="birthDate" type="date" onChange={handleChange} required />
          </div>
          
          <div className="row">
            <select name="gender" onChange={handleChange} required>
              <option value="">Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
            <select name="usage" onChange={handleChange} required>
              <option value="">Uso</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Empresarial">Empresarial</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Já tem conta?{' '}
          <span 
            onClick={onToggleView} 
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Fazer Login
          </span>
        </p>
      </div>
    </div>
  );
}