<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserDto } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { Routes } from '@/router'
import CircleAvatar from '@/components/CircleAvatar.vue'
import LoadingBrand from '@/components/LoadingBrand.vue'

const router = useRouter()
const props = defineProps<{ uuid?: string }>()

const userStore = useUserStore()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)

import defaultBanner from '@/assets/banner.png'

const user = ref<UserDto | null>(null)

const refresh = async () => {
  try {
    if (props.uuid) {
      user.value = await userStore.findByUuid(props.uuid)
    } else if (!authStore.isLoggedIn) {
      router.push({ name: Routes.Home })
    } else {
      user.value = await userStore.loggedUser
    }
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao carregar perfil.'
  } finally {
    loading.value = false
  }
}

const LogoutHandler = async () => {
  try {
    await authStore.logout()
    router.push({ name: Routes.Home })
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao fazer logout.'
  }
}

const downloadCurriculum = () => {
  if (user.value?.student?.curriculum) {
    window.open(user.value.student.curriculum, '_blank')
  } else {
    alert('Usuário não cadastrou o currículo.')
  }
}

const downloadHistory = () => {
  if (user.value?.student?.history) {
    window.open(user.value.student.history, '_blank')
  } else {
    alert('Usuário não cadastrou o histórico.')
  }
}

onMounted(() => {
  refresh()
})

watch(() => props.uuid, refresh)
</script>

<template>
  <LoadingBrand :loading="loading">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else class="profile-page">
      <div class="banner-container">
        <img :src="user?.bannerPicture || defaultBanner" alt="Banner" class="banner" />
        <div class="avatar-wrapper">
          <CircleAvatar
            :src="user?.profilePicture ?? `https://robohash.org/${user?.username ?? 'default'}`"
            :width="150"
            :height="150"
          />
          <button
            v-if="
              user &&
              authStore.loggedUser?.uuid !== user.uuid &&
              ((authStore.loggedUser?.role === 'enterprise' && user.role === 'student') ||
                (authStore.loggedUser?.role === 'student' && user.role === 'enterprise'))
            "
            class="btn match-btn"
          >
            Match
          </button>
        </div>
      </div>

      <section class="main">
        <h1>
          <template v-if="user?.role === 'student'">
            {{ user.student?.name || 'Talento' }}
          </template>
          <template v-else-if="user?.role === 'enterprise'">
            {{ user.enterprise?.name || 'Empresa' }}
          </template>
        </h1>

        <p class="email" v-if="user?.role === 'student'">{{ user.student?.email }}</p>
        <p class="email" v-else-if="user?.role === 'enterprise'">{{ user.enterprise?.email }}</p>

        <!-- Tags -->
        <div class="tags" v-if="user?.tags?.length">
          <span v-for="tag in user.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- Botões de documentos para student -->
        <div class="docs-links" v-if="user?.role === 'student'">
          <button @click="downloadCurriculum" class="doc-btn">↓ Currículo</button>
          <button @click="downloadHistory" class="doc-btn">↓ Histórico</button>
        </div>

        <p class="description" v-if="user?.role === 'student'">{{ user.student?.description }}</p>
        <p class="description" v-else-if="user?.role === 'enterprise'">
          {{ user.enterprise?.description }}
        </p>

        <div class="action-buttons">
          <button
            v-if="
              user &&
              authStore.loggedUser?.uuid !== user.uuid &&
              ((authStore.loggedUser?.role === 'enterprise' && user.role === 'student') ||
                (authStore.loggedUser?.role === 'student' && user.role === 'enterprise'))
            "
            class="btn"
          >
            Match
          </button>
          <button v-if="user && authStore.loggedUser?.uuid === user.uuid" class="btn">
            Editar
          </button>
          <button
            v-if="user && authStore.loggedUser?.uuid === user.uuid"
            class="btn"
            @click="LogoutHandler"
          >
            Logout
          </button>
        </div>
      </section>

      <aside class="sidebar">
        <div class="card">
          <h3>Conecte-se</h3>
          <ul class="social-links">
            <li v-if="user?.student?.lattes && user.role === 'student'">
              <a :href="user.student.lattes" target="_blank">
                <i class="fas fa-graduation-cap"></i> Lattes
              </a>
            </li>
            <!-- Você pode adicionar mais links sociais para empresa aqui -->
          </ul>
        </div>

        <div class="card stats">
          <div class="stat-item">
            <span class="stat-number">{{ 0 }}</span>
            <span class="stat-label">Seus matches</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ 0 }}</span>
            <span class="stat-label">Te contrataram</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ 0 }}</span>
            <span class="stat-label">Visualizações</span>
          </div>
        </div>
      </aside>
    </div>
  </LoadingBrand>
</template>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  max-width: 1000px;
  margin: 2rem auto;
  font-family: Inter, sans-serif;
}

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
  border-radius: 8px 8px 0 0;
}
.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.avatar-wrapper img {
  border-radius: 50%;
}

/* Botão Match ao lado do avatar */
.match-btn {
  background: black;
  color: white;
  border-radius: 15px;
  padding: 6px 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
}
.match-btn:hover {
  background: #333;
}

/* Main */
.main h1 {
  margin-top: 0rem;
  font-size: 2rem;
  color: #000000;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.email {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: #444;
}

.techs {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.location {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #444;
}

/* Botões de documentos */
.docs-links {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.doc-btn {
  background: #000000;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 0;
  transition: background 0.3s;
}
.doc-btn:hover {
  background: #333;
}

.description {
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}
.btn {
  background: black;
  color: white;
  padding: 8px 20px;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.3s;
}
.btn:hover {
  background: #333;
}

/* Sidebar */
.sidebar .card {
  background: #f1f3f4;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.social-links {
  list-style: none;
  padding: 0;
  margin: 0;
}
.social-links li {
  margin: 0.5rem 0;
}
.social-links a {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #202124;
  font-weight: 600;
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
  color: #5f6368;
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
  .main h1 {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .docs-links {
    margin-left: 0;
  }
}
</style>
