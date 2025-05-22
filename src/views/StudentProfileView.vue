<template>
  <div v-if="loading" class="profile-wrapper">Carregando perfil…</div>
  <div v-else class="profile-wrapper">
    <header class="profile-header">
      <img
        v-if="student.profilePicture"
        :src="student.profilePicture"
        alt="Avatar"
        class="avatar"
      />
      <router-link class="btn-edit" :to="{ name: 'student-edit', params: { uuid: student.uuid } }">
        Editar
      </router-link>
    </header>

    <h1 class="name">{{ student.name || '—' }}</h1>

    <section class="info">
      <p><strong>E-mail:</strong> {{ student.email || '—' }}</p>
      <p><strong>Matrícula:</strong> {{ student.registrationNumber || '—' }}</p>
      <p><strong>Data de Nasc.:</strong> {{ formattedBirthdate }}</p>
      <p><strong>Descrição:</strong> {{ student.description || '—' }}</p>
    </section>

    <section class="docs">
      <p>
        <strong>Currículo:</strong>
        <a v-if="student.curriculum" :href="student.curriculum" target="_blank"> Ver PDF </a>
        <span v-else>—</span>
      </p>
      <p>
        <strong>Histórico:</strong>
        <a v-if="student.history" :href="student.history" target="_blank"> Ver PDF </a>
        <span v-else>—</span>
      </p>
      <p>
        <strong>Lattes:</strong>
        <a v-if="student.lattes" :href="student.lattes" target="_blank"> Ver Lattes </a>
        <span v-else>—</span>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

interface Student {
  uuid: string
  profilePicture?: string
  name?: string
  email?: string
  registrationNumber?: string
  description?: string
  birthdate?: string
  curriculum?: string
  history?: string
  lattes?: string
}

const route = useRoute()
const uuid = String(route.params.uuid)

const student = ref<Student>({ uuid: '' })
const loading = ref(true)

const formattedBirthdate = computed(() => {
  if (!student.value.birthdate) return '—'
  return new Date(student.value.birthdate).toLocaleDateString('pt-BR')
})

onMounted(async () => {
  try {
    const { data } = await api.get<Student>(`/api/v1/students/${uuid}`)
    student.value = data
  } catch {
    // Se quiser, trate um error flag aqui
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-wrapper {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}
.btn-edit {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
}
.name {
  margin-top: 1rem;
  font-size: 2rem;
}
.info p,
.docs p {
  margin: 0.5rem 0;
}
</style>
