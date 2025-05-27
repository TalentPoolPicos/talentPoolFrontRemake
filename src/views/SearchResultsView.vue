<template>
  <div class="search-page">
    <h2>Resultados para "{{ query }}"</h2>

    <div v-if="loading">Carregando resultados...</div>
    <div v-else-if="results.length === 0">Nenhum resultado encontrado.</div>
    
    <ul>
      <li v-for="item in results" :key="item.uuid" class="result-item">
        <p><strong>{{ item.username }}</strong> - {{ item.email }}</p>
        <p v-if="item.student">Aluno: {{ item.student.name }}</p>
        <p v-if="item.enterprise">Empresa: {{ item.enterprise.name }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const query = ref(route.query.q as string || '')
const results = ref<any[]>([])
const loading = ref(false)

async function fetchResults(q: string) {
  if (!q) return
  loading.value = true
  try {
    const response = await fetch(`http://static.30.255.27.37.clients.your-server.de/api/v1/search/${q}?limit=10&page=1`)
    const data = await response.json()
    results.value = data
  } catch (err) {
    console.error('Erro na busca:', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  query.value = newQ as string
  fetchResults(query.value)
}, { immediate: true })
</script>

<style scoped>
.search-page {
  padding: 2rem;
}

.result-item {
  margin-bottom: 1.2rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
}
</style>
