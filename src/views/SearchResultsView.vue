<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import type { components } from '@/types/api'
import type { UserDto } from '@/stores/user'
import { useRouter } from 'vue-router'
import { RoutePaths, Routes } from '@/router/index'

type SearchResultDto = components['schemas']['SearchResultDto']

const route = useRoute()
const query = ref(route.query.q as string || '')
const results = ref<SearchResultDto>()
const loading = ref(false)
const router = useRouter()

const currentPage = ref(1)
const pageSize = 10

const fetchResults = async (q: string) => {
  if (!q) return

  loading.value = true
  currentPage.value = 1

  try {
    const response = await http.get<SearchResultDto>(`/search/${q}`, {})
    const data = response.data
    results.value = data
  } catch (err) {
    results.value = {
      users: [],
      total: 0,
    }
  } finally {
    loading.value = false
  }
}

const paginatedUsers = computed(() => {
  if (!results.value?.users) return []
  const start = (currentPage.value - 1) * pageSize
  return results.value.users.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  return results.value ? Math.ceil((results.value.total || 0) / pageSize) : 1
})

const handleSearch = (user: UserDto) => {
  if (user.role === 'student') {
    router.push(RoutePaths[Routes.StudentProfile].replace(':uuid', user.uuid))
  } else if (user.role === 'enterprise') {
    router.push(RoutePaths[Routes.EnterpriseProfile].replace(':uuid', user.uuid))
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(
  () => route.query.q,
  (newQ) => {
    query.value = newQ as string
    fetchResults(query.value)
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

    <ul>
      <li v-for="user in paginatedUsers" :key="user.uuid" class="result-item">
        <button @click="handleSearch(user)">
          <p>
            <strong>{{ user.username }}</strong> - {{ user.email }}
          </p>
          <p v-if="user.student">Aluno: {{ user.student.name }}</p>
          <p v-if="user.enterprise">Empresa: {{ user.enterprise.name }}</p>
        </button>
      </li>
    </ul>

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
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}
.pagination button {
  background: var(--color-surface, #f0f0f0);
  border: 1px solid var(--color-border, #ccc);
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--color-on-surface, #333);
  transition: background 0.2s;
}
.pagination button.active,
.pagination button:hover {
  background: var(--color-primary, #1976d2);
  color: #fff;
  border-color: var(--color-primary, #1976d2);
}
</style>