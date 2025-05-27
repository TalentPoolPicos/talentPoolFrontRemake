<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Routes, RoutePaths } from '@/router/index'
</script>

<template>
  <main class="home">
    <section class="hero">
      <div class="section">
        <div class="hero__content">
          <h1>
            Banco de Talentos<br />
            Universidade Federal<br />
            do Piauí
          </h1>

          <p>Conectando alunos e empresas através da inovação.</p>
        </div>

        <img class="hero__img" src="@/assets/hero-illustration.png" alt="Ilustração de design" />
      </div>
    </section>

    <section class="talent-cta">
      <div class="section">
        <img
          class="talent-cta__img"
          src="@/assets/mobile-illustration.png"
          alt="Celular com formulário"
        />

        <div class="talent-cta__text">
          <h2>Venha se tornar um talento!</h2>
          <p>
            Está pronto para dar o primeiro passo na sua carreira? Aqui, você encontra vagas de
            estágio que combinam com o seu perfil e te aproximam do futuro profissional que você
            sempre sonhou.
          </p>
          <RouterLink :to="RoutePaths[Routes.SignIn]" class="btn-primary">Cadastre-se</RouterLink>
        </div>
      </div>
    </section>

    <section class="partner">
      <div class="section">
        <div class="partner__cards">
          <div class="card">
            <h3>O que é um parceiro?</h3>
            <p>
              É uma empresa ou instituição (pública ou privada) que capta talentos através da nossa
              plataforma.
            </p>
          </div>

          <div class="card card--highlight">
            <h3>Vantagens</h3>
            <p>
              Acesso a um banco de dados de talentos universitários capacitados, prontos para entrar
              em contato.
            </p>
          </div>

          <div class="card">
            <h3>Possibilidades</h3>
            <p>Encontre profissionais capacitados de todas as áreas.</p>
          </div>
        </div>
      </div>

      <div class="partner__cta">
        <h2>Venha se tornar um parceiro!</h2>
        <RouterLink :to="RoutePaths[Routes.SignIn]" class="btn-outline"
          >Quero me tornar um parceiro</RouterLink
        >
      </div>
    </section>

    <section class="testimonial">
      <div class="testimonial__text">
        <h2>O ambiente ideal para encontrar novos profissionais&nbsp;!</h2>
        <p>
          Conectamos profissionais capacitados a empresas no mercado! Venha fazer parte da nossa
          história!
        </p>
      </div>

      <blockquote class="testimonial__quote">
        <p class="stars">★★★★★</p>
        <p>
          "Esse projeto mudou a minha vida. Agora posso obrigar meu estagiário a trabalhar e ir
          curtir meus dias, melhor invenção dos últimos tempos!"
        </p>
        <footer>Tony Stark, Marvel.</footer>
      </blockquote>
    </section>
  </main>
</template>

<style scoped>
.section {
  max-width: 1200px;
  margin-inline: auto;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 3rem;
}

@media (max-width: 900px) {
  .section {
    grid-auto-flow: row;
    text-align: center;
  }
  .section > * {
    margin-inline: auto;
  }
}

.home {
  font-family: Inter, sans-serif;
  color: var(--color-on-surface);
  background: var(--color-background);
  line-height: 1.6;
}

.hero {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding-block: 3rem;
}

.hero__content h1 {
  font-size: clamp(2rem, 4vw + 1rem, 3.5rem);
  font-weight: 600;
  line-height: 1.2;
}
.hero__content p {
  margin-top: 1rem;
  max-width: 28rem;
}
.hero__img {
  width: 100%;
  max-width: 420px;
}

.talent-cta {
  padding-block: 3rem;
}

.talent-cta__img {
  width: 100%;
  max-width: 260px;
}

.talent-cta__text h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.talent-cta__text p {
  margin: 1rem 0 2rem;
  max-width: 32rem;
  color: var(--color-on-surface-variant);
}

.partner {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  padding-block: 3rem;
}

.partner__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--color-surface);
  color: var(--color-on-surface);
  padding: 2rem 1.5rem;
  position: relative;
  border: 1px solid var(--color-border);
}
.card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.card--highlight::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid var(--color-surface);
}

.partner__cta {
  text-align: center;
}
.partner__cta h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-on-primary-container);
}

.testimonial {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
  gap: 3rem;
  padding: 3rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial__text h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.testimonial__text p {
  margin-top: 1rem;
  max-width: 32rem;
  color: var(--color-on-surface-variant);
}

.testimonial__quote {
  text-align: center;
  max-width: 420px;
  margin-inline: auto;
}
.stars {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--color-tertiary-container);
}
.testimonial__quote p {
  font-style: italic;
}
.testimonial__quote footer {
  margin-top: 0.75rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
}

.btn-primary,
.btn-outline {
  cursor: pointer;
  padding: 0.75rem 2.5rem;
  font-weight: 500;
  border-radius: 4px;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  text-decoration: none;
}
.btn-primary:hover {
  background: color-mix(in srgb, var(--color-primary) 80%, var(--color-background));
}

.btn-outline {
  background: transparent;
  color: var(--color-on-primary-container);
  border: 1px solid var(--color-on-primary-container);
  text-decoration: none;
}
.btn-outline:hover {
  background: var(--color-on-primary-container);
  color: var(--color-primary-container);
}
</style>
