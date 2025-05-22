<script setup lang="ts">
const team = [
  {
    name: 'Adriano',
    role: 'Desenvolvedor Backend',
    img: new URL('@/assets/image.png', import.meta.url).href,
  },
  {
    name: 'Marcos',
    role: 'Desenvolvedora Frontend',
    img: new URL('@/assets/image.png', import.meta.url).href,
  },
  {
    name: 'Vandirleya',
    role: 'Desenvolvedora Frontend',
    img: new URL('@/assets/image.png', import.meta.url).href,
  },
  {
    name: 'Viviane',
    role: 'Desenvolvedora Frontend',
    img: new URL('@/assets/image.png', import.meta.url).href,
  },
]
</script>

<template>
  <main class="about">
    <section class="team">
      <div class="section team__intro">
        <div>
          <h1>Quem somos</h1>
          <p>
            O Banco de Talentos da UFPI é um projeto criado por estudantes e professores com o
            objetivo de aproximar talentos universitários e empresas que desejam inovar.
          </p>
        </div>
      </div>

      <div class="section team__cards">
        <div class="team__card" v-for="person in team" :key="person.name">
          <img :src="person.img" :alt="`Foto de ${person.name}`" />
          <h2>{{ person.name }}</h2>
          <p>{{ person.role }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about {
  font-family: Inter, sans-serif;
  background: var(--color-background);
  color: var(--color-on-surface);
  padding-inline: 1rem;
}

.team {
  padding-block: 3rem;
}

.team__intro {
  text-align: center;
  margin-bottom: 2rem;
}
.team__intro h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  font-weight: 700;
}
.team__intro p {
  max-width: 600px;
  margin-inline: auto;
  color: var(--color-on-surface-variant);
}

.team__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  justify-content: center;
  max-width: 1200px;
  margin: auto;
  padding-inline: 1rem;
}

.team__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 2rem 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}
.team__card:hover {
  transform: translateY(-5px);
}

.team__card img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid var(--color-primary-container);
}

.team__card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}
.team__card p {
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
}
</style>
