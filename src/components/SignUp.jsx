import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <div className="auth-container">
        <div className="auth-card">
            
            <h2 className="auth-title">Criar Conta</h2>
            <p className="auth-subtitle">Preencha seus dados para começar</p>

            <form>
                {/* Inputs com o visual novo */}
                <input type="text" placeholder="Nome Completo" className="auth-input" required />
                <input type="email" placeholder="Email" defaultValue="heitorkbb@gmail.com" className="auth-input" required />
                <input type="password" placeholder="Senha" className="auth-input" required />
                
                {/* Selects adaptados ao visual arredondado */}
                <select className="auth-input" defaultValue="">
                    <option value="" disabled>Gênero</option>
                    <option value="m">Masculino</option>
                    <option value="f">Feminino</option>
                    <option value="o">Outro</option>
                </select>

                <button type="submit" className="auth-btn">CADASTRAR</button>
            </form>

            <div className="auth-footer">
                Já tem conta? 
                {/* O Link para a rota de login */}
                <Link to="/" className="auth-link">Conecte-se</Link>
            </div>
        </div>
    </div>
  );
}

export default SignUp;