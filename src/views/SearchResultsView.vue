<script setup lang="ts">
import { http } from '@/services/http'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import notFoundIcon from '@/assets/undraw_back-home_3dun.svg'
import type { components } from '@/types/api'
import type { UserDto } from '@/stores/user'
import { useRouter } from 'vue-router'




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
  if (user.role === 'student') {
    router.push({ name: 'StudentProfile' })
  } else if (user.role === 'enterprise') {
    router.push({ name: 'EnterpriseProfile' })
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
      <li v-for="item in results?.users" :key="item.uuid" class="result-item">
        <p>
          <strong>{{ item.username }}</strong> - {{ item.email }}
        </p>
        <p v-if="item.student">Aluno: {{ item.student.name }}</p>
        <p v-if="item.enterprise">Empresa: {{ item.enterprise.name }}</p>
      </li>
    </ul>
  </div>
</LoadingBrand>
</template>