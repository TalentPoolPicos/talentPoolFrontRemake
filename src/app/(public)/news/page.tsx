"use client";

import Image from 'next/image';
import styles from '@/styles/News.module.css';
import { useEffect, useState } from 'react';
import LoadingBrand from '@/components/LoadingBrand';

type NewsItem = {
  title: string;
  description: string;
  date: string;
  img: string;
};

const news: NewsItem[] = [
  {
    title: 'Workshop de Escrita Acadêmica',
    description:
      'Workshop de Escrita Acadêmica continua com submissão aberta para envio de trabalhos até 19 de maio de 2025.',
    date: '30 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Submissões abertas para Artigos Completos',
    description:
      'Envie seu artigo completo ou resumo para o Workshop de Escrita Acadêmica até 19 de maio.',
    date: '29 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Novo Programa de Estágio',
    description:
      'Programa de estágio para alunos da Universidade Federal do Piauí agora com vagas abertas.',
    date: '28 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Evento de Tecnologia',
    description: 'Conferência anual de tecnologia com palestrantes internacionais.',
    date: '27 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Workshop de Inovação',
    description: 'Workshop sobre metodologias ágeis e inovação em TI.',
    date: '26 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Feira de Empregos',
    description: 'Oportunidades de emprego para recém-formados.',
    date: '25 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Palestra Motivacional',
    description: 'Como se destacar no mercado de trabalho atual.',
    date: '24 de abril de 2025',
    img: '/workshop-page.png',
  },
  {
    title: 'Oficina de Carreira',
    description: 'Desenvolvimento de habilidades profissionais essenciais.',
    date: '23 de abril de 2025',
    img: '/workshop-page.png',
  },
];

export default function NewsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadingBrand loading={loading}>
      <main className={styles.news}>
        <section className={styles.newsHeader}>
          <div className={styles.section}>
            <h1>Notícias</h1>
          </div>
        </section>

        <section className={styles.newsList}>
          <div className={styles.newsContainer}>
            {news.map((item) => (
              <article key={item.title} className={styles.newsCard} aria-label={item.title}>
                <div className={styles.newsCard__media}>
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    priority={false}
                    className={styles.newsCard__img}
                    sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, (max-width:1200px) 33vw, 25vw"
                  />
                </div>

                <div className={styles.newsCard__body}>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <span className={styles.dateChip}>{item.date}</span>
                </div>

                <div className={styles.newsCard__overlay} aria-hidden />
              </article>
            ))}
          </div>
        </section>
      </main>
    </LoadingBrand>
  );
}
