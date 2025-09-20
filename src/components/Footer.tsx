'use client';

import Image from 'next/image';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.siteFooter} role="contentinfo" aria-labelledby="footer-title">
      <div className={styles.footerContent}>
        <div className={styles.brand}>
          <Image
            className={styles.logo}
            src="/ufpi-seeklogo.png"
            alt="UFPI"
            width={96}
            height={135}
            priority={false}
            sizes="(max-width: 640px) 72px, 96px"
            unoptimized
          />
          <h2 id="footer-title" className={styles.title}>
            Universidade Federal do Piauí
          </h2>
        </div>

        <address className={styles.address}>
          <strong>Endereço:</strong> © 2025, Bairro Ininga – Teresina – PI • CEP: 64049-550
          <br />
          Campus Universitário Ministro Petrônio Portella – UFPI
        </address>
      </div>

      <div className={styles.footerBottom}>
        <small className={styles.copy}>
          &copy; {new Date().getFullYear()} UFPI — Todos os direitos reservados.
        </small>
      </div>
    </footer>
  );
}
