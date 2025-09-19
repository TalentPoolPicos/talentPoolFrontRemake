'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import styles from '@/styles/SearchBar.module.css';

type Variant = 'desktop' | 'mobile';

type Props = {
  onSearch: (term: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  variant?: Variant;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export default function SearchBar({
  onSearch,
  value,
  onChange,
  placeholder = 'Pesquisar',
  variant = 'desktop',
  autoFocus = false,
  className,
  disabled = false,
  ariaLabel = 'Pesquisar',
}: Props) {
  const isControlled = typeof value === 'string';
  const [inner, setInner] = useState<string>(value ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isControlled) setInner(value ?? '');
  }, [isControlled, value]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const term = isControlled ? (value ?? '') : inner;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (isControlled) onChange?.(v);
      else setInner(v);
    },
    [isControlled, onChange]
  );

  const doSearch = useCallback(() => {
    const t = term.trim();
    if (!t || disabled) return;
    onSearch(t);
  }, [term, onSearch, disabled]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') doSearch();
    },
    [doSearch]
  );

  const rootClass = useMemo(() => {
    const base = variant === 'desktop' ? styles.searchContainer : styles.mobileSearchWrapper;
    return [base, className].filter(Boolean).join(' ');
  }, [variant, className]);

  return variant === 'desktop' ? (
    <div className={rootClass}>
      <input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={term}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.searchIconBtn}
        onClick={doSearch}
        aria-label="Executar busca"
        disabled={disabled}
      >
        <SearchIcon size={16} />
      </button>
    </div>
  ) : (
    <div className={rootClass}>
      <input
        ref={inputRef}
        className={styles.mobileSearch}
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={term}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.mobileSearchBtn}
        onClick={doSearch}
        aria-label="Executar busca"
        disabled={disabled}
      >
        <SearchIcon size={18} />
      </button>
    </div>
  );
}
