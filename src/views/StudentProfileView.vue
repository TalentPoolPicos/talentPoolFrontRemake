<template>
  <div v-if="loading" class="loading">Carregando perfil…</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else class="profile-page">
    <!-- Banner + Avatar -->
    <div class="banner-container">
      <img :src="student.bannerUrl || defaultBanner" alt="Banner" class="banner" />
      <div class="avatar-wrapper">
        <img :src="student.avatarUrl || defaultAvatar" alt="Avatar" class="avatar" />
      </div>
    </div>

    <!-- Conteúdo principal -->
    <section class="main">
      <h1>{{ student.name }}</h1>
      <p class="subtitle">{{ student.course }} • Matrícula: {{ student.registrationNumber }}</p>
      <p class="description">{{ student.description }}</p>

      <!-- Tags -->
      <div class="tags">
        <span v-for="tag in student.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>

      <!-- Documentos -->
      <div class="docs">
        <a v-if="student.curriculum" :href="student.curriculum" target="_blank" class="doc-link"
          >↓ Currículo</a
        >
        <a v-if="student.history" :href="student.history" target="_blank" class="doc-link"
          >↓ Histórico</a
        >
      </div>
    </section>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="card">
        <h3>Conecte-se</h3>
        <ul class="social-links">
          <li v-if="student.lattes">
            <a :href="student.lattes" target="_blank">
              <i class="fas fa-graduation-cap"></i> Lattes
            </a>
          </li>
          <li v-if="student.linkedinUrl">
            <a :href="student.linkedinUrl" target="_blank">
              <i class="fab fa-linkedin"></i> LinkedIn
            </a>
          </li>
          <li v-if="student.facebookUrl">
            <a :href="student.facebookUrl" target="_blank">
              <i class="fab fa-facebook"></i> Facebook
            </a>
          </li>
          <li v-if="student.twitterUrl">
            <a :href="student.twitterUrl" target="_blank"> <i class="fab fa-twitter"></i> X </a>
          </li>
        </ul>
      </div>

      <div class="card stats">
        <div class="stat-item">
          <span class="stat-number">{{ student.metrics.matches }}</span>
          <span class="stat-label">Seus matches</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ student.metrics.hired }}</span>
          <span class="stat-label">Te contrataram</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ student.metrics.views }}</span>
          <span class="stat-label">Visualizações</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

interface Metrics {
  matches: number
  hired: number
  views: number
}
interface StudentDto {
  name: string
  email: string
  course: string
  registrationNumber: string
  description: string
  lattes?: string
  linkedinUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  curriculum?: string
  history?: string
  tags: string[]
  bannerUrl?: string
  avatarUrl?: string
  metrics: Metrics
}

const route = useRoute()
const uuid = String(route.params.uuid)

const loading = ref(true)
const error = ref<string | null>(null)

import defaultBanner from '@/assets/banner.png'
import defaultAvatar from '@/assets/perfil.png'

const student = reactive<StudentDto>({
  name: '',
  email: '',
  course: '',
  registrationNumber: '',
  description: '',
  lattes: '',
  linkedinUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  curriculum: '',
  history: '',
  tags: [],
  bannerUrl: '',
  avatarUrl: '',
  metrics: { matches: 0, hired: 0, views: 0 },
})

onMounted(async () => {
  try {
    const { data } = await api.get<StudentDto>(`/students/${uuid}`)
    console.log(data)
    Object.assign(student, data)
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao carregar perfil.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  max-width: 1000px;
  margin: 2rem auto;
  font-family: Inter, sans-serif;
}

.loading,
.error {
  max-width: 700px;
  margin: 3rem auto;
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-on-surface-variant);
}

/* Banner + avatar */
.banner-container {
  grid-column: 1 / -1;
  position: relative;
}
.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
}
.avatar {
  width: 80px;
  height: 80px;
  border: 4px solid var(--color-background);
  border-radius: 50%;
  object-fit: cover;
}

/* Main */
.main h1 {
  margin-top: 3rem;
  font-size: 2rem;
}
.subtitle {
  color: var(--color-on-surface-variant);
  margin-bottom: 1rem;
}
.description {
  margin-bottom: 1.5rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.tag {
  background: var(--color-surface-variant);
  color: var(--color-on-surface);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

/* Docs */
.docs {
  display: flex;
  gap: 1rem;
}
.doc-link {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
}

/* Sidebar */
.sidebar .card {
  background: var(--color-surface-variant);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.social-links {
  list-style: none;
  padding: 0;
}
.social-links li {
  margin: 0.5rem 0;
}
.social-links a {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-on-surface);
}

/* Estatísticas */
.stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.stat-item {
  text-align: center;
}
.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}
.stat-label {
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

/* Responsivo */
@media (max-width: 800px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
