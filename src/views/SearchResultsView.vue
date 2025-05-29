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
const results = ref<SearchResultDto>({
  users: [],
  total: 0
})
const loading = ref(false)
const router = useRouter()

const currentPage = ref(1)
const pageSize = 10

const fetchResults = async (q: string, page = 1) => {
  if (!q) return

  loading.value = true

  try {
    const response = await http.get<SearchResultDto>(`/search/${q}`, {
      params: {
        page,
        limit: pageSize
      }
    })
    results.value = response.data
  } catch (err) {
    results.value = {
      users: [],
      total: 0
    }
  } finally {
    loading.value = false
  }
}

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

      <ul class="results-grid">
        <li v-for="user in results?.users" :key="user.uuid" class="result-card" @click="handleSearch(user)">
          <div class="card-content">
            <img
              :src="user.profilePicture || 'https://via.placeholder.com/80'"
              alt="Avatar"
              class="avatar"
            />
            <div class="info">
              <p><strong>{{ user.username }}</strong></p>
              <p>Picos, PI</p>
              <div class="tags">
                <span class="tag" v-for="tag in user.tags" :key="tag.uuid">{{ tag.label }}</span>
              </div>
            </div>
            <span class="match">👁 Match</span>
          </div>
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
.search-page {
  padding: 2rem 4vw;
  max-width: 1200px;
  margin: 0 auto;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0;
  margin: 2rem 0;
  list-style: none;
}

.result-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
  cursor: pointer;
  min-height: 220px;
  max-width: 400px;      /* Limita a largura máxima do card */
  width: 100%;           /* Faz o card ocupar toda a coluna da grid */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
  position: relative;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2196f3;
  background-color: #eee;
  margin-bottom: 0.5rem;
}

.info {
  flex: 1;
}

.info p {
  margin: 0;
  line-height: 1.3;
}

.tags {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  background-color: #2196f3;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.match {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  background-color: #333;
  color: #fff;
  font-size: 0.7rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
}

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
