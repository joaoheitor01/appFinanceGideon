// src/components/SignUp.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Importante para o link funcionar sem recarregar

const SignUp = () => {
  return (
    <div className="container">
        <div className="card">
            <h2>Criar Conta</h2>
            <p className="subtitle">Preencha seus dados para começar.</p>

            <form>
                <div className="input-group">
                    <input type="text" placeholder="Nome Completo" required />
                </div>

                <div className="input-group">
                    <input type="email" placeholder="Email" defaultValue="heitorkbb@gmail.com" required />
                </div>

                <div className="input-group">
                    <input type="password" placeholder="Senha" required />
                </div>

                <div className="input-group">
                    <input type="date" required />
                </div>

                <div className="input-group">
                    <select defaultValue="">
                        <option value="" disabled>Gênero</option>
                        <option value="m">Masculino</option>
                        <option value="f">Feminino</option>
                        <option value="o">Outro</option>
                    </select>
                </div>

                <div className="input-group">
                    <select defaultValue="">
                        <option value="" disabled>Uso</option>
                        <option value="pessoal">Pessoal</option>
                        <option value="profissional">Profissional</option>
                    </select>
                </div>

                <button type="submit" className="btn-cadastrar">CADASTRAR</button>
            </form>

            <p className="footer-text">
                Já tem conta? 
                {/* Se não usar react-router-dom, troque Link por <a href="/login"> */}
                <Link to="/login" className="link-login"> Fazer login</Link>
            </p>
        </div>
    </div>
  );
}

export default SignUp;