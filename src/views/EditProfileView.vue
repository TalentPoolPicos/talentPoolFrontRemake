<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useStudentStore } from '@/stores/student'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useTagStore } from '@/stores/tag'
import { Routes } from '@/router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import ImageUser from '@/components/ImageUser.vue'

const router = useRouter()

const userStore = useUserStore()
const studentStore = useStudentStore()
const enterpriseStore = useEnterpriseStore()
const tagStore = useTagStore()

const role = ref<'student' | 'enterprise'>('student')

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const curriculumFile = ref<File | null>(null)
const historyFile = ref<File | null>(null)

const form = ref({
  name: '',
  email: '',
  description: '',
  tags: [] as string[],
  course: '',
  registrationNumber: '',
  lattes: '',
  fantasyName: '',
  cnpj: '',
  socialReason: '',
})

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

const handleCurriculumChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  curriculumFile.value = files && files[0] ? files[0] : null
}
const handleHistoryChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  historyFile.value = files && files[0] ? files[0] : null
}

const loadData = async () => {
  if (!userStore.loggedUser) {
    router.push('/')
    return
  }

  role.value =
    userStore.loggedUser.role === 'student' || userStore.loggedUser.role === 'enterprise'
      ? userStore.loggedUser.role
      : 'student'

  if (role.value === 'student' && userStore.loggedUser.student) {
    const s = userStore.loggedUser.student
    form.value.name = s.name ?? ''
    form.value.email = s.email ?? ''
    form.value.description = s.description ?? ''
    form.value.registrationNumber = s.registrationNumber ?? ''
    form.value.lattes = s.lattes ?? ''

    // Busca as tags do usuário
    const tagDtos = userStore.loggedUser.uuid
      ? await tagStore.findAllByUserUuid(userStore.loggedUser.uuid)
      : []
    form.value.tags = tagDtos.map((t: { label: string }) => t.label)
  } else if (role.value === 'enterprise' && userStore.loggedUser.enterprise) {
    const e = userStore.loggedUser.enterprise
    form.value.name = e.name ?? ''
    form.value.email = e.email ?? ''
    form.value.description = e.description ?? ''
    form.value.fantasyName = e.fantasyName ?? ''
    form.value.cnpj = e.cnpj ?? ''
    form.value.socialReason = e.socialReason ?? ''

    // Busca as tags do usuário
    const tagDtos = userStore.loggedUser.uuid
      ? await tagStore.findAllByUserUuid(userStore.loggedUser.uuid)
      : []
    form.value.tags = tagDtos.map((t) => t.label)
  } else {
    error.value = 'Perfil não disponível para edição.'
  }
  loading.value = false
}

const validate = (): boolean => {
  error.value = null
  if (!form.value.name.trim()) {
    error.value = 'Nome é obrigatório.'
    return false
  }
  if (!form.value.email.trim()) {
    error.value = 'Email é obrigatório.'
    return false
  }
  if (role.value === 'student') {
    if (!form.value.registrationNumber.trim()) {
      error.value = 'Número da matrícula é obrigatório para talentos.'
      return false
    }
  } else if (role.value === 'enterprise') {
    if (!form.value.fantasyName.trim()) {
      error.value = 'Nome fantasia é obrigatório para empresas.'
      return false
    }
    if (!form.value.cnpj.trim()) {
      error.value = 'CNPJ é obrigatório para empresas.'
      return false
    }
    if (!form.value.socialReason.trim()) {
      error.value = 'Razão social é obrigatória para empresas.'
      return false
    }
    if (form.value.lattes && !/^https?:\/\//i.test(form.value.lattes)) {
      error.value = 'Informe um URL válido para o Lattes.'
      return false
    }
  }
  return true
}

const save = async () => {
  if (!validate()) return

  saving.value = true
  error.value = null

  try {
    // Salva dados, mas NÃO envia tags neste PATCH
    if (role.value === 'student') {
      const payload = {
        name: form.value.name,
        email: form.value.email,
        description: form.value.description,
        course: form.value.course,
        registrationNumber: form.value.registrationNumber,
        lattes: form.value.lattes,
      }
      await studentStore.partialUpdate(payload)
      if (curriculumFile.value) {
        await studentStore.uploadCurriculum(curriculumFile.value)
      }
      if (historyFile.value) {
        await studentStore.uploadHistory(historyFile.value)
      }
    } else if (role.value === 'enterprise') {
      const payload = {
        name: form.value.name,
        fantasyName: form.value.fantasyName,
        cnpj: form.value.cnpj,
        socialReason: form.value.socialReason,
        email: form.value.email,
        description: form.value.description,
      }
      await enterpriseStore.partialUpdate(payload)
    }

    // Atualiza tags separadamente
    const currentTags = userStore.loggedUser?.uuid
      ? await tagStore.findAllByUserUuid(userStore.loggedUser.uuid)
      : []
    const currentLabels = currentTags.map((t) => t.label)

    const toRemove = currentTags.filter((t) => !form.value.tags.includes(t.label))
    const toAdd = form.value.tags.filter((t) => !currentLabels.includes(t))

    await Promise.all(toRemove.map((t) => tagStore.remove(t.uuid)))
    await Promise.all(toAdd.map((label) => tagStore.create({ label })))

    alert('Perfil atualizado com sucesso!')
    await userStore.fetch()

    // Redireciona para a página do perfil logado (sem uuid)
    if (role.value === 'student') {
      router.push({ name: Routes.StudentLoggedProfile }) // /talent
    } else {
      router.push({ name: Routes.EnterpriseLoggedProfile }) // /enterprise
    }
  } catch {
    error.value = 'Erro ao salvar o perfil.'
  } finally {
    saving.value = false
  }
}

