"use client";

import Image from 'next/image';
import styles from '@/styles/About.module.css';
import LoadingBrand from '@/components/LoadingBrand';
import { useEffect, useState } from 'react';

type Person = {
  name: string;
  role: string;
  img: string;
};

const team: Person[] = [
  { name: 'Adriano', role: 'Desenvolvedor Backend', img: '/image.png' },
  { name: 'Marcos', role: 'Desenvolvedora Frontend', img: '/image.png' },
  { name: 'Vandirleya', role: 'Desenvolvedora Frontend', img: '/image.png' },
  { name: 'Viviane', role: 'Desenvolvedora Frontend', img: '/image.png' },
];

export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <LoadingBrand loading={loading}>
      <main className={styles.about}>
        <section className={styles.team}>
          <div className={`${styles.section} ${styles.team__intro}`}>
            <div>
              <h1>Quem somos</h1>
              <p>
                O Banco de Talentos da UFPI é um projeto criado por estudantes e professores com o
                objetivo de aproximar talentos universitários e empresas que desejam inovar.
              </p>
            </div>
          </div>

          <div className={`${styles.section} ${styles.team__cards}`}>
            {team.map((person) => (
              <div className={styles.team__card} key={person.name}>
                <Image
                  src={person.img}
                  alt={`Foto de ${person.name}`}
                  width={100}
                  height={100}
                />
                <h2>{person.name}</h2>
                <p>{person.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </LoadingBrand>
  );
}
