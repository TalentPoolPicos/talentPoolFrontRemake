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
      user.value = await userStore.userByUuid(props.uuid)
    } else if (!authStore.isLoggedIn) {
      router.push({ name: Routes.Home })
    } else {
      user.value = await userStore.loggedUser
    }
    console.log(user)
  } catch (err) {
    console.error(err)
    error.value = 'Falha ao carregar perfil.'
  } finally {
    loading.value = false
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
        </div>
      </div>

      <section class="main">
        <h1>{{ user?.student?.name || 'Talento' }}</h1>
        <p class="subtitle">Matrícula: {{ user?.student?.registrationNumber ?? 'asdasd' }}</p>
        <p class="description">{{ user?.student?.description }}</p>

        <div class="tags">
          <span v-for="tag in user?.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <div class="docs">
          <a
            v-if="user?.student?.curriculum"
            :href="user.student.curriculum"
            target="_blank"
            class="doc-link"
            >↓ Currículo</a
          >
          <a
            v-if="user?.student?.history"
            :href="user.student.history"
            target="_blank"
            class="doc-link"
            >↓ Histórico</a
          >
        </div>
      </section>

      <aside class="sidebar">
        <div class="card">
          <h3>Conecte-se</h3>
          <ul class="social-links">
            <li v-if="user?.student?.lattes">
              <a :href="user.student.lattes" target="_blank">
                <i class="fas fa-graduation-cap"></i> Lattes
              </a>
            </li>
            <!-- <li v-if="user?.socialMedia">
            <a :href="user.student.linkedinUrl" target="_blank">
              <i class="fab fa-linkedin"></i> LinkedIn
            </a>
          </li>
          <li v-if="user.student.facebookUrl">
            <a :href="user.student.facebookUrl" target="_blank">
              <i class="fab fa-facebook"></i> Facebook
            </a>
          </li>
          <li v-if="user.student.twitterUrl">
            <a :href="user.student.twitterUrl" target="_blank">
              <i class="fab fa-twitter"></i> X
            </a>
          </li> -->
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
