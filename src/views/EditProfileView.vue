<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useStudentStore } from '@/stores/student'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useTagStore } from '@/stores/tag'

const router = useRouter()

const userStore = useUserStore()
const studentStore = useStudentStore()
const enterpriseStore = useEnterpriseStore()
const tagStore = useTagStore()

const role = ref<'student' | 'enterprise'>('student')

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  description: '',
  tags: [] as string[],
  course: '',
  registrationNumber: '',
  fantasyName: '',
  cnpj: '',
  socialReason: '',
})

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

    // Busca as tags do usuário
    const tagDtos = (await tagStore.findAllByUserUuid)
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
    const tagDtos = await tagStore.findAllByUserUuid(userStore.loggedUser.uuid)
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
    if (!form.value.course.trim()) {
      error.value = 'Curso é obrigatório para talentos.'
      return false
    }
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
      }
      await studentStore.partialUpdate(payload)
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
    // Para simplificar, primeiro removemos todas as tags existentes e depois criamos as novas
    // Buscar tags atuais
    const currentTags = tagStore.findAllByUserUuid
      ? await tagStore.findAllByUserUuid(userStore.loggedUser!.uuid)
      : []
    const currentLabels = currentTags.map((t) => t.label)

    // Tags para remover
    const toRemove = currentTags.filter((t) => !form.value.tags.includes(t.label))
    // Tags para adicionar
    const toAdd = form.value.tags.filter((t) => !currentLabels.includes(t))

    // Remove tags
    await Promise.all(toRemove.map((t) => tagStore.remove(t.uuid)))
    // Cria tags
    await Promise.all(toAdd.map((label) => tagStore.create({ label })))

    alert('Perfil atualizado com sucesso!')
    await userStore.fetch()
    if (role.value === 'student') {
      router.push({ name: 'StudentLoggedProfile' })
    } else {
      router.push({ name: 'EnterpriseLoggedProfile' })
    }
  } catch {
    error.value = 'Erro ao salvar o perfil.'
  } finally {
    saving.value = false
  }
}

const addTag = () => {
  const newTag = prompt('Digite uma nova tag:')
  if (newTag && !form.value.tags.includes(newTag)) {
    form.value.tags.push(newTag)
  }
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter((t) => t !== tag)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="edit-profile">
    <h1>Editar perfil: {{ role === 'student' ? 'Talento' : 'Empresa' }}</h1>

    <div v-if="loading" class="loading">Carregando dados...</div>
    <div v-else>
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

        <label>Descrição</label>
        <textarea v-model="form.description" rows="4"></textarea>

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
  </div>
</template>

<style scoped>
.edit-profile {
  max-width: 650px;
  margin: 2rem auto;
  font-family: Inter, sans-serif;
  padding: 0 1rem;
}

.loading {
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
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
  margin-bottom: 0.3rem;
}

input,
textarea {
  padding: 0.6rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: vertical;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #000;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.tag {
  background: #eee;
  padding: 5px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  user-select: none;
}

.tag button {
  background: transparent;
  border: none;
  font-weight: bold;
  cursor: pointer;
  color: #a00;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.2rem;
}

.btn-add-tag {
  background: transparent;
  border: 1px dashed #666;
  padding: 6px 14px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  color: #333;
  transition: background-color 0.3s;
}

.btn-add-tag:hover {
  background-color: #ddd;
}

.btn-submit {
  background-color: black;
  color: white;
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
  background-color: #666;
  cursor: not-allowed;
}
</style>
