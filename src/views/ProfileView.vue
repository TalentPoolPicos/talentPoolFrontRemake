<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type UserDto } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import type { components } from '@/types/api'
import { RoutePaths, Routes } from '@/router'
import CircleAvatar from '@/components/CircleAvatar.vue'
import LoadingBrand from '@/components/LoadingBrand.vue'
import ImageUser from '@/components/ImageUser.vue'
import { useLikeStore } from '@/stores/like'

type SocialMediaDto = components['schemas']['SocialMediaDto']
type UsersPageDto = components['schemas']['UsersPageDto']
type RecommendedUsersPageDto = components['schemas']['RecommendedUsersPageDto']

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const likeStore = useLikeStore()

const props = defineProps<{ uuid?: string }>()
const loading = ref(true)

const loadingLike = ref(false)
const isLiked = ref(false)

const error = ref<string | null>(null)

const user = ref<UserDto | null>(null)

const initiatorLikes = ref<UsersPageDto | null>(null)
const receiverLikes = ref<UsersPageDto | null>(null)
const recommendedUsers = ref<RecommendedUsersPageDto | null>(null)
const likesLoading = ref(false)

const iconMap: Record<SocialMediaDto['type'], string> = {
  discord: 'fa-brands fa-discord',
  linkedin: 'fa-brands fa-linkedin',
  github: 'fa-brands fa-github',
  facebook: 'fa-brands fa-facebook',
  gitlab: 'fa-brands fa-gitlab',
  instagram: 'fa-brands fa-instagram',
  reddit: 'fa-brands fa-reddit',
  telegram: 'fa-brands fa-telegram',
  tiktok: 'fa-brands fa-tiktok',
  whatsapp: 'fa-brands fa-whatsapp',
  x: 'fa-brands fa-twitter',
  youtube: 'fa-brands fa-youtube',
}

const getRobotAvatar = (username: string) => `https://robohash.org/${username}?set=set2&size=72x72`

const initiatorLikesHandler = () => {
  router.push({
    name: Routes.Home,
    params: { uuid: user.value?.uuid, type: 'initiator' },
  })
}

const receiverLikesHandler = () => {
  router.push({
    name: Routes.Home,
    params: { uuid: user.value?.uuid, type: 'receiver' },
  })
}

const recommendedUsersHandler = () => {
  router.push({
    name: Routes.Home,
    params: { uuid: user.value?.uuid, type: 'recommended' },
  })
}

/* ---------- ações ---------- */
const refresh = async () => {
  loading.value = true
  error.value = null

  try {
    /* usuário */
    if (props.uuid) {
      user.value = await userStore.findByUuid(props.uuid)
    } else if (!authStore.isLoggedIn) {
      router.push({ name: Routes.Home })
      return
    } else {
      user.value = userStore.loggedUser
    }

    if (!user.value) {
      error.value = 'Usuário não encontrado.'
      return
    }
    /* likes */

    likesLoading.value = true
    initiatorLikes.value = await likeStore
      .initiatorLikes({
        userUuid: user.value.uuid,
        limit: 3,
      })
      .catch(() => ({ total: 0, users: [] }))
    receiverLikes.value = await likeStore
      .receiverLikes({
        userUuid: user.value.uuid,
        limit: 3,
      })
      .catch(() => ({ total: 0, users: [] }))
    if (authStore.isLoggedIn && user.value.uuid === authStore.loggedUser?.uuid) {
      recommendedUsers.value = await likeStore
        .recommendedUsers({
          limit: 3,
        })
        .catch(() => ({ total: 0, users: [] }))
    }
    likesLoading.value = false
  } catch (e) {
    console.error(e)
    error.value = 'Falha ao carregar perfil.'
  } finally {
    loading.value = false
  }
}

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

const checkIfLiked = (userAux: UserDto | undefined) => {
  if (
    authStore.isLoggedIn &&
    userAux &&
    authStore.loggedUser?.uuid !== userAux?.uuid &&
    userAux?.role !== authStore.loggedUser?.role
  ) {
    loadingLike.value = true
    likeStore
      .hasLiked(userAux?.uuid)
      .then((liked) => {
        isLiked.value = liked.isLike
        loadingLike.value = false
      })
      .catch(() => {
        console.error('Erro ao verificar se o usuário foi curtido')
        loadingLike.value = false
        isLiked.value = false
      })
  }
}

