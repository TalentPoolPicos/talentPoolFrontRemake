'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import styles from '@/styles/ThemeToggle.module.css';

export default function ThemeToggle() {
  const themeCtx = useTheme() as any;
  const theme: 'light' | 'dark' | 'auto' = themeCtx?.theme ?? 'light';
  const toggle: () => void =
    typeof themeCtx?.toggle === 'function' ? themeCtx.toggle : () => {};
  const setTheme: ((t: 'light' | 'dark') => void) | undefined =
    typeof themeCtx?.setTheme === 'function' ? themeCtx.setTheme : undefined;

  // Resolve "auto" para o tema efetivo
  const [prefersDark, setPrefersDark] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setPrefersDark(mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;

  const isLight = effectiveTheme === 'light';
  const nextLabel = isLight ? 'Alternar para tema escuro' : 'Alternar para tema claro';

  const onClick = useCallback(() => {
    const next = isLight ? 'dark' : 'light';
    if (setTheme) setTheme(next);
    else toggle();

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch {}
    }
  }, [isLight, setTheme, toggle]);

  const Icon = useMemo(() => (isLight ? Moon : Sun), [isLight]);

  return (
    <button
      className={styles.themeToggle}
      onClick={onClick}
      aria-label={nextLabel}
      title={nextLabel}
      type="button"
    >
      <span key={effectiveTheme} className={styles.fadeScale} aria-hidden>
        <Icon size={20} />
      </span>
    </button>
  );
}
