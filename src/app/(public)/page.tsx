'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/page.module.css';
import Footer from '@/components/Footer';
import LoadingBrand from '@/components/LoadingBrand';
import { useEffect, useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadingBrand loading={loading}>
      <main className={styles.home}>
        <section className={styles.hero}>
          <div className={styles.section}>
            <div className={styles.hero__content}>
              <h1>
                Banco de Talentos<br />
                Universidade Federal<br />
                do Piauí
              </h1>

              <p>Conectando alunos e empresas através da inovação.</p>
            </div>

            <Image
              className={styles.hero__img}
              src="/hero-illustration.png"
              alt="Ilustração de design"
              width={420}
              height={420}
              priority
            />
          </div>
        </section>

        <section className={styles['talent-cta']}>
          <div className={styles.section}>
            <Image
              className={styles['talent-cta__img']}
              src="/mobile-illustration.png"
              alt="Celular com formulário"
              width={260}
              height={520}
            />

            <div className={styles['talent-cta__text']}>
              <h2>Venha se tornar um talento!</h2>
              <p>
                Está pronto para dar o primeiro passo na sua carreira? Aqui, você encontra vagas de
                estágio que combinam com o seu perfil e te aproximam do futuro profissional que você
                sempre sonhou.
              </p>
              <Link href="/signup/student" className={styles['btn-primary']}>
                Cadastre-se
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.partner}>
          <div className={styles.section}>
            <div className={styles.partner__cards}>
              <div className={styles.card}>
                <h3>O que é um parceiro?</h3>
                <p>
                  É uma empresa ou instituição (pública ou privada) que capta talentos através da nossa
                  plataforma.
                </p>
              </div>

              <div className={`${styles.card} ${styles['card--highlight']}`}>
                <h3>Vantagens</h3>
                <p>
                  Acesso a um banco de dados de talentos universitários capacitados, prontos para entrar
                  em contato.
                </p>
              </div>

              <div className={styles.card}>
                <h3>Possibilidades</h3>
                <p>Encontre profissionais capacitados de todas as áreas.</p>
              </div>
            </div>
          </div>

          {/* <div className={styles.partner__cta}>
          <h2>Venha se tornar um parceiro!</h2>
          <Link href="/signup/enterprise" className={styles['btn-outline']}>
            Quero me tornar um parceiro
          </Link>
        </div> */}
        </section>

        <section className={styles.testimonial}>
          <div className={styles.testimonial__text}>
            <h2>O ambiente ideal para encontrar novos profissionais&nbsp;!</h2>
            <p>
              Conectamos profissionais capacitados a empresas no mercado! Venha fazer parte da nossa
              história!
            </p>
          </div>

          <blockquote className={styles.testimonial__quote}>
            <p className={styles.stars}>★★★★★</p>
            <p>
              &quot;Esse projeto mudou a minha vida. Agora posso obrigar meu estagiário a trabalhar e ir
              curtir meus dias, melhor invenção dos últimos tempos!&quot;
            </p>
            <footer>Tony Stark, Marvel.</footer>
          </blockquote>
        </section>

        <Footer />
      </main>
    </LoadingBrand>
  );
}
