import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export default function SignUp({ onNavigateLogin }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
    usageType: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Salvar dados extras na tabela 'profiles'
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            gender: formData.gender,
            usage_type: formData.usageType
          }]);

        if (profileError) throw profileError;
        
        alert('Conta criada com sucesso! Faça login.');
        onNavigateLogin();
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen">
      <div className="login-card" style={{maxWidth: '450px'}}>
        <h2>Criar Conta</h2>
        <p>Preencha seus dados para começar.</p>
        
        <form onSubmit={handleSignUp}>
          <div className="input-container">
            <input type="text" name="fullName" placeholder="Nome Completo" onChange={handleChange} required />
          </div>
          <div className="input-container">
            <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required />
          </div>
          <div className="input-container">
            <input type="password" name="password" placeholder="Senha" onChange={handleChange} required />
          </div>
          
          <div className="input-container">
             <label style={{display:'block', textAlign:'left', color:'#aaa', fontSize:'12px', marginLeft:'15px'}}>Nascimento</label>
             <input type="date" name="birthDate" onChange={handleChange} required />
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'1rem'}}>
            <select name="gender" onChange={handleChange} required style={{borderRadius:'25px', height:'3.5rem', padding:'0 1rem', border:'none'}}>
              <option value="">Gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
            <select name="usageType" onChange={handleChange} required style={{borderRadius:'25px', height:'3.5rem', padding:'0 1rem', border:'none'}}>
              <option value="">Uso</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Empresarial">Empresarial</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
             {loading ? 'Criando...' : 'CADASTRAR'}
          </button>
        </form>

        <div className="login-footer">
          <span>Já tem conta? </span>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>Fazer Login</a>
        </div>
      </div>
    </div>
  );
}