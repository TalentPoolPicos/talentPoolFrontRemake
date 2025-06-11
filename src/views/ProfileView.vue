<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserDto } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useTagStore } from '@/stores/tag'
import { useAddressStore } from '@/stores/address'
import type { components } from '@/types/api'
import { Routes } from '@/router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import ImageUser from '@/components/ImageUser.vue'

/* tipos ---------------------------------------------------------------- */
type AddressDto = components['schemas']['AddressDto']

/* stores / router ------------------------------------------------------ */
const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const tagStore = useTagStore()
const addressStore = useAddressStore()

/* reatividade ---------------------------------------------------------- */
const props = defineProps<{ uuid?: string }>()

const loading = ref(true)
const error = ref<string | null>(null)
const user = ref<UserDto | null>(null)
const tags = ref<string[]>([])
const address = ref<AddressDto | null>(null)

/* funções -------------------------------------------------------------- */
const refresh = async () => {
  loading.value = true
  error.value = null

  try {
    /* user */
    if (props.uuid) {
      user.value = await userStore.findByUuid(props.uuid)
    } else if (!authStore.isLoggedIn) {
      router.push({ name: Routes.Home })
      return
    } else {
      user.value = await userStore.loggedUser
    }

    if (user.value) {
      /* tags */
      const tagDtos = await tagStore.findAllByUserUuid(user.value.uuid)
      tags.value = tagDtos.map((t) => t.label)

      /* address */
      address.value = await addressStore.findByUserUuid(user.value.uuid)
    }
  } catch (e) {
    console.error(e)
    error.value = 'Falha ao carregar perfil.'
  } finally {
    loading.value = false
  }
}

/* ações de UI ---------------------------------------------------------- */
const logoutHandler = async () => {
  try {
    await authStore.logout()
    router.push({ name: Routes.Home })
  } catch {
    error.value = 'Falha ao fazer logout.'
  }
}

const downloadCurriculum = () => {
  if (user.value?.student?.curriculum) window.open(user.value.student.curriculum, '_blank')
  else alert('Usuário não cadastrou o currículo.')
}
const downloadHistory = () => {
  if (user.value?.student?.history) window.open(user.value.student.history, '_blank')
  else alert('Usuário não cadastrou o histórico.')
}
const goToEdit = () => {
  if (user.value?.role === 'student') router.push({ name: Routes.StudentEditView })
  else if (user.value?.role === 'enterprise') router.push({ name: Routes.EnterpriseEditView })
}

/* ciclo --------------------------------------------------------------- */
onMounted(refresh)
watch(() => props.uuid, refresh)
</script>

<template>
  <LoadingBrand :loading="loading">
    <div v-if="error" class="error">{{ error }}</div>

    <div v-else class="profile-page">
      <!-- banner + avatar -->
      <ImageUser :user="user" class="banner-container" />

      <!-- MAIN -------------------------------------------------------- -->
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
        <p class="course" v-if="user?.role === 'student'">{{ user.student?.course }}</p>
        <p class="email" v-else-if="user?.role === 'enterprise'">{{ user.enterprise?.email }}</p>

        <!-- tags -->
        <div v-if="tags.length" class="tags">
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- documentos -->
        <div v-if="user?.role === 'student'" class="docs-links">
          <button class="doc-btn" @click="downloadCurriculum">↓ Currículo</button>
          <button class="doc-btn" @click="downloadHistory">↓ Histórico</button>
        </div>

        <!-- descrição -->
        <p class="description" v-if="user?.role === 'student'">{{ user.student?.description }}</p>
        <p class="description" v-else-if="user?.role === 'enterprise'">
          {{ user.enterprise?.description }}
        </p>

        <!-- endereço -->
        <div v-if="address" class="address">
          <p>
            {{ address.neighborhood }} – {{ address.city }} / {{ address.state }} • CEP
            {{ address.zipCode }}
          </p>
        </div>

        <!-- botões -->
        <div class="action-buttons">
          <!-- Match (placeholder) -->
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

          <button
            v-if="user && authStore.loggedUser?.uuid === user.uuid"
            class="btn"
            @click="goToEdit"
          >
            Editar
          </button>

          <button
            v-if="user && authStore.loggedUser?.uuid === user.uuid"
            class="btn"
            @click="logoutHandler"
          >
            Logout
          </button>
        </div>
      </section>

      <!-- SIDEBAR ------------------------------------------------------ -->
      <aside class="sidebar">
        <div class="card">
          <h3>Conecte-se</h3>
          <ul class="social-links">
            <li v-if="user?.student?.lattes && user.role === 'student'">
              <a :href="user.student.lattes" target="_blank">
                <i class="fas fa-graduation-cap"></i> Lattes
              </a>
            </li>
          </ul>
        </div>

        <div class="card stats">
          <div class="stat-item">
            <span class="stat-number">0</span>
            <span class="stat-label">Seus matches</span>
          </div>
          <div class="stat-item" v-if="user?.role === 'student'">
            <span class="stat-number">0</span>
            <span class="stat-label">Te contrataram</span>
          </div>
          <div class="stat-item" v-if="user?.role === 'enterprise'">
            <span class="stat-number">0</span>
            <span class="stat-label">Te curtiram</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">0</span>
            <span class="stat-label">Visualizações</span>
          </div>
        </div>
      </aside>
    </div>
  </LoadingBrand>
</template>

<style scoped>
/* ---------------------------------------------------- */
/* GRID GERAL                                           */
/* ---------------------------------------------------- */
.profile-page {
  display: grid;
  grid-template-columns: minmax(0, 3fr) 1fr; /* coluna principal + sidebar */
  gap: 2.5rem;
  max-width: 1100px;
  margin: 3rem auto 4rem;
  padding: 0 1rem;
  font-family: Inter, sans-serif;
}

/* ---------------------------------------------------- */
/* BANNER + AVATAR                                      */
/* ---------------------------------------------------- */
.banner-container {
  grid-column: 1 / -1;
  position: relative;
}

.banner-container img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
}

.avatar-wrapper {
  position: absolute;
  bottom: -50px;
  left: 2rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-surface);
  box-shadow: 0 4px 10px rgb(0 0 0 / 20%);
}

@media (max-width: 800px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
}

/* ---------------------------------------------------- */
/* BLOCO PRINCIPAL                                      */
/* ---------------------------------------------------- */
.main h1 {
  margin-top: 2.5rem;
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.email,
.course {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  margin-bottom: 0.25rem;
}

.course {
  font-weight: 500;
}

/* Tags com mais contraste */
.tags {
  margin: 0.75rem 0 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}

/* Botões de documentos */
.docs-links {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.doc-btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 7px 16px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
  transition:
    background 0.25s,
    transform 0.15s;
}

.doc-btn:hover {
  background: var(--color-primary-container);
  transform: translateY(-1px);
}

/* Descrição com limite de largura p/ legibilidade */
.description {
  max-width: 60ch;
  line-height: 1.6;
  color: var(--color-on-surface);
  margin-bottom: 1.5rem;
  text-align: justify;
}

/* Endereço com ícone θ opcional (usa pseudo) */
.address {
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
  margin-bottom: 1.8rem;
}

.address p {
  margin: 0.15rem 0;
}

/* Ação principal */
.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 8px 22px;
  border-radius: 20px;
  font-weight: 600;
  border: none;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  transition:
    background 0.25s,
    transform 0.15s;
}

.btn:hover {
  background: var(--color-primary-container);
  transform: translateY(-1px);
}

/* ---------------------------------------------------- */
/* SIDEBAR                                              */
/* ---------------------------------------------------- */
.sidebar .card {
  background: var(--color-surface-variant);
  padding: 1.25rem 1.1rem;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgb(0 0 0 / 10%);
  margin-bottom: 1.75rem;
}

.sidebar h3 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.social-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.social-links a {
  text-decoration: none;
  color: var(--color-on-surface-variant);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.25s;
}

.social-links a:hover {
  color: var(--color-primary);
}

/* Stats */
.stats {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-on-surface-variant);
}

/* ---------------------------------------------------- */
/* ESTADO DE ERRO                                       */
/* ---------------------------------------------------- */
.error {
  max-width: 600px;
  margin: 3rem auto;
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-error);
}
</style>
