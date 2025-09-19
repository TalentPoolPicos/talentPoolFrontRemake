'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/Auth.module.css';
import { isAxiosError } from '@/helpers/isAxiosError';

type FieldErrors = {
  username?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isLoggedIn) router.replace('/profile');
  }, [isLoggedIn, router]);

  const isFormValid = useMemo(() => {
    const u = username.trim();
    const p = password.trim();
    return (
      u.length >= 3 &&
      p.length >= 6 &&
      !fieldErrors.username &&
      !fieldErrors.password
    );
  }, [username, password, fieldErrors]);

  function validateField(field: 'username' | 'password') {
    setFieldErrors((prev) => {
      const next: FieldErrors = { ...prev };
      if (field === 'username') {
        const u = username.trim();
        if (!u) next.username = 'Usuário é obrigatório';
        else if (u.length < 3) next.username = 'Mínimo de 3 caracteres';
        else delete next.username;
      }
      if (field === 'password') {
        const p = password;
        if (!p.trim()) next.password = 'Senha é obrigatória';
        else if (p.length < 6) next.password = 'Mínimo de 6 caracteres';
        else delete next.password;
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

    validateField('username');
    validateField('password');

    if (!isFormValid) {
      setError('Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ username: username.trim(), password });
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
          <h1 className={styles.authTitle}>Bem-vindo</h1>
          <p className={styles.authSubtitle}>Entre com suas credenciais</p>
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
            <label htmlFor="password">Senha</label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('password')}
                type="password"
                placeholder="Digite sua senha"
                className={`${fieldErrors.password ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="current-password"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
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

          <button className={styles.submitButton} type="submit" disabled={loading || !isFormValid}>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className={styles.switchAuth}>
          Não tem uma conta?{' '}
          <Link href="/signup" className={styles.link}>
            Cadastre-se
          </Link>
        </p>
      </main>
    </div>
  );
}
