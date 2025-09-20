'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'auto' | 'light' | 'dark';
const STORAGE_KEY = 'theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('auto');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'auto';
    setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    const root = document.documentElement;

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = () => root.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      apply();
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(prev => (prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto'));
  }, []);

  return { theme, setTheme, toggle };
}
