<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch } from 'vue'
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

const fetchResults = async (q: string) => {
  if (!q) return

  loading.value = true

  try {
    const response = await http.get<SearchResultDto>(`/search/${q}`, {})
    const data = response.data
    results.value = data

    console.log('Quantidade', data.users.length)
  } catch (err) {
    console.error('Erro na busca:', err)
    results.value = {
      users: [],
      total: 0,
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = (user: UserDto) => {
  console.log('Usuário selecionado:', user)
  if (user.role === 'student') {
    router.push(RoutePaths[Routes.StudentProfile].replace(':uuid', user.uuid))
  } else if (user.role === 'enterprise') {
    router.push(RoutePaths[Routes.EnterpriseProfile].replace(':uuid', user.uuid))
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
      <li v-for="user in results?.users" :key="user.uuid" class="result-item">
        <button @click="handleSearch(user)">
          <p>
            <strong>{{ user.username }}</strong> - {{ user.email }}
          </p>
          <p v-if="user.student">Aluno: {{ user.student.name }}</p>
          <p v-if="user.enterprise">Empresa: {{ user.enterprise.name }}</p>
        </button>
      </li>
    </ul>
  </div>
</LoadingBrand>
</template>

<style scoped>
.search-page {
  padding: 2rem;
  align-content: center;
  text-align: center;
}

.result-item {
  margin-bottom: 1.2rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
}

.no-results-container {
  text-align: center;
  align-content: center;
  margin: 0.5rem 0 auto;
  height: 75vh;
}

.no-results-container a {
  color: var(--primary-color);
  font-weight: bold;
}

.not-found-img {
  max-width: 300px;
  margin-bottom: 1rem;
}