const match = () => {
  if (!authStore.isLoggedIn) {
    router.push(RoutePaths[Routes.Home])
    return
  }

  const userAux = user.value

  if (!userAux) {
    console.error('Usuário não encontrado')
    return
  }

  if (authStore.loggedUser?.uuid === userAux.uuid) {
    alert('Você não pode dar like em si mesmo.')
    return
  }

  loadingLike.value = true
  isLiked.value = !isLiked.value

  if (isLiked.value) {
    likeStore
      .like(userAux.uuid)
      .then(() => {
        loadingLike.value = false
      })
      .catch(() => {
        console.error('Erro ao curtir o usuário')
        loadingLike.value = false
        isLiked.value = false
      })
  } else {
    likeStore
      .unlike(userAux.uuid)
      .then(() => {
        loadingLike.value = false
      })
      .catch(() => {
        console.error('Erro ao descurtir o usuário')
        loadingLike.value = false
        isLiked.value = true
      })
  }
}

onMounted(checkIfLiked)
watch(
  () => user.value,
  (newUser) => {
    if (!newUser) return
    checkIfLiked(newUser)
  },
  { immediate: true },
)

/* ---------- ciclo ---------- */
onMounted(refresh)
watch(() => props.uuid, refresh)
</script>

<template>
  <LoadingBrand :loading="loading">
    <div v-if="error" class="error">{{ error }}</div>

    <div v-else class="profile-page">
      <!-- Banner + avatar -->
      <ImageUser :user="user" class="banner-container" />

      <!-- MAIN -------------------------------------------------------- -->
      <section class="main">
        <div class="name-container">
          <h1>
            <template v-if="user?.role === 'student'">
              {{ user.student?.name || 'Talento' }}
            </template>
            <template v-else-if="user?.role === 'enterprise'">
              {{ user.enterprise?.name || 'Empresa' }}
            </template>
          </h1>
          <div
            v-if="
              authStore.isLoggedIn &&
              authStore.loggedUser?.uuid !== user?.uuid &&
              user?.role !== authStore.loggedUser?.role
            "
            class="match-indicator"
            @click.stop="match"
            :class="{ liked: isLiked }"
          >
            <span class="emoji" :class="{ animateIn: loadingLike }" v-if="loadingLike"> ⏳ </span>
            <span class="emoji heart" :class="{ animateOut: !isLiked }" v-else-if="!isLiked"
              >🖤</span
            >
            <span class="emoji flame" :class="{ animateIn: isLiked }" v-else-if="isLiked">❤️‍🔥</span>
          </div>
        </div>

        <p class="email" v-if="user?.role === 'student'">{{ user.student?.email }}</p>
        <p class="course" v-if="user?.role === 'student'">{{ user.student?.course }}</p>
        <p class="email" v-else-if="user?.role === 'enterprise'">{{ user.enterprise?.email }}</p>

        <!-- tags -->
        <div v-if="user?.tags.length" class="tags">
          <span v-for="tag in user?.tags" :key="tag.uuid" class="tag">{{ tag.label }}</span>
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
        <div v-if="user?.address" class="address">
          <p>
            {{ user?.address.neighborhood }} – {{ user?.address.city }} /
            {{ user?.address.state }} • CEP
            {{ user?.address.zipCode }}
          </p>
        </div>

        <!-- botões -->
        <div class="action-buttons">
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
        <!-- NOVA seção “Conecte-se” -->
        <div class="card">
          <h3>Conecte-se</h3>
          <ul class="social-links">
            <li
              v-if="user?.student?.lattes && user.role === 'student'"
              style="display: flex; align-items: center; gap: 0.5rem"
            >
              <i
                class="fas fa-file-alt"
                style="
                  font-size: 1.2rem;
                  width: 2rem;
                  text-align: center;
                  color: var(--color-on-surface-variant);
                "
              >
              </i>
              <a :href="user.student.lattes" target="_blank" class="sm-link"> Lattes </a>
            </li>

            <li
              v-for="link in user?.socialMedia"
              :key="link.type"
              style="display: flex; align-items: center; gap: 0.5rem"
              class="social-link"
            >
              <i :class="iconMap[link.type]"></i>
              <a :href="link.url" target="_blank" class="sm-link">
                {{ link.type.charAt(0).toUpperCase() + link.type.slice(1) }}
              </a>
            </li>
          </ul>
        </div>

        <div class="card stats">
          <div class="stat-item" @click="recommendedUsersHandler" v-if="recommendedUsers">
            <div class="likes-container">
              <span class="stat-number">{{ recommendedUsers?.total ?? 0 }}</span>
              <div class="avatar-stack">
                <CircleAvatar
                  v-for="(user, nIndex) in recommendedUsers?.users"
                  :key="user.uuid"
                  :src="user.profilePicture ?? getRobotAvatar(user.username)"
                  :alt="user.student?.name || user.enterprise?.name"
                  class="stacked-avatar"
                  :style="{ zIndex: recommendedUsers!.users.length - nIndex }"
                />
              </div>
            </div>
            <span class="stat-label">Usuários Recomendados</span>
          </div>
          <div class="stat-item" @click="initiatorLikesHandler">
            <div class="likes-container">
              <span class="stat-number">{{ initiatorLikes?.total ?? 0 }}</span>
              <div class="avatar-stack">
                <CircleAvatar
                  v-for="(user, nIndex) in initiatorLikes?.users"
                  :key="user.uuid"
                  :src="user.profilePicture ?? getRobotAvatar(user.username)"
                  :alt="user.student?.name || user.enterprise?.name"
                  class="stacked-avatar"
                  :style="{ zIndex: initiatorLikes!.users.length - nIndex }"
                />
              </div>
            </div>
            <span class="stat-label">Suas curtidas</span>
          </div>
          <div class="stat-item" @click="receiverLikesHandler">
            <div class="likes-container">
              <span class="stat-number">{{ receiverLikes?.total ?? 0 }}</span>
              <div class="avatar-stack">
                <CircleAvatar
                  v-for="(user, nIndex) in receiverLikes?.users"
                  :key="user.uuid"
                  :src="user.profilePicture ?? getRobotAvatar(user.username)"
                  :alt="user.student?.name || user.enterprise?.name"
                  class="stacked-avatar"
                  :style="{ zIndex: receiverLikes!.users.length - nIndex }"
                />
              </div>
            </div>
            <span class="stat-label">Curtidas recebidas</span>
          </div>
        </div>
      </aside>
    </div>
  </LoadingBrand>
</template>

<style scoped>
.social-link i {
  font-size: 1.2rem;
  width: 2rem;
  text-align: center;
  color: var(--color-on-surface-variant);
}

.profile-page {
  display: grid;
  grid-template-columns: minmax(0, 3fr) 1fr;
  gap: 2.5rem;
  max-width: 1100px;
  margin: 3rem auto 4rem;
  padding: 0 1rem;
  font-family: Inter, sans-serif;
}

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

.main {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.main h1 {
  margin: 0.25rem 0 0.25rem;
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--color-on-surface);
}

.email,
.course {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  margin: 0.25rem 0 0.25rem;
}

.course {
  font-weight: 500;
  color: var(--color-on-surface-variant);
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

.docs-links {
  display: flex;
  gap: 0.75rem;
  margin: 0.25rem 0 0.25rem;
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

.description {
  max-width: 60ch;
  line-height: 1.6;
  color: var(--color-on-surface);
  margin: 0.25rem 0 0.25rem;
  text-align: justify;
}

/* Endereço*/
.address {
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
  margin: 0.25rem 0 0.25rem;
}

.address p {
  margin: 0.25rem 0 0.25rem;
}

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

.sidebar {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 280px;
  gap: 1.5rem;
}

.sidebar .card {
  background: var(--color-surface-variant);
  padding: 1.25rem 1.1rem;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgb(0 0 0 / 10%);
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
  background-color: var(--color-surface);
  cursor: pointer;
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  transition:
    box-shadow 0.2s ease,
    background-color 0.3s ease;
  padding: 1.25rem;
  border-radius: 12px;
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

.error {
  max-width: 600px;
  margin: 3rem auto;
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-error);
}

.avatar-stack {
  display: flex;
  align-items: center;
  position: relative;
}

.stacked-avatar {
  border: 2px solid white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-left: -12px;
  transition: transform 0.2s ease;
}

.stacked-avatar:first-child {
  margin-left: 0;
}

.stacked-avatar:hover {
  transform: scale(1.1);
  z-index: 100;
}

.likes-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  max-width: 100%;
  overflow: hidden;
  padding: 0.5rem;
}

.name-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.match-indicator {
  width: 3rem;
  height: 2rem;
  justify-content: center;
  align-items: center;
  display: flex;
  align-items: center;
  border: 2px solid var(--color-border);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.match-indicator span {
  font-size: 1.2rem;
  display: inline-block;
  user-select: none;

  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.match-indicator:hover {
  border-color: var(--color-primary);
}

.animateIn {
  animation: pop 0.4s ease-in-out;
}

.animateOut {
  animation: pop 0.4s ease-in-out;
}

@keyframes pop {
  0% {
    transform: scale(0);
    transform: rotate(90deg);

    opacity: 0;
  }
  60% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    transform: rotate(0deg);
  }
}
</style>