const addTag = () => {
  console.log('addTag')
  const newTag = prompt('Digite uma nova tag:')
  if (newTag && !form.value.tags.includes(newTag)) {
    form.value.tags.push(newTag)
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <LoadingBrand :loading="loading">
    <div class="image-user-container">
      <ImageUser :user="userStore.loggedUser" class="image-user-componente" />
    </div>

    <div class="edit-profile">
      <h1>Editar perfil: {{ role === 'student' ? 'Talento' : 'Empresa' }}</h1>
      <form @submit.prevent="save">
        <div v-if="error" class="error">{{ error }}</div>

        <div class="row">
          <div class="field">
            <label>Nome</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" v-model="form.email" required />
          </div>
        </div>

        <div v-if="role === 'student'" class="row">
          <div class="field full-width">
            <label>Link Lattes</label>
            <input type="url" v-model="form.lattes" placeholder="https://lattes.cnpq.br/..." />
          </div>
        </div>

        <div v-if="role === 'student'" class="row">
          <div class="field">
            <label>Currículo (PDF)</label>
            <input type="file" accept="application/pdf" @change="handleCurriculumChange" />
            <small v-if="curriculumFile">{{ curriculumFile.name }}</small>
          </div>
          <div class="field">
            <label>Histórico escolar (PDF)</label>
            <input type="file" accept="application/pdf" @change="handleHistoryChange" />
            <small v-if="historyFile">{{ historyFile.name }}</small>
          </div>
        </div>

        <label>Descrição</label>
        <textarea
          v-model="form.description"
          placeholder="Descreva-se brevemente"
          required
          rows="4"
          style="
            resize: none;
            min-width: 200px;
            max-width: 620px;
            min-height: 120px;
            max-height: 120px;
          "
        ></textarea>

        <div v-if="role === 'student'" class="row">
          <div class="field">
            <label>Curso</label>
            <input type="text" v-model="form.course" required />
          </div>
          <div class="field">
            <label>Número da matrícula</label>
            <input type="text" v-model="form.registrationNumber" required />
          </div>
        </div>

        <div v-if="role === 'enterprise'" class="row">
          <div class="field">
            <label>Nome fantasia</label>
            <input type="text" v-model="form.fantasyName" required />
          </div>
          <div class="field">
            <label>CNPJ</label>
            <input type="text" v-model="form.cnpj" required />
          </div>
          <div class="field full-width">
            <label>Razão social</label>
            <input type="text" v-model="form.socialReason" required />
          </div>
        </div>

        <h3>Tags</h3>
        <div class="tags">
          <span v-for="tag in form.tags" :key="tag" class="tag">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">×</button>
          </span>
          <button type="button" @click="addTag" class="btn-add-tag">Adicionar tag</button>
        </div>

        <button type="submit" :disabled="saving" class="btn-submit">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </form>
    </div>
  </LoadingBrand>
</template>

<style scoped>
.image-user-componente {
  max-width: 1000px;
  padding: 1rem;
}
.image-user-container {
  width: 100vw;
  display: flex;
  justify-content: center;
}
.edit-profile {
  max-width: 650px;
  margin: 2rem auto;
  font-family: Inter, sans-serif;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.field.full-width {
  flex: 1 1 100%;
}

label {
  font-weight: 600;
  color: var(--color-on-surface);
}

input,
textarea {
  padding: 0.6rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-outline);
  transition: border-color 0.3s;
  color: var(--color-on-surface);
  background: var(--color-surface);
  font-family: Inter, sans-serif;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.tag {
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  user-select: none;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag button {
  background: transparent;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: var(--color-error);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.2rem;
  margin-left: 0.3rem;
}

.btn-add-tag {
  background: transparent;
  border: 1px dashed var(--color-outline);
  padding: 6px 14px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  transition: background-color 0.3s;
}

.btn-add-tag:hover {
  background-color: var(--color-surface-variant);
}

.btn-submit {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 700;
  font-size: 1.1rem;
  padding: 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  align-self: flex-start;
  min-width: 120px;
  transition: background-color 0.3s;
}

.btn-submit:disabled {
  background-color: var(--color-outline);
  cursor: not-allowed;
}

.error {
  color: var(--color-error);
  font-weight: 600;
}
</style>
