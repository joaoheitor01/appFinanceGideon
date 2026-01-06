import React, { useState } from "react";
import { supabase } from "./services/supabase";
import { useTheme } from "./contexts/ThemeContext";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "personal"
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Obter funções do tema
  const { theme, toggleTheme, isDark } = useTheme();

  // Calcular data mínima (18 anos atrás) e máxima (100 anos atrás)
  const calculateDateLimits = () => {
    const today = new Date();
    
    // Data mínima (usuário deve ter pelo menos 18 anos)
    const minDate = new Date(today);
    minDate.setFullYear(today.getFullYear() - 18);
    
    // Data máxima (usuário não pode ter mais de 100 anos)
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() - 100);
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0]
    };
  };

  const dateLimits = calculateDateLimits();

  // Handler para mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular força da senha em tempo real
    if (name === 'password') {
      calculatePasswordStrength(value);
    }

    // Limpar erros quando o usuário começa a digitar
    if (error) setError("");
  };

  // Calcular força da senha
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    // Comprimento mínimo
    if (password.length >= 8) strength += 25;
    
    // Tem letra maiúscula
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Tem letra minúscula
    if (/[a-z]/.test(password)) strength += 25;
    
    // Tem número
    if (/[0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  };

  // Obter cor da barra de força da senha
  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 75) return "var(--accent-green)";
    if (passwordStrength >= 50) return "#f59e0b"; // Amarelo
    if (passwordStrength >= 25) return "#f97316"; // Laranja
    return "var(--accent-red)"; // Vermelho
  };

  // Obter texto da força da senha
  const getPasswordStrengthText = () => {
    if (passwordStrength >= 75) return "Forte";
    if (passwordStrength >= 50) return "Média";
    if (passwordStrength >= 25) return "Fraca";
    return "Muito fraca";
  };

  // Validar formulário
  const validateForm = () => {
    // Validar nome completo
    if (!formData.fullName.trim()) {
      setError("Por favor, digite seu nome completo");
      return false;
    }

    if (formData.fullName.trim().split(" ").length < 2) {
      setError("Por favor, digite seu nome e sobrenome");
      return false;
    }

    // Validar data de nascimento
    if (!formData.birthDate) {
      setError("Por favor, selecione sua data de nascimento");
      return false;
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < 18) {
        setError("Você deve ter pelo menos 18 anos para se cadastrar");
        return false;
      }
    } else if (age < 18) {
      setError("Você deve ter pelo menos 18 anos para se cadastrar");
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, digite um email válido");
      return false;
    }

    // Validar senha
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    // Validar termos
    if (!acceptedTerms) {
      setError("Você deve aceitar os termos de serviço e política de privacidade");
      return false;
    }

    return true;
  };

  // Função para cadastrar usuário
  const handleSignUp = async (e) => {
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
      // 1. Cadastrar usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            account_type: formData.accountType
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        // Tratamento de erros específicos do Auth
        if (authError.message.includes("already registered")) {
          throw new Error("Este email já está cadastrado. Tente fazer login.");
        }
        if (authError.message.includes("invalid_email")) {
          throw new Error("Email inválido. Verifique o formato.");
        }
        throw authError;
      }

      // 2. Se o usuário foi criado com sucesso, criar perfil
      if (authData.user) {
        const profileData = {
          id: authData.user.id,
          full_name: formData.fullName.trim(),
          birth_date: formData.birthDate,
          email: formData.email.trim(),
          account_type: formData.accountType,
          plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          console.warn("Erro ao criar perfil (não crítico):", profileError);
          // Não lançamos erro aqui, pois o usuário já foi criado no Auth
        }
      }

      // 3. Mensagem de sucesso
      setSuccess(`
        ✅ Cadastro realizado com sucesso!
        
        Um email de confirmação foi enviado para ${formData.email}.
        
        Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
        
        Você será redirecionado para o login em 10 segundos...
      `);

      // 4. Redirecionar para login após 10 segundos
      setTimeout(() => {
        setFormData({
          fullName: "",
          birthDate: "",
          email: "",
          password: "",
          confirmPassword: "",
          accountType: "personal"
        });
        setAcceptedTerms(false);
        setPasswordStrength(0);
        // onToggleView(); // This will be handled by the router
      }, 10000);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      // Mensagens de erro amigáveis
      let errorMessage = error.message || "Erro ao criar conta. Tente novamente.";
      
      if (errorMessage.includes("network")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar barra de força da senha
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    return (
      <div className="password-strength-container">
        <div className="password-strength-bar">
          <div 
            className="password-strength-fill"
            style={{
              width: `${passwordStrength}%`,
              backgroundColor: getPasswordStrengthColor()
            }}
          />
        </div>
        <div className="password-strength-text">
          Força da senha: <span style={{ color: getPasswordStrengthColor() }}>
            {getPasswordStrengthText()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`auth-card fade-in ${theme}`}>
      {/* Cabeçalho com botão de tema */}
      <div className="auth-header">
        <div className="auth-header-top">
          <h1>Criar Conta</h1>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            title={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            aria-label={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            type="button"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
        <p className="auth-subtitle">Preencha seus dados para começar</p>
      </div>

      {/* Formulário de Cadastro */}
      <form onSubmit={handleSignUp} className="auth-form">
        {/* Nome Completo */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Nome Completo *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Digite seu nome completo"
            className="auth-input"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        {/* Data de Nascimento */}
        <div className="form-group">
          <label htmlFor="birthDate" className="form-label">
            Data de Nascimento *
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            className="auth-input"
            value={formData.birthDate}
            onChange={handleInputChange}
            min={dateLimits.max}
            max={dateLimits.min}
            required
            disabled={loading}
          />
          <small className="form-hint">
            Você deve ter pelo menos 18 anos
          </small>
        </div>

        {/* Tipo de Conta */}
        <div className="form-group">
          <label className="form-label">
            Tipo de Conta *
          </label>
          <div className="account-type-selector">
            <button
              type="button"
              className={`account-type-btn ${formData.accountType === 'personal' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, accountType: 'personal' }))}
              disabled={loading}
            >
              <div className="account-icon">👤</div>
              <div className="account-info">
                <span className="account-title">Pessoal</span>
                <span className="account-desc">Para uso individual</span>
              </div>
            </button>
            <button
              type="button"
              className={`account-type-btn ${formData.accountType === 'business' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, accountType: 'business' }))}
              disabled={loading}
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
          <label htmlFor="email" className="form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="seu@email.com"
            className="auth-input"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        {/* Senha */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Senha *
          </label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Crie uma senha segura"
              className="auth-input password-input"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {/* Barra de força da senha */}
          {renderPasswordStrength()}
          
          <small className="form-hint">
            Mínimo 6 caracteres. Recomendamos usar letras maiúsculas, minúsculas e números.
          </small>
        </div>

        {/* Confirmar Senha */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar Senha *
          </label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Digite a senha novamente"
              className="auth-input password-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
              title={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          
          {/* Indicador de correspondência de senha */}
          {formData.confirmPassword && (
            <small 
              className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}
            >
              {formData.password === formData.confirmPassword 
                ? "✅ Senhas coincidem" 
                : "❌ Senhas não coincidem"
              }
            </small>
          )}
        </div>

        {/* Termos e Condições */}
        <div className="form-group terms-group">
          <label className="terms-label">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
              required
            />
            <span className="terms-text">
              Eu concordo com os{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="terms-link">
                Política de Privacidade
              </a>{" "}*
            </span>
          </label>
        </div>

        {/* Mensagens de Erro/Sucesso */}
        {error && (
          <div className="message error-message">
            <div className="message-icon">⚠️</div>
            <div className="message-content">{error}</div>
          </div>
        )}

        {success && (
          <div className="message success-message">
            <div className="message-icon">✅</div>
            <div className="message-content">
              {success.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Botão de Cadastro */}
        <button
          type="submit"
          className="auth-button submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processando...
            </>
          ) : (
            "Criar Conta"
          )}
        </button>
      </form>

      {/* Link para Login */}
      <div className="auth-footer">
        <span className="text-muted">Já tem uma conta? </span>
        <Link to="/login" className="auth-link">
          Fazer login
        </Link>
      </div>
    </div>
  );
}
