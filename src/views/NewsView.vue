<template>
  <main class="news">
    <section class="news-header">
      <div class="section">
        <h1>Notícias</h1>
      </div>
    </section>

    <section class="news-list">
      <div class="news-container">
        <div class="news-card">
          <img
            class="news-card__img"
            src="@/assets/workshop-page.png"
            alt="Workshop de Escrita Acadêmica"
          />
          <div class="news-card__overlay">
            <h2>Workshop de Escrita Acadêmica</h2>
            <p>
              Workshop de Escrita Acadêmica continua com submissão aberta para envio de trabalhos
              até 19 de maio de 2025.
            </p>
            <span>30 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img
            class="news-card__img"
            src="@/assets/workshop-page.png"
            alt="Submissões abertas para Artigos Completos"
          />
          <div class="news-card__overlay">
            <h2>Submissões abertas para Artigos Completos</h2>
            <p>
              Envia seu artigo completo ou resumo para o Workshop de Escrita Acadêmica até 19 de
              maio.
            </p>
            <span>29 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img
            class="news-card__img"
            src="@/assets/workshop-page.png"
            alt="Novo Programa de Estágio"
          />
          <div class="news-card__overlay">
            <h2>Novo Programa de Estágio</h2>
            <p>
              Programa de estágio para alunos da Universidade Federal do Piauí agora com vagas
              abertas.
            </p>
            <span>28 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img class="news-card__img" src="@/assets/workshop-page.png" alt="Evento de Tecnologia" />
          <div class="news-card__overlay">
            <h2>Evento de Tecnologia</h2>
            <p>Conferência anual de tecnologia com palestrantes internacionais.</p>
            <span>27 de abril de 2025</span>
          </div>
        </div>
      </div>

      <div class="news-container">
        <div class="news-card">
          <img class="news-card__img" src="@/assets/workshop-page.png" alt="Workshop de Inovação" />
          <div class="news-card__overlay">
            <h2>Workshop de Inovação</h2>
            <p>Workshop sobre metodologias ágeis e inovação em TI.</p>
            <span>26 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img class="news-card__img" src="@/assets/workshop-page.png" alt="Feira de Empregos" />
          <div class="news-card__overlay">
            <h2>Feira de Empregos</h2>
            <p>Oportunidades de emprego para recém-formados.</p>
            <span>25 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img
            class="news-card__img"
            src="@/assets/workshop-page.png"
            alt="Palestra Motivacional"
          />
          <div class="news-card__overlay">
            <h2>Palestra Motivacional</h2>
            <p>Como se destacar no mercado de trabalho atual.</p>
            <span>24 de abril de 2025</span>
          </div>
        </div>

        <div class="news-card">
          <img class="news-card__img" src="@/assets/workshop-page.png" alt="Oficina de Carreira" />
          <div class="news-card__overlay">
            <h2>Oficina de Carreira</h2>
            <p>Desenvolvimento de habilidades profissionais essenciais.</p>
            <span>23 de abril de 2025</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.news {
  font-family: Inter, sans-serif;
  color: var(--color-on-surface);
  background: var(--color-background);
}

.news-header {
  padding-block: 2rem;
  text-align: center;
}

.news-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-on-primary-container, #1e1e1e);
  margin: 0;
}

.news-list {
  padding-block: 3rem;
}

.news-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  row-gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  margin-bottom: 2rem;
}

.news-card {
  position: relative;
  background: var(--color-surface);
  color: var(--color-on-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  height: 280px;
  width: 100%;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.news-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(70%);
}

.news-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  color: var(--color-always-white);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0.9;
}

.news-card__overlay h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.news-card__overlay p {
  font-size: 0.9rem;
  margin: 0.4rem 0;
  line-height: 1.4;
}

.news-card__overlay span {
  font-size: 0.8rem;
  font-weight: 300;
  margin-top: 0.4rem;
}

@media (max-width: 1200px) {
  .news-container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1000px;
  }
}

@media (max-width: 900px) {
  .news-container {
    grid-template-columns: repeat(2, 1fr);
    max-width: 700px;
  }
}

@media (max-width: 600px) {
  .news-container {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .news-card {
    height: 250px;
  }
}
</style>
