<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useStudentStore } from '@/stores/student'
import { useEnterpriseStore } from '@/stores/enterprise'

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const studentStore = useStudentStore()
const enterpriseStore = useEnterpriseStore()

const role = route.query.role === 'enterprise' ? 'enterprise' : 'student' // default student

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  // Campos comuns
  name: '',
  email: '',
  description: '',
  phone: '',
  tags: [] as string[],

  // Student only
  course: '',
  registrationNumber: '',

  // Enterprise only
  fantasyName: '',
  cnpj: '',
  socialReason: '',

  address: {
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  },
})

const loadData = () => {
  if (!userStore.loggedUser) {
    router.push('/')
    return
  }

  if (role === 'student' && userStore.loggedUser.role === 'student') {
    const s = userStore.loggedUser.student
    form.value.name = s?.name ?? ''
    form.value.email = s?.email ?? ''
    form.value.description = s?.description ?? ''

    form.value.registrationNumber = s?.registrationNumber ?? ''
    form.value.tags = [...(userStore.loggedUser.tags ?? [])]
  } else if (role === 'enterprise' && userStore.loggedUser.role === 'enterprise') {
    const e = userStore.loggedUser.enterprise
    form.value.name = e?.name ?? ''
    form.value.email = e?.email ?? ''
    form.value.description = e?.description ?? ''
    form.value.fantasyName = e?.fantasyName ?? ''
    form.value.cnpj = e?.cnpj ?? ''
    form.value.socialReason = e?.socialReason ?? ''
    form.value.tags = [...(userStore.loggedUser.tags ?? [])]
  } else {
    error.value = 'Perfil não disponível para edição.'
  }
  loading.value = false
}

const save = async () => {
  saving.value = true
  error.value = null

  try {
    if (role === 'student') {
      // Payload apenas com campos de estudante
      const payload = {
        name: form.value.name,
        email: form.value.email,
        description: form.value.description,
        phone: form.value.phone,
        course: form.value.course,
        registrationNumber: form.value.registrationNumber,
        address: form.value.address,
        tags: form.value.tags,
      }
      await studentStore.partialUpdate(payload)
    } else if (role === 'enterprise') {
      // Payload apenas com campos de empresa
      const payload = {
        name: form.value.name,
        fantasyName: form.value.fantasyName,
        cnpj: form.value.cnpj,
        socialReason: form.value.socialReason,
        email: form.value.email,
        description: form.value.description,
        phone: form.value.phone,
        address: form.value.address,
        tags: form.value.tags,
      }
      await enterpriseStore.partialUpdate(payload)
    }
    alert('Perfil atualizado com sucesso!')
    await userStore.fetch()
    // Redireciona para o perfil correto após salvar
    if (role === 'student') {
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

    <div v-if="loading">Carregando dados...</div>
    <div v-else>
      <form @submit.prevent="save">
        <div v-if="error" class="error">{{ error }}</div>

        <label>Nome</label>
        <input type="text" v-model="form.name" required />

        <label>Email</label>
        <input type="email" v-model="form.email" required />

        <label>Descrição</label>
        <textarea v-model="form.description"></textarea>

        <label>Telefone</label>
        <input type="text" v-model="form.phone" />

        <div v-if="role === 'student'">
          <label>Curso</label>
          <input type="text" v-model="form.course" />

          <label>Número da matrícula</label>
          <input type="text" v-model="form.registrationNumber" />
        </div>

        <div v-if="role === 'enterprise'">
          <label>Nome fantasia</label>
          <input type="text" v-model="form.fantasyName" />

          <label>CNPJ</label>
          <input type="text" v-model="form.cnpj" />

          <label>Razão social</label>
          <input type="text" v-model="form.socialReason" />
        </div>

        <h3>Tags</h3>
        <div class="tags">
          <span v-for="tag in form.tags" :key="tag" class="tag">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">x</button>
          </span>
          <button type="button" @click="addTag">Adicionar tag</button>
        </div>

        <h3>Endereço</h3>
        <label>CEP</label>
        <input type="text" v-model="form.address.cep" />

        <label>Rua</label>
        <input type="text" v-model="form.address.street" />

        <label>Bairro</label>
        <input type="text" v-model="form.address.neighborhood" />

        <label>Cidade</label>
        <input type="text" v-model="form.address.city" />

        <label>Estado</label>
        <input type="text" v-model="form.address.state" />

        <button type="submit" :disabled="saving">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-profile {
  max-width: 600px;
  margin: 2rem auto;
  font-family: Inter, sans-serif;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-weight: 600;
}

input,
textarea {
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag {
  background: #eee;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: #a00;
}

button[type='submit'] {
  background: black;
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
button[type='submit']:disabled {
  background: #666;
  cursor: not-allowed;
}

.error {
  color: red;
  font-weight: 600;
  margin-bottom: 1rem;
}
</style>
