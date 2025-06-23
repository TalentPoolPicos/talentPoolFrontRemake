<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import UserCard from '@/components/UserCard.vue'
import type { components } from '@/types/api'

type SearchResultDto = components['schemas']['SearchResultDto']

const route = useRoute()
const query = ref((route.query.q as string) || '')
const results = ref<SearchResultDto>({
  users: [],
  total: 0,
})
const loading = ref(false)

const currentPage = ref(1)
const pageSize = 10

const fetchResults = async (q: string, page = 1) => {
  if (!q) return
  loading.value = true

  try {
    const encodedQ = encodeURIComponent(q)
    const response = await http.get<SearchResultDto>(`/search/${encodedQ}`, {
      params: { page },
    })

    console.log('page', page, 'received', response.data.users.length, 'users')

    results.value = response.data
  } catch {
    results.value = { users: [], total: 0 }
  } finally {
    loading.value = false
  }
}


const totalPages = computed(() => {
  return results.value ? Math.ceil((results.value.total || 0) / pageSize) : 1
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchResults(query.value, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(
  () => route.query.q,
  (newQ) => {
    query.value = newQ as string
    currentPage.value = 1
    fetchResults(query.value, 1)
  },
  { immediate: true },
)
</script>

<template>
  <LoadingBrand :loading="loading">
    <div class="search-page">
      <h2>
        Resultados para <span class="search-query">{{ query }}</span>
        <span v-if="(results?.total || 0) > 0">({{ results?.total }})</span>
      </h2>

      <div v-if="results?.total == 0" class="no-results-container">
        <img class="not-found-img" :src="notFoundIcon" alt="Nenhum resultado encontrado" />
        <p>Nenhum resultado encontrado para "{{ query }}".</p>
        <p>
          Tente ajustar sua busca ou <router-link to="/">voltar para a página inicial</router-link>.
        </p>
      </div>

      <div class="grid-container">
        <ul class="results-grid" :key="currentPage">
          <UserCard v-for="user in results?.users" :key="user.username" :user="user" />
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

.search-query {
  color: var(--color-heading);
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
