<template>
  <form @submit.prevent="handleSubmit">
    <!-- campos do formulário -->
    <button type="submit">Salvar</button>
  </form>

  <input type="file" @change="uploadCurriculum" />
  <input type="file" @change="uploadHistory" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

interface Student {
  uuid: string
  name?: string
  email?: string
  registrationNumber?: string
  description?: string
  birthdate?: string
  curriculum?: string
  history?: string
  lattes?: string
}

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

const route = useRoute()
const router = useRouter()
const uuid = String(route.params.uuid)

const student = reactive<Student>({ uuid: '' })
const form = reactive({
  name: '',
  email: '',
  registrationNumber: '',
  description: '',
  birthdate: '',
  lattes: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await api.get<Student>(`/api/v1/students/${uuid}`)
    Object.assign(student, data)
    form.name = data.name || ''
    form.email = data.email || ''
    form.registrationNumber = data.registrationNumber || ''
    form.description = data.description || ''
    form.birthdate = data.birthdate?.slice(0, 10) || ''
    form.lattes = data.lattes || ''
  } catch {
    error.value = 'Não foi possível carregar dados.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const payload: Partial<Omit<Student, 'uuid' | 'curriculum' | 'history'>> & {
      birthDate?: string
    } = {
      name: form.name,
      email: form.email,
      registrationNumber: form.registrationNumber,
      description: form.description,
      birthDate: form.birthdate,
      lattes: form.lattes,
    }
    Object.keys(payload).forEach(
      (k) =>
        !(payload as Record<string, unknown>)[k] && delete (payload as Record<string, unknown>)[k],
    )
    const { data } = await api.patch<Student>('/api/v1/students', payload)
    Object.assign(student, data)
    success.value = true
    setTimeout(() => {
      router.push({ name: 'student-profile', params: { uuid } })
    }, 1000)
  } catch (err: unknown) {
    const apiErr = err as ApiError
    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in apiErr &&
      apiErr.response?.data?.message
    ) {
      error.value = apiErr.response.data.message ?? ''
    } else {
      error.value = 'Erro ao salvar.'
    }
  } finally {
    loading.value = false
  }
}

async function uploadCurriculum(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.patch<Student>('/api/v1/students/curriculum', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    student.curriculum = data.curriculum
    success.value = true
  } catch {
    error.value = 'Erro ao enviar currículo.'
  } finally {
    loading.value = false
  }
}

async function uploadHistory(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.patch<Student>('/api/v1/students/history', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    student.history = data.history
    success.value = true
  } catch {
    error.value = 'Erro ao enviar histórico.'
  } finally {
    loading.value = false
  }
}
</script>
