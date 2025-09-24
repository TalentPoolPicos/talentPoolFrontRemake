'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/Auth.module.css';
import { isAxiosError } from '@/helpers/isAxiosError';

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
};

export default function StudentSignUpPage() {
  const router = useRouter();
  const { signUp, isLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isLoggedIn) router.replace('/profile');
  }, [isLoggedIn, router]);

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const isFormValid = useMemo(() => {
    const u = username.trim();
    const e = email.trim();
    const n = name.trim();
    const p = password.trim();
    const c = confirmPassword.trim();

    return (
      u.length >= 3 &&
      isValidEmail(e) &&
      n.length >= 2 &&
      p.length >= 6 &&
      c.length >= 6 &&
      p === c &&
      !fieldErrors.username &&
      !fieldErrors.email &&
      !fieldErrors.password &&
      !fieldErrors.confirmPassword &&
      !fieldErrors.name
    );
  }, [username, email, name, password, confirmPassword, fieldErrors]);

  function validateField(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      const next: FieldErrors = { ...prev };

      if (field === 'username') {
        const u = username.trim();
        if (!u) next.username = 'Usuário é obrigatório';
        else if (u.length < 3) next.username = 'Mínimo de 3 caracteres';
        else delete next.username;
      }

      if (field === 'email') {
        const e = email.trim();
        if (!e) next.email = 'Email é obrigatório';
        else if (!isValidEmail(e)) next.email = 'Email inválido';
        else delete next.email;
      }

      if (field === 'name') {
        const n = name.trim();
        if (!n) next.name = 'Nome é obrigatório';
        else if (n.length < 2) next.name = 'Mínimo de 2 caracteres';
        else delete next.name;
      }

      if (field === 'password') {
        const p = password.trim();
        if (!p) next.password = 'Senha é obrigatória';
        else if (p.length < 6) next.password = 'Mínimo de 6 caracteres';
        else delete next.password;

        // também revalida a confirmação ao mudar a senha
        const c = confirmPassword.trim();
        if (!c) next.confirmPassword = 'Confirmação de senha é obrigatória';
        else if (p !== c) next.confirmPassword = 'As senhas não conferem';
        else if (c.length < 6) next.confirmPassword = 'Mínimo de 6 caracteres';
        else delete next.confirmPassword;
      }

      if (field === 'confirmPassword') {
        const p = password.trim();
        const c = confirmPassword.trim();
        if (!c) next.confirmPassword = 'Confirmação de senha é obrigatória';
        else if (c.length < 6) next.confirmPassword = 'Mínimo de 6 caracteres';
        else if (p !== c) next.confirmPassword = 'As senhas não conferem';
        else delete next.confirmPassword;
      }

      return next;
    });
  }

  function clearError() {
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    (['username', 'email', 'name', 'password', 'confirmPassword'] as (keyof FieldErrors)[])
      .forEach(validateField);

    if (!isFormValid) {
      setError('Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
        // descrição removida conforme solicitado
      });

      router.replace('/profile');
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 409) {
          setError('Nome de usuário ou email já existe.');
        } else if (status === 422) {
          setError('Falha ao criar usuário (validação do servidor).');
        } else if (status === 400) {
          setError('Dados inválidos. Verifique e tente novamente.');
        } else {
          setError(`Erro ${status} ao cadastrar. Tente novamente mais tarde.`);
        }
      } else {
        setError('Erro inesperado ao cadastrar. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authWrapper}>
      <main className={styles.authContainer}>
        <header className={styles.authHeader}>
          <h1 className={styles.authTitle}>Criar conta</h1>
          <p className={styles.authSubtitle}>Preencha seus dados para continuar</p>
        </header>

        {error && (
          <div className={styles.errorAlert} role="alert" aria-live="polite">
            <span className={styles.errorText}>{error}</span>
            <button
              onClick={clearError}
              className={styles.errorClose}
              aria-label="Fechar"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="username">Usuário</label>
            <div className={styles.inputWrapper}>
              <input
                id="username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('username')}
                type="text"
                placeholder="Digite seu usuário"
                className={`${fieldErrors.username ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="username"
                aria-invalid={!!fieldErrors.username}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
              />
              {!fieldErrors.username && username.trim().length >= 3 && (
                <svg className={styles.iconCheck} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {fieldErrors.username && (
              <p id="username-error" className={styles.fieldError}>{fieldErrors.username}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('email')}
                type="email"
                placeholder="seuemail@ufpi.edu.br"
                className={`${fieldErrors.email ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {!fieldErrors.email && isValidEmail(email) && (
                <svg className={styles.iconCheck} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {fieldErrors.email && (
              <p id="email-error" className={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name">Nome completo</label>
            <div className={styles.inputWrapper}>
              <input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('name')}
                type="text"
                placeholder="Seu nome"
                className={`${fieldErrors.name ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="name"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {!fieldErrors.name && name.trim().length >= 2 && (
                <svg className={styles.iconCheck} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {fieldErrors.name && (
              <p id="name-error" className={styles.fieldError}>{fieldErrors.name}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                className={`${fieldErrors.password ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={styles.revealBtn}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className={styles.revealIcon} aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className={styles.revealIcon} aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  </svg>
                )}
              </button>

              {!fieldErrors.password && password.trim().length >= 6 && (
                <svg className={styles.iconCheck} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {fieldErrors.password && (
              <p id="password-error" className={styles.fieldError}>{fieldErrors.password}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm">Confirmar senha</label>
            <div className={styles.inputWrapper}>
              <input
                id="confirm"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repita sua senha"
                className={`${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className={styles.revealBtn}
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                title={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirm ? (
                  <svg viewBox="0 0 24 24" className={styles.revealIcon} aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className={styles.revealIcon} aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  </svg>
                )}
              </button>

              {!fieldErrors.confirmPassword &&
                confirmPassword.trim().length >= 6 &&
                password.trim().length >= 6 &&
                confirmPassword.trim() === password.trim() && (
                  <svg className={styles.iconCheck} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirm-error" className={styles.fieldError}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button className={styles.submitButton} type="submit" disabled={loading || !isFormValid}>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Já tem uma conta?{' '}
          <Link href="/signin" className={styles.link}>
            Fazer login
          </Link>
        </p>
      </main>
    </div>
  );
}
