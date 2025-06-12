<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import CircleAvatar from '@/components/CircleAvatar.vue'
import type { components } from '@/types/api'
import type { UserDto } from '@/stores/user'
import { useRouter } from 'vue-router'
import { RoutePaths, Routes } from '@/router/index'
import { useAuthStore } from '@/stores/auth'

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

const authStore = useAuthStore()

const getRobotAvatar = (username: string) => {
  return `https://robohash.org/${username}?set=set2&size=72x72`;
};

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
            <CircleAvatar
              :src="user.profilePicture || getRobotAvatar(user.username ?? 'default')"
              :width="72"
              :height="72"
              class="card-circle-avatar"
            />
            <div class="info">
              <p><strong>{{ user.username }}</strong></p>
              <p class="location">Picos, PI</p>
              <div class="tags">
                <span class="tag" v-for="tag in user.tags" :key="tag.uuid">{{ tag.label }}</span>
              </div>
            </div>
            <div v-if="authStore.isLoggedIn" class="match-indicator">
              <i class="fas fa-handshake match-icon"></i>
              <span class="match-text">Match</span>
            </div>
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

h2 {
  color: var(--color-heading); 
}

.search-query {
  color: var(--color-heading);
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
  background-color: var(--color-surface); 
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid var(--color-outline-variant); 
  box-shadow: 0 2px 8px var(--color-shadow); 
  transition: box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
  min-height: 220px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.result-card:hover {
  box-shadow: 0 4px 12px var(--color-shadow);
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

not-found-img {
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
  flex-grow: 1;
}

.card-circle-avatar {
  border: 3px solid var(--color-primary, #2196f3);
  background-color: var(--color-surface-variant, #eee);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.info {
  flex: 1;
}

.info p {
  margin: 0;
  line-height: 1.3;
  color: var(--color-on-surface, #333);
}

.info strong {
  font-size: 1.1em;
  color: var(--color-on-surface, #333);
}

.location {
  font-size: 0.85rem;
  color: var(--color-on-surface-variant, #666);
  margin-top: 0.2em;
}

.tags {
  margin-top: 0.8rem;
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

.match-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: var(--color-secondary, #673ab7);
  color: var(--color-on-secondary, #fff);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: background-color 0.2s ease;
}

.match-indicator:hover {
  background-color: var(--color-secondary-container, #ede7f6);
  color: var(--color-on-secondary-container, #4527a0);
}

.match-icon {
  font-size: 0.9em;
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