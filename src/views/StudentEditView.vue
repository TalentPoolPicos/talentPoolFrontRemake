<template>
  <div v-if="loading" class="loading">Carregando dados…</div>
  <div v-else-if="error" class="error">{{ error }}</div>
  <div v-else class="edit-page">
    <!-- Banner + avatar -->
    <div class="banner-container">
      <img :src="form.bannerUrl || defaultBanner" alt="Banner" class="banner" />
      <div class="avatar-wrapper">
        <img :src="form.avatarUrl || defaultAvatar" alt="Avatar" class="avatar" />
      </div>
    </div>

    <!-- Botões de documentos -->
    <div class="docs-actions">
      <button class="doc-btn" :disabled="loadingCurriculum" @click="triggerCurriculumUpload">
        {{ loadingCurriculum ? 'Enviando...' : '↓ Currículo' }}
      </button>
      <button class="doc-btn" :disabled="loadingHistory" @click="triggerHistoryUpload">
        {{ loadingHistory ? 'Enviando...' : '↓ Histórico' }}
      </button>
    </div>

    <input
      ref="curriculumInput"
      type="file"
      accept="application/pdf"
      @change="onCurriculumChange"
      style="display: none"
    />
    <input
      ref="historyInput"
      type="file"
      accept="application/pdf"
      @change="onHistoryChange"
      style="display: none"
    />

    <!-- ► Formulário de edição -->
    <form class="edit-form" @submit.prevent="handleSave">
      <!-- Campos básicos -->
      <div class="field">
        <label for="name">Nome</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div class="field">
        <label for="course">Curso</label>
        <input id="course" v-model="form.course" type="text" />
      </div>
      <div class="field">
        <label for="registration">Número da matrícula</label>
        <input id="registration" v-model="form.registrationNumber" type="text" />
      </div>
      <div class="field">
        <label for="description">Descrição</label>
        <textarea id="description" v-model="form.description" rows="4"></textarea>
      </div>
      <div class="field">
        <label for="lattes">Lattes</label>
        <input id="lattes" v-model="form.lattes" type="url" />
      </div>
      <div class="field">
        <label for="phone">Telefone</label>
        <input id="phone" v-model="form.phone" type="tel" />
      </div>

      <!-- TAGS -->
      <div class="field">
        <label for="newTag">Tags</label>
        <div class="tags-input">
          <input
            id="newTag"
            v-model="form.newTag"
            type="text"
            placeholder="Nova tag"
            @keyup.enter="addTag"
          />
          <button type="button" class="btn-small" @click="addTag">Adicionar</button>
        </div>
        <div class="tags-list">
          <span v-for="tag in tags" :key="tag" class="tag-chip">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">×</button>
          </span>
        </div>
      </div>

      <!-- ENDEREÇO -->
      <div class="field">
        <label for="cep">CEP</label>
        <input id="cep" v-model="form.cep" type="text" />
      </div>
      <div class="field">
        <label for="street">Rua</label>
        <input id="street" v-model="form.street" type="text" />
      </div>
      <div class="field">
        <label for="neighborhood">Bairro</label>
        <input id="neighborhood" v-model="form.neighborhood" type="text" />
      </div>
      <div class="field">
        <label for="city">Cidade</label>
        <input id="city" v-model="form.city" type="text" />
      </div>
      <div class="field">
        <label for="state">Estado</label>
        <input id="state" v-model="form.state" type="text" />
      </div>

      <button class="btn-save" type="submit" :disabled="saving">
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

interface StudentDto {
  name: string
  email: string
  course?: string
  registrationNumber?: string
  description?: string
  lattes?: string
  phone?: string
  curriculum?: string
  history?: string
  tags?: string[]
  cep?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
  bannerUrl?: string
  avatarUrl?: string
  newTag?: string
}

const route = useRoute()
const router = useRouter()
const uuid = '52a7b48f-c7b1-4cdb-b301-f0313c85708b'

