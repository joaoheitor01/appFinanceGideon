import { useState } from "react";
import { supabase } from "../services/supabase";

export default function SignUp({ onToggleView }) {
  // Estados para os campos do formulário
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("personal"); // "personal" ou "business"
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // Para formulário em múltiplos passos se necessário

  // Calcular idade mínima (18 anos)
  const getMinBirthDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  // Calcular idade máxima (100 anos)
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  // Validar senha
  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      isValid: password.length >= minLength,
      errors: [
        password.length >= minLength ? null : `Mínimo ${minLength} caracteres`,
        hasUpperCase ? null : "Pelo menos uma letra maiúscula",
        hasLowerCase ? null : "Pelo menos uma letra minúscula",
        hasNumbers ? null : "Pelo menos um número"
      ].filter(Boolean)
    };
  };

  // Validar formulário
  const validateForm = () => {
    if (!fullName.trim()) {
      setError("Por favor, insira seu nome completo");
      return false;
    }

    if (!birthDate) {
      setError("Por favor, insira sua data de nascimento");
      return false;
    }

    // Verificar se é maior de 18 anos
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      setError("É necessário ter pelo menos 18 anos para se cadastrar");
      return false;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Por favor, insira um email válido");
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Senha fraca. Requisitos: ${passwordValidation.errors.join(", ")}`);
      return false;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    return true;
  };

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validar formulário
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            account_type: accountType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      // 2. Criar perfil do usuário na tabela 'profiles'
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: fullName,
              birth_date: birthDate,
              email: email,
              account_type: accountType,
              plan: 'free', // Plano padrão
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) throw profileError;
      }

      setSuccess("Conta criada com sucesso! Verifique seu email para confirmar o cadastro.");
      
      // Resetar formulário após sucesso
      setTimeout(() => {
        setFullName("");
        setBirthDate("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAccountType("personal");
      }, 3000);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      setError(error.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card fade-in">
      <div className="auth-header">
        <div className="auth-logo">Criar Conta</div>
        <p className="auth-subtitle">Cadastre-se para começar a gerenciar suas finanças</p>
        
        {/* Indicador de progresso */}
        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Dados Pessoais</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Credenciais</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="auth-form">
        {/* Nome Completo */}
        <div className="form-group">
          <label className="form-label">Nome Completo *</label>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            className="auth-input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Data de Nascimento */}
        <div className="form-group">
          <label className="form-label">Data de Nascimento *</label>
          <input
            type="date"
            className="auth-input"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            min={getMaxBirthDate()}
            max={getMinBirthDate()}
            required
          />
          <small className="help-text">
            É necessário ter pelo menos 18 anos para se cadastrar
          </small>
        </div>

        {/* Tipo de Conta */}
        <div className="form-group">
          <label className="form-label">Uso da Conta *</label>
          <div className="account-type-selector">
            <button
              type="button"
              className={`account-type-btn ${accountType === 'personal' ? 'active' : ''}`}
              onClick={() => setAccountType('personal')}
            >
              <div className="account-icon">👤</div>
              <div className="account-info">
                <span className="account-title">Pessoal</span>
                <span className="account-desc">Para uso individual</span>
              </div>
            </button>
            <button
              type="button"
              className={`account-type-btn ${accountType === 'business' ? 'active' : ''}`}
              onClick={() => setAccountType('business')}
            >
              <div className="account-icon">🏢</div>
              <div className="account-info">
                <span className="account-title">Empresarial</span>
                <span className="account-desc">Para empresas</span>
              </div>
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            placeholder="seu@email.com"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Senha */}
        <div className="form-group">
          <label className="form-label">Senha *</label>
          <input
            type="password"
            placeholder="Crie uma senha segura"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          
          {/* Indicador de força da senha */}
          {password && (
            <div className="password-strength">
              <div className={`strength-bar ${password.length >= 6 ? 'active' : ''}`}></div>
              <div className={`strength-bar ${/[A-Z]/.test(password) ? 'active' : ''}`}></div>
              <div className={`strength-bar ${/[a-z]/.test(password) ? 'active' : ''}`}></div>
              <div className={`strength-bar ${/\d/.test(password) ? 'active' : ''}`}></div>
            </div>
          )}
          
          <small className="help-text">
            Mínimo 6 caracteres, com letras maiúsculas, minúsculas e números
          </small>
        </div>

        {/* Confirmar Senha */}
        <div className="form-group">
          <label className="form-label">Confirmar Senha *</label>
          <input
            type="password"
            placeholder="Digite a senha novamente"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <small className="error-text">As senhas não coincidem</small>
          )}
        </div>

        {/* Termos e Condições */}
        <div className="form-group terms-group">
          <label className="terms-label">
            <input type="checkbox" required />
            <span>
              Concordo com os <a href="/terms" className="terms-link">Termos de Serviço</a> e{" "}
              <a href="/privacy" className="terms-link">Política de Privacidade</a>
            </span>
          </label>
        </div>

        {/* Mensagens de erro/sucesso */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        {/* Botão de Cadastro */}
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Criando conta...
            </>
          ) : "Criar Conta"}
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