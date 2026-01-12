import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { UserCircleIcon, SunIcon, MoonIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ProgressIndicator = ({ currentStep }) => (
    <div className="flex items-center justify-center w-full mb-8">
        <div className="flex items-center">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-secondary-color' : 'text-text-secondary'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-secondary-color' : 'border-border-color'}`}>
                    1
                </div>
                <span className="ml-2 font-semibold">Conta</span>
            </div>
            <div className={`flex-auto border-t-2 mx-4 ${currentStep >= 2 ? 'border-secondary-color' : 'border-border-color'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-secondary-color' : 'text-text-secondary'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-secondary-color' : 'border-border-color'}`}>
                    2
                </div>
                <span className="ml-2 font-semibold">Perfil</span>
            </div>
        </div>
    </div>
);

const step1ValidationSchema = Yup.object({
  fullName: Yup.string().required('O nome completo é obrigatório'),
  email: Yup.string().email('Email inválido').required('O email é obrigatório'),
  password: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('A senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória'),
});

const step2ValidationSchema = Yup.object({
  username: Yup.string().required('O nome de usuário é obrigatório'),
  birthDate: Yup.date().required('A data de nascimento é obrigatória'),
  gender: Yup.string().required('O gênero é obrigatório'),
  accountType: Yup.string().required('O tipo de conta é obrigatório'),
  acceptedTerms: Yup.boolean().oneOf([true], 'Você deve aceitar os Termos e Condições'),
});

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleRegister = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    try {
      const { fullName, email, password, ...profileData } = values;
      const { data, error: signUpError } = await signUp(email, password, {
          full_name: fullName,
          username: profileData.username,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          account_type: profileData.accountType,
      });

      if (signUpError) throw signUpError;
      
      setSuccess('Cadastro realizado com sucesso! Um email de confirmação foi enviado. Redirecionando para o login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) => {
      setError(err.message || 'Falha no cadastro. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark-primary p-4">
      <div className="card w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="h2 text-text-primary">Criar Conta</h1>
          <p className="body text-secondary mt-2">
            {step === 1 ? 'Preencha seus dados para começar.' : 'Complete seu perfil para continuar.'}
          </p>
        </div>

        <ProgressIndicator currentStep={step} />

        <Formik
          initialValues={{
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            birthDate: '',
            gender: '',
            accountType: 'personal',
            acceptedTerms: false,
          }}
          validationSchema={step === 1 ? step1ValidationSchema : step2ValidationSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting, values, errors, touched, validateForm }) => (
            <Form className="space-y-6">
              {step === 1 && (
                <>
                  <div className="input-group">
                    <label className="input-label" htmlFor="fullName">Nome Completo</label>
                    <Field id="fullName" name="fullName" type="text" className="input-field" placeholder="Seu nome completo" />
                    <ErrorMessage name="fullName" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="email">Email</label>
                    <Field id="email" name="email" type="email" className="input-field" placeholder="teste@gmail.com" />
                    <ErrorMessage name="email" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="password">Senha</label>
                    <Field id="password" name="password" type="password" className="input-field" placeholder="Crie uma senha segura" />
                    <ErrorMessage name="password" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="confirmPassword">Confirmar Senha</label>
                    <Field id="confirmPassword" name="confirmPassword" type="password" className="input-field" placeholder="Confirme sua senha" />
                    <ErrorMessage name="confirmPassword" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="input-group items-center">
                      <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                          <UserCircleIcon className="w-24 h-24 text-text-secondary" />
                          <span className="text-sm text-secondary-color mt-2">Adicionar foto</span>
                      </label>
                      <Field type="file" id="photo-upload" name="photo" className="hidden"/>
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="username">Nome de usuário</label>
                    <Field id="username" name="username" type="text" className="input-field" placeholder="Ex: jasminimo" />
                    <ErrorMessage name="username" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="birthDate">Data de Nascimento</label>
                    <Field id="birthDate" name="birthDate" type="date" className="input-field" />
                    <ErrorMessage name="birthDate" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="gender">Gênero</label>
                    <Field as="select" id="gender" name="gender" className="input-field">
                      <option value="" disabled>Selecione...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                      <option value="prefer_not_to_say">Prefiro não informar</option>
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                   <div className="input-group">
                    <label className="input-label" htmlFor="accountType">Uso da conta</label>
                    <Field as="select" id="accountType" name="accountType" className="input-field">
                      <option value="personal">Pessoal</option>
                      <option value="business">Empresarial</option>
                    </Field>
                    <ErrorMessage name="accountType" component="div" className="text-danger-color text-sm mt-1" />
                  </div>
                   <div className="flex items-center">
                        <Field type="checkbox" id="acceptedTerms" name="acceptedTerms" className="h-4 w-4 rounded border-gray-300 text-secondary-color focus:ring-secondary-color" />
                        <label htmlFor="acceptedTerms" className="ml-2 block text-sm text-text-secondary">Eu li e concordo com os <Link to="/terms" className="font-semibold text-secondary-color hover:underline">Termos e Condições</Link>.</label>
                        <ErrorMessage name="acceptedTerms" component="div" className="text-danger-color text-sm mt-1" />
                    </div>
                </>
              )}
              
              {success && <div className="bg-primary-color bg-opacity-20 border border-primary-color text-primary-color px-4 py-3 rounded-md">{success}</div>}
              {error && <div className="bg-danger-color bg-opacity-20 border border-danger-color text-danger-color px-4 py-3 rounded-md">{error}</div>}

              <div className="flex gap-4 mt-6">
                {step === 2 && (
                  <button type="button" className="btn btn-outline w-full" onClick={() => setStep(1)} disabled={isSubmitting}>
                    Voltar
                  </button>
                )}
                
                {step === 1 && (
                    <button type="button" className="btn btn-primary w-full" onClick={async () => {
                        const errors = await validateForm();
                        if (Object.keys(errors).length === 0) {
                            setStep(2);
                        }
                    }}>
                        CONTINUAR
                    </button>
                )}
                {step === 2 && (
                    <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                                <span>CADASTRANDO...</span>
                            </>
                        ) : 'CADASTRAR'}
                    </button>
                )}
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6">
          <span className="text-secondary">Já tem conta? </span>
          <Link to="/login" className="font-semibold text-secondary-color hover:underline">
            Fazer Login
          </Link>
        </div>
        
        <div className="absolute top-4 right-4">
            <button onClick={toggleTheme} className="btn btn-outline">
                {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
