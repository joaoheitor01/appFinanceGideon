import React from 'react';

const SignUp = ({ onToggleView }) => {
  return (
    <div className="login-screen">
        <div className="login-card">
            
            <h2>Criar Conta</h2>
            <p className="subtitle">Preencha seus dados para começar</p>

            <form>
                <input type="text" placeholder="Nome Completo" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Senha" required />
                
                {/* O Select agora usa o mesmo estilo dos inputs */}
                <select defaultValue="" required>
                    <option value="" disabled>Gênero</option>
                    <option value="m">Masculino</option>
                    <option value="f">Feminino</option>
                    <option value="o">Outro</option>
                </select>

                <button type="submit">CADASTRAR</button>
            </form>

            <div className="login-footer">
                Já tem conta? 
                <span onClick={onToggleView}>Conecte-se</span>
            </div>
        </div>
    </div>
  );
}

export default SignUp;