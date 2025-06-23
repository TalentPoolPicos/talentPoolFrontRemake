<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import UserCard from '@/components/UserCard.vue'
import { useLikeStore } from '@/stores/like'
import { useAuthStore, type UserDto } from '@/stores/auth'
import router, { Routes } from '@/router'

const props = defineProps<{ type?: string }>()
const route = useRoute()

console.log('props.type', props.type)
console.log('params.uuid', route.params.uuid)

const users = ref<UserDto[]>([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 10
const userUuid = ref<string | undefined>(route.params.uuid as string | undefined)
const likeStore = useLikeStore()
const authStore = useAuthStore()

const isRecommended = computed(() => {
  return props.type === 'recommended' && authStore.isLoggedIn
})

const isInitiator = computed(() => {
  return props.type === 'initiator'
})

const isReceivert = computed(() => {
  return props.type === 'receiver'
})

const fetchResults = async (page = 1) => {
  loading.value = true
  if (!(isRecommended || isInitiator || isReceivert)) {
    router.push({ name: Routes.Home })
  }

  try {
    if (isRecommended.value) {
      userUuid.value = authStore.loggedUser?.uuid
      const response = await likeStore.recommendedUsers({
        limit: pageSize,
        page,
      })
      users.value = response.users
      total.value = response.total
    } else if (isInitiator.value) {
      const response = await likeStore.initiatorLikes({
        limit: pageSize,
        page,
        userUuid: userUuid.value,
      })
      users.value = response.users
      total.value = response.total
    } else if (isReceivert.value) {
      const response = await likeStore.receiverLikes({
        limit: pageSize,
        page,
        userUuid: userUuid.value,
      })
      users.value = response.users
      total.value = response.total
    }
  } catch {
    users.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchResults(currentPage.value)
})

const totalPages = computed(() => {
  return total.value ? Math.ceil(total.value / pageSize) : 1
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchResults(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const isEmpty = computed(() => {
  return users.value.length === 0 && !loading.value
})
</script>

<template>
  <LoadingBrand :loading="loading">
    <div class="search-page">
      <h2>
        <span class="title" v-if="isRecommended"> Recomendados para você </span>
        <span class="title" v-else-if="isInitiator"> Quem esse perfil curtiu </span>
        <span class="title" v-else-if="isReceivert"> Quem curtiu esse perfil </span>
        <span v-if="(total || 0) > 0">({{ total }})</span>
      </h2>

      <div v-if="total == 0" class="no-results-container">
        <img class="not-found-img" :src="notFoundIcon" alt="Nenhum resultado encontrado" />
        <p>Nenhum resultado encontrado...</p>
      </div>

      <div class="grid-container">
        <ul class="results-grid">
          <UserCard v-for="user in users" :key="user.username" :user="user" />
        </ul>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          v-for="page in totalPages"
          :key="page"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </LoadingBrand>
</template>

<style scoped>
.search-page {
  padding: 2rem 4vw;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: var(--color-heading);
}

.title {
  font-weight: 600;
  color: var(--color-primary);
}

.no-results-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  margin: 2rem 0;
}

.not-found-img {
  max-width: 400px;
  width: 100%;
  margin-bottom: 1rem;
  display: block;
}

.grid-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 0;
  margin: 2rem auto;
  list-style: none;
  max-width: 1080px;
  width: 100%;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination button {
  background: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.pagination button.active,
.pagination button:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}
</style>
