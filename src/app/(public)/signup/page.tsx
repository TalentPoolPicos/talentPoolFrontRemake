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
  name?: string;
  description?: string;
};

export default function StudentSignUpPage() {
  const router = useRouter();
  const { signUp, isLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
    const p = password.trim();
    const n = name.trim();

    return (
      u.length >= 3 &&
      isValidEmail(e) &&
      p.length >= 6 &&
      n.length >= 2 &&
      !fieldErrors.username &&
      !fieldErrors.email &&
      !fieldErrors.password &&
      !fieldErrors.name &&
      !fieldErrors.description
    );
  }, [username, email, password, name, fieldErrors]);

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

      if (field === 'password') {
        const p = password;
        if (!p.trim()) next.password = 'Senha é obrigatória';
        else if (p.length < 6) next.password = 'Mínimo de 6 caracteres';
        else delete next.password;
      }

      if (field === 'name') {
        const n = name.trim();
        if (!n) next.name = 'Nome é obrigatório';
        else if (n.length < 2) next.name = 'Mínimo de 2 caracteres';
        else delete next.name;
      }

      if (field === 'description') {
        const d = description.trim();
        if (d && d.length > 500) next.description = 'Máximo de 500 caracteres';
        else delete next.description;
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

    (['username', 'email', 'password', 'name', 'description'] as (keyof FieldErrors)[])
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
        password,
        name: name.trim(),
        description: description.trim() || undefined,
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
                autoComplete="new-password"
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
            <label htmlFor="description">Descrição (opcional)</label>
            <div className={styles.inputWrapper}>
              <textarea
                id="description"
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (error) clearError(); }}
                onBlur={() => validateField('description')}
                placeholder="Fale brevemente sobre você"
                rows={4}
                className={`${fieldErrors.description ? styles.inputError : ''} ${styles.textarea}`}
                disabled={loading}
                aria-invalid={!!fieldErrors.description}
                aria-describedby={fieldErrors.description ? 'description-error' : undefined}
              />
            </div>
            {fieldErrors.description && (
              <p id="description-error" className={styles.fieldError}>{fieldErrors.description}</p>
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
