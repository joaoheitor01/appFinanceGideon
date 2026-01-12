import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { BanknotesIcon, SunIcon, MoonIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('O email é obrigatório'),
  password: Yup.string().required('A senha é obrigatória'),
});

const LoginPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogin = async (values, { setSubmitting }) => {
    setError('');
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        throw error;
      }
      navigate('/'); // Redireciona para o dashboard em caso de sucesso
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao fazer login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark-primary p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4 text-primary-color">
             <BanknotesIcon className="h-8 w-8" />
             <h1 className="h2">Gideon Finance</h1>
          </div>
          <h2 className="h3 text-text-primary">Entrar na sua conta</h2>
          <p className="body text-secondary mt-2">Bem-vindo de volta! Gerencie suas finanças.</p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="input-field"
                />
                <ErrorMessage name="email" component="div" className="text-danger-color text-sm mt-1" />
              </div>
              
              <div className="input-group">
                 <label htmlFor="password" className="input-label">Senha</label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Sua senha"
                  className="input-field"
                />
                <ErrorMessage name="password" component="div" className="text-danger-color text-sm mt-1" />
              </div>

              {error && (
                <div className="bg-danger-color bg-opacity-20 border border-danger-color text-danger-color px-4 py-3 rounded-md relative" role="alert">
                  <strong className="font-bold">Erro: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                    <span>ACESSANDO...</span>
                  </>
                ) : "ACESSAR CONTA"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6">
          <span className="text-secondary">Ainda não tem conta? </span>
          <Link to="/register" className="font-semibold text-secondary-color hover:underline">
            Criar Conta
          </Link>
        </div>

         <div className="absolute top-4 right-4">
            <button 
                onClick={toggleTheme} 
                className="btn btn-outline"
                title={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            >
                {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;