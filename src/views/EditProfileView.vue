<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useStudentStore } from '@/stores/student'
import { useEnterpriseStore } from '@/stores/enterprise'
import { useTagStore } from '@/stores/tag'
import { useAddressStore } from '@/stores/address'
import { userSocialMediaStore } from '@/stores/socialmedia'
import type { CreateOrUpdateAddressDto } from '@/stores/address'
import { Routes } from '@/router'
import LoadingBrand from '@/components/LoadingBrand.vue'
import ImageUser from '@/components/ImageUser.vue'

/* stores */
const router = useRouter()
const userStore = useUserStore()
const studentStore = useStudentStore()
const enterpriseStore = useEnterpriseStore()
const tagStore = useTagStore()
const addressStore = useAddressStore()
const socialStore = userSocialMediaStore()

/* state */
const role = ref<'student' | 'enterprise'>('student')
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const curriculumFile = ref<File | null>(null)
const historyFile = ref<File | null>(null)

/* dados básicos */
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

/* links sociais */
const socials = ref({
  discord: '',
  linkedin: '',
  github: '',
})

/* endereço */
const addressForm = ref<CreateOrUpdateAddressDto>({
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
})

/* helpers */
const removeTag = (t: string) => (form.value.tags = form.value.tags.filter((x) => x !== t))
const handleCurriculumChange = (e: Event) =>
  (curriculumFile.value = (e.target as HTMLInputElement).files?.[0] ?? null)
const handleHistoryChange = (e: Event) =>
  (historyFile.value = (e.target as HTMLInputElement).files?.[0] ?? null)

const addTag = () => {
  const newTag = prompt('Digite o nome da nova tag:')
  if (newTag && newTag.trim() && !form.value.tags.includes(newTag.trim())) {
    form.value.tags.push(newTag.trim())
  }
}

/* carregar dados ---------------------------------------------------- */
const loadData = async () => {
  if (!userStore.loggedUser) {
    router.push('/')
    return
  }

  role.value =
    userStore.loggedUser.role === 'student' || userStore.loggedUser.role === 'enterprise'
      ? userStore.loggedUser.role
      : 'student'

  try {
    /* user */
    if (role.value === 'student' && userStore.loggedUser.student) {
      const s = userStore.loggedUser.student
      Object.assign(form.value, {
        name: s.name ?? '',
        email: s.email ?? '',
        description: s.description ?? '',
        registrationNumber: s.registrationNumber ?? '',
        lattes: s.lattes ?? '',
        course: s.course ?? '',
      })
    } else if (role.value === 'enterprise' && userStore.loggedUser.enterprise) {
      const e = userStore.loggedUser.enterprise
      Object.assign(form.value, {
        name: e.name ?? '',
        email: e.email ?? '',
        description: e.description ?? '',
        fantasyName: e.fantasyName ?? '',
        cnpj: e.cnpj ?? '',
        socialReason: e.socialReason ?? '',
      })
    }

    /* tags */
    const tagDtos = userStore.loggedUser.tags || []
    form.value.tags = tagDtos.map((t) => t.label)

    const addr = userStore.loggedUser.address
    if (addr) Object.assign(addressForm.value, addr)

    /* links sociais */
    const list = userStore.loggedUser.socialMedia || []
    list.forEach((s) => {
      if (s.type in socials.value) (socials.value as Record<string, string>)[s.type] = s.url
    })
  } catch {
    error.value = 'Erro ao carregar dados.'
  } finally {
    loading.value = false
  }
}

/* validação básica igual à anterior ------------------------------- */
const validate = (): boolean => {
  error.value = null
  if (!form.value.name.trim()) return (error.value = 'Nome é obrigatório.'), false
  if (!form.value.email.trim()) return (error.value = 'Email é obrigatório.'), false
  if (!addressForm.value.street) return (error.value = 'Logradouro é obrigatório.'), false
  if (!addressForm.value.city) return (error.value = 'Cidade é obrigatória.'), false
  if (!addressForm.value.state) return (error.value = 'Estado é obrigatório.'), false
  return true
}

/* salvar ----------------------------------------------------------- */
const save = async () => {
  if (!validate()) return
  saving.value = true
  error.value = null

  try {
    /* -------- user -------- */
    if (role.value === 'student') {
      await studentStore.partialUpdate({
        name: form.value.name,
        email: form.value.email,
        description: form.value.description,
        course: form.value.course,
        registrationNumber: form.value.registrationNumber,
        lattes: form.value.lattes,
      })
      if (curriculumFile.value) await studentStore.uploadCurriculum(curriculumFile.value)
      if (historyFile.value) await studentStore.uploadHistory(historyFile.value)
    } else {
      await enterpriseStore.partialUpdate({
        name: form.value.name,
        fantasyName: form.value.fantasyName,
        cnpj: form.value.cnpj,
        socialReason: form.value.socialReason,
        email: form.value.email,
        description: form.value.description,
      })
    }

    /* -------- endereço -------- */
    await addressStore.createOrUpdate(addressForm.value)

    /* -------- links sociais -------- */
    const existing = await socialStore.findAllByUserUuid(userStore.loggedUser!.uuid)

    const handleLink = async (type: 'discord' | 'linkedin' | 'github', url: string) => {
      const prev = existing.find((s) => s.type === type)
      if (url.trim()) {
        await socialStore.createOrUpdate({ type, url })
      } else if (prev) {
        await socialStore.remove(prev.uuid)
      }
    }

    await Promise.all([
      handleLink('discord', socials.value.discord),
      handleLink('linkedin', socials.value.linkedin),
      handleLink('github', socials.value.github),
    ])

    /* -------- tags -------- */
    const currentTags = await tagStore.findAllByUserUuid(userStore.loggedUser!.uuid)
    const currentLabels = currentTags.map((t) => t.label)
    const toRemove = currentTags.filter((t) => !form.value.tags.includes(t.label))
    const toAdd = form.value.tags.filter((t) => !currentLabels.includes(t))
    await Promise.all(toRemove.map((t) => tagStore.remove(t.uuid)))
    await Promise.all(toAdd.map((l) => tagStore.create({ label: l })))

    alert('Perfil atualizado com sucesso!')
    await userStore.fetch()
    router.push({
      name: role.value === 'student' ? Routes.StudentLoggedProfile : Routes.EnterpriseLoggedProfile,
    })
  } catch {
    error.value = 'Erro ao salvar o perfil.'
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <LoadingBrand :loading="loading">
    <div class="banner-edit-wrapper">
      <ImageUser :user="userStore.loggedUser" editable />
    </div>

    <div class="edit-profile">
      <h1>Editar perfil: {{ role === 'student' ? 'Talento' : 'Empresa' }}</h1>

      <form @submit.prevent="save">
        <div v-if="error" class="error">{{ error }}</div>

        <!-- nome / email -->
        <div class="row two-cols">
          <div class="field">
            <label>Nome</label>
            <input v-model="form.name" required />
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" v-model="form.email" required />
          </div>
        </div>

        <!-- descrição -->
        <div class="row">
          <div class="field full-width">
            <label>Descrição</label>
            <textarea v-model="form.description" required style="resize: none"></textarea>
          </div>
        </div>

        <!-- curso / matrícula -->
        <div v-if="role === 'student'" class="row two-cols">
          <div class="field">
            <label>Curso</label>
            <input v-model="form.course" required />
          </div>
          <div class="field">
            <label>Número da matrícula</label>
            <input v-model="form.registrationNumber" required />
          </div>
        </div>

        <!-- enterprise extras -->
        <div v-if="role === 'enterprise'" class="row two-cols">
          <div class="field">
            <label>Nome fantasia</label>
            <input v-model="form.fantasyName" required />
          </div>
          <div class="field">
            <label>CNPJ</label>
            <input v-model="form.cnpj" required />
          </div>
          <div class="field full-width">
            <label>Razão social</label>
            <input v-model="form.socialReason" required />
          </div>
        </div>

        <!-- endereço -->
        <div class="row">
          <div class="field full-width">
            <label>Logradouro</label>
            <input v-model="addressForm.street" required />
          </div>
          <div class="field">
            <label>Bairro</label>
            <input v-model="addressForm.neighborhood" required />
          </div>
          <div class="field">
            <label>Cidade</label>
            <input v-model="addressForm.city" required />
          </div>
          <div class="field">
            <label>Estado</label>
            <input v-model="addressForm.state" required />
          </div>
          <div class="field">
            <label>CEP</label>
            <input v-model="addressForm.zipCode" required />
          </div>
        </div>
        <!-- links sociais -->
        <div class="row" style="flex-direction: column">
          <div class="field">
            <label>Discord</label>
            <input v-model="socials.discord" type="url" placeholder="https://discord.gg/…" />
          </div>

          <div class="field">
            <label>LinkedIn</label>
            <input v-model="socials.linkedin" type="url" placeholder="https://linkedin.com/in/…" />
          </div>

          <div class="field">
            <label>GitHub</label>
            <input v-model="socials.github" type="url" placeholder="https://github.com/…" />
          </div>
        </div>

        <!-- student extras -->
        <div v-if="role === 'student'">
          <!-- Lattes -->
          <div class="row">
            <div class="field full-width">
              <label>Link Lattes</label>
              <input v-model="form.lattes" placeholder="https://lattes.cnpq.br/..." />
            </div>
          </div>
          <!-- arquivos -->
          <div class="row two-cols">
            <div class="field">
              <label>Currículo (PDF)</label>
              <label class="file-btn">
                {{ curriculumFile ? 'Alterar arquivo' : 'Selecionar' }}
                <input
                  type="file"
                  accept="application/pdf"
                  class="hidden-input"
                  @change="handleCurriculumChange"
                />
              </label>
              <small v-if="curriculumFile">{{ curriculumFile.name }}</small>
            </div>

            <div class="field">
              <label>Histórico escolar (PDF)</label>
              <label class="file-btn">
                {{ historyFile ? 'Alterar arquivo' : 'Selecionar' }}
                <input
                  type="file"
                  accept="application/pdf"
                  class="hidden-input"
                  @change="handleHistoryChange"
                />
              </label>
              <small v-if="historyFile">{{ historyFile.name }}</small>
            </div>
          </div>
        </div>

        <!-- tags -->
        <div class="tags">
          <span v-for="tag in form.tags" :key="tag" class="tag">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">×</button>
          </span>
          <button type="button" class="btn-add-tag" @click="addTag">Adicionar tag</button>
        </div>

        <!-- salvar -->
        <button type="submit" class="btn-submit" :disabled="saving">
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </form>
    </div>
  </LoadingBrand>
</template>

<style scoped>
/* ---------- CONTAINERS ---------- */
.banner-edit-wrapper {
  max-width: 1100px;
  margin: 0 auto 3.5rem;
  padding: 0 1rem;
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
  gap: 1.2rem; /* espaço entre grupos maiores */
}

/* ---------- GRID DE CAMPOS ---------- */
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.row:last-of-type {
  margin-bottom: 0;
}

/* linhas com duas colunas iguais */
.row.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1rem;
}

@media (max-width: 580px) {
  .row.two-cols {
    grid-template-columns: 1fr; /* quebra para 1 coluna */
  }
}

.field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.field + .field {
  margin-top: 0.6rem; /* quando empilha no mobile */
}

.row.two-cols .field + .field {
  margin-top: 0; /* sem margem vertical no grid */
}

.field.full-width {
  flex: 1 1 100%;
}

/* ---------- CAMPOS DE TEXTO ---------- */
label {
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 0.25rem;
}

input,
textarea {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid var(--color-outline);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-on-surface);
  font-family: Inter, sans-serif;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

textarea {
  resize: vertical;
  min-height: 90px;
  max-height: 200px;
  line-height: 1.5;
}

/* ---------- INPUT FILE (estilo original) ---------- */
input[type='file'].btn-file {
  color: transparent;
  background: transparent;
  width: 100%; /*ocupa a linha inteira */
}

input[type='file'].btn-file::file-selector-button,
input[type='file'].btn-file::file-upload-button {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s; /* sem sombra ou elevação */
}

input[type='file'].btn-file:hover::file-selector-button,
input[type='file'].btn-file:hover::file-upload-button {
  background: var(--color-primary-container);
  transform: none; /* sem elevação */
}

label.filled {
  color: var(--color-primary);
}

/* ---------- TAGS ---------- */
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
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tag button {
  background: transparent;
  border: none;
  color: var(--color-error);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}

.btn-add-tag {
  background: transparent;
  border: 1px dashed var(--color-outline);
  padding: 6px 14px;
  border-radius: 15px;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-add-tag:hover {
  background: var(--color-surface-variant);
}

/* ---------- BOTÃO SALVAR ---------- */
.btn-submit {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 100px;
  cursor: pointer;
  align-self: flex-start;
  transition: background 0.3s;
}

.btn-submit:hover {
  background: var(--color-primary-container);
}

.btn-submit:disabled {
  background: var(--color-outline);
  cursor: not-allowed;
}

/* ---------- BOTÃO “SELECIONAR” (arquivo) ---------- */
.file-btn {
  /* largura total da coluna, centraliza texto */
  display: block;
  width: 100%;
  text-align: center;

  background: var(--color-primary);
  color: var(--color-on-primary);

  /* tamanho reduzido */
  padding: 0.45rem 1rem; /* ↓ altura  */
  font-size: 0.9rem; /* ↓ fonte   */

  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s;
}

.file-btn:hover {
  background: var(--color-primary-container);
}

/* input real escondido */
.hidden-input {
  display: none;
}

/* -------- REMOVER cor diferente quando “filled” -------- */
label.filled {
  /* apenas mantém a cor padrão do texto do label */
  color: var(--color-on-surface);
}

.social-links {
  list-style: none;
  padding: 0;
  margin: 0;
}
.social-links li {
  margin: 0.5rem 0;
}
.sm-link {
  text-decoration: none;
  color: var(--color-primary);
  font-weight: 600;
}
.sm-link:hover {
  text-decoration: underline;
}

/* ---------- ERRO ---------- */
.error {
  text-align: center;
  color: var(--color-error);
  font-weight: 600;
}
</style>