const loading = ref(true)
const saving = ref(false)
const loadingCurriculum = ref(false)
const loadingHistory = ref(false)
const error = ref<string | null>(null)

import defaultBanner from '@/assets/banner.png'
import defaultAvatar from '@/assets/perfil.png'

const form = reactive<StudentDto>({
  name: '',
  email: '',
  course: '',
  registrationNumber: '',
  description: '',
  lattes: '',
  phone: '',
  cep: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  tags: [],
  bannerUrl: '',
  avatarUrl: '',
  newTag: '',
})
const tags = ref<string[]>([])

const curriculumInput = ref<HTMLInputElement>()
const historyInput = ref<HTMLInputElement>()

onMounted(async () => {
  try {
    const { data } = await api.get<StudentDto>(`/students/${uuid}`)
    Object.assign(form, data)
    tags.value = data.tags || []
  } catch (e) {
    console.error(e)
    error.value = 'Não foi possível carregar os dados.'
  } finally {
    loading.value = false
  }
})

function addTag() {
  const t = form.newTag?.trim() || ''
  if (t && !tags.value.includes(t)) tags.value.push(t)
  form.newTag = ''
}
function removeTag(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag)
}

function triggerCurriculumUpload() {
  curriculumInput.value?.click()
}
function triggerHistoryUpload() {
  historyInput.value?.click()
}

async function onCurriculumChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loadingCurriculum.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    await api.patch(`/students/${uuid}/curriculum`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('Currículo enviado!')
  } catch {
    alert('Falha ao enviar currículo.')
  } finally {
    loadingCurriculum.value = false
  }
}

async function onHistoryChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loadingHistory.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    await api.patch(`/students/${uuid}/history`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('Histórico enviado!')
  } catch {
    alert('Falha ao enviar histórico.')
  } finally {
    loadingHistory.value = false
  }
}

async function handleSave() {
  if (!form.name) return alert('Informe o nome.')
  if (!form.email) return alert('Informe o email.')

  saving.value = true
  try {
    await api.patch(`/students/${uuid}`, {
      name: form.name,
      email: form.email,
      course: form.course,
      registrationNumber: form.registrationNumber,
      description: form.description,
      lattes: form.lattes,
      phone: form.phone,
      tags: tags.value,
      cep: form.cep,
      street: form.street,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
    })
    await router.push({ name: 'student-profile', params: { uuid } })
    window.location.reload()
  } catch (e) {
    console.error(e)
    alert('Erro ao salvar dados.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: Inter, sans-serif;
}

.loading,
.error {
  text-align: center;
  margin: 3rem auto;
  color: var(--color-on-surface-variant);
}

/* Banner + avatar */
.banner-container {
  position: relative;
  margin-bottom: 3rem;
}
.banner {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}
.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
}
.avatar {
  width: 80px;
  height: 80px;
  border: 4px solid var(--color-background);
  border-radius: 50%;
  object-fit: cover;
}

/* Docs buttons */
.docs-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.doc-btn {
  background: var(--color-on-surface);
  color: var(--color-surface);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

/* Form fields */
.edit-form {
  margin-top: 2rem;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.field label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-on-surface);
}
.field input,
.field textarea {
  padding: 0.75rem;
  border: none;
  background: var(--color-surface-variant);
  color: var(--color-on-surface);
  border-radius: 999px;
  font-size: 1rem;
}
.field textarea {
  border-radius: 8px;
}

/* Tags */
.tags-input {
  display: flex;
  gap: 0.5rem;
}
.btn-small {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.tags-list {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag-chip {
  background: var(--color-surface);
  color: var(--color-on-surface);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.tag-chip button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
}

/* Botão Salvar */
.btn-save {
  width: 100%;
  background: var(--color-on-surface);
  color: var(--color-surface);
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2rem;
}

/* Responsivo */
@media (max-width: 600px) {
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
