'use client';

import React from 'react';
import styles from '@/styles/LoadingBrand.module.css';

type Props = {
  loading: boolean;
  children: React.ReactNode;
};

export default function LoadingBrand({ loading, children }: Props) {
  if (loading) {
    return (
      <div className={styles.loadingWrapper} role="status" aria-busy="true" aria-live="polite">
        <span className={styles.ring} aria-hidden />
        <div className={styles.brand}>
          <span className={styles.small}>Banco&nbsp;de</span>
          <span className={styles.strong}>Talentos</span>
        </div>

        <span className={styles.srOnly}>Carregando…</span>
      </div>
    );
  }

  return <div className={styles.contentWrapper}>{children}</div>;
}
