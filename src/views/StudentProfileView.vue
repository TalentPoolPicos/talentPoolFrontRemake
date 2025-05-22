<template>
  <div class="profile-page">
    <!-- ► CTA superior -->
    <div class="cta-banner">
      <p>
        Quer ter mais sucesso em suas candidaturas?<br />
        fique de olho nas postagens!
      </p>
      <button class="btn-icon edit-cta" @click="editCta">✎</button>
    </div>

    <!-- ► Banner principal -->
    <div class="banner-wrapper">
      <img v-if="user.bannerPicture" :src="user.bannerPicture" alt="Banner" class="banner" />
      <button class="btn-icon edit-banner" @click="goToEditBanner">✎</button>

      <!-- ► Avatar -->
      <div class="avatar-wrapper">
        <img v-if="user.profilePicture" :src="user.profilePicture" alt="Avatar" class="avatar" />
        <button class="btn-icon edit-avatar" @click="goToEdit">✎</button>
      </div>
    </div>

    <!-- ► Badges de documentos -->
    <div class="docs-actions">
      <button v-if="student.curriculum" class="badge">Currículo</button>
      <button v-if="student.history" class="badge">Histórico</button>
      <button v-if="student.lattes" class="badge">Lattes</button>
    </div>

    <!-- ► Conteúdo em 3 colunas -->
    <div class="profile-content grid">
      <!-- COLUNA 1: Informações básicas -->
      <aside class="col info-col">
        <h2 class="name">{{ student.name }}</h2>
        <p class="username">{{ user.username }}</p>
        <p class="email">{{ user.email }}</p>
        <p class="course">{{ student.course }}</p>
        <p class="stack">
          <span v-for="(tag, i) in user.tags" :key="tag">
            #{{ tag }}<span v-if="i + 1 < user.tags.length"> </span>
          </span>
        </p>
        <p class="location">{{ user.location }}</p>

        <div class="badge match">Match</div>
        <button class="btn btn--primary" @click="goToEdit">Editar</button>
      </aside>

      <!-- COLUNA 2: Descrição -->
      <section class="col desc-col">
        <p>{{ student.description || 'Sem descrição.' }}</p>
      </section>

      <!-- COLUNA 3: Sugestões -->
      <aside class="col suggestion-col">
        <div v-for="block in suggestionBlocks" :key="block.title" class="suggestion-block">
          <h4>{{ block.title }}</h4>
          <div class="avatars-row">
            <img v-for="a in block.avatars" :key="a" :src="a" class="avatar-sm" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

/** Tipagens locais **/
interface UserDto {
  uuid: string
  username: string
  email: string
  profilePicture?: string
  bannerPicture?: string
  tags: string[]
  // vamos injetar esta propriedade manualmente:
  location: string
}
interface StudentDto {
  uuid: string
  name?: string
  course?: string
  description?: string
  curriculum?: string
  history?: string
  lattes?: string
}

// roteamento
const route = useRoute()
const router = useRouter()
const uuid = route.params.uuid as string

// estado reativo
const user = reactive<UserDto>({
  uuid: '',
  username: '',
  email: '',
  profilePicture: '',
  bannerPicture: '',
  tags: [],
  location: 'R. Cícero Duarte – Junco, Picos – PI',
})
const student = reactive<StudentDto>({
  uuid: '',
  name: '',
  course: 'Sistemas de Informação',
  description: '',
  curriculum: '',
  history: '',
  lattes: '',
})

// sugestões hard-coded (exemplo)
const suggestionBlocks = ref([
  {
    title: 'Seus matches',
    avatars: [
      'https://i.pravatar.cc/40?img=13',
      'https://i.pravatar.cc/40?img=14',
      'https://i.pravatar.cc/40?img=15',
    ],
  },
  {
    title: 'Te curtiram',
    avatars: [
      'https://i.pravatar.cc/40?img=20',
      'https://i.pravatar.cc/40?img=21',
      'https://i.pravatar.cc/40?img=22',
    ],
  },
  {
    title: 'Talvez você goste',
    avatars: [
      'https://i.pravatar.cc/40?img=30',
      'https://i.pravatar.cc/40?img=31',
      'https://i.pravatar.cc/40?img=32',
    ],
  },
])

onMounted(async () => {
  try {
    // 1) busca dados do usuário
    const { data: u } = await api.get<UserDto>(`/api/v1/users/${uuid}`)
    Object.assign(user, u)

    // 2) busca dados de estudante
    const { data: s } = await api.get<StudentDto>(`/api/v1/students/${uuid}`)
    student.name = s.name || student.name
    student.course = s.course || student.course
    student.description = s.description || ''
    student.curriculum = s.curriculum || ''
    student.history = s.history || ''
    student.lattes = s.lattes || ''
  } catch (e) {
    console.error('falha ao carregar perfil:', e)
  }
})

function goToEdit() {
  router.push({ name: 'student-edit', params: { uuid } })
}
function goToEditBanner() {
  router.push({ name: 'student-edit', params: { uuid } })
}
function editCta() {
  // opcional: navegar para editar banner/cta
}
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: auto;
  padding: 1.5rem;
  font-family: Inter, sans-serif;
  color: var(--color-on-surface);
}

/* ► CTA Banner */
.cta-banner {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cta-banner p {
  margin: 0;
  line-height: 1.3;
}
.btn-icon {
  background: var(--color-surface);
  border: none;
  border-radius: 50%;
  padding: 0.4rem;
  cursor: pointer;
}

/* ► Banner e Avatar */
.banner-wrapper {
  position: relative;
  margin-top: 1rem;
}
.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
.edit-banner {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
  display: flex;
  align-items: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border: 4px solid var(--color-background);
  border-radius: 50%;
  object-fit: cover;
}
.edit-avatar {
  margin-left: 0.5rem;
}

/* ► Botões de docs */
.docs-actions {
  margin-top: 3rem;
  display: flex;
  gap: 0.5rem;
}
.badge {
  padding: 0.5rem 1rem;
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

/* ► Grid de conteúdo */
.profile-content.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.5rem;
  margin-top: 4rem;
}

/* COLUNA 1 */
.info-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.name {
  margin: 0;
  font-size: 1.5rem;
}
.username,
.email,
.course,
.stack,
.location {
  margin: 0;
  color: var(--color-on-surface-variant);
  font-size: 0.9rem;
}
.match {
  display: inline-block;
  background: var(--color-tertiary-container);
  color: var(--color-on-tertiary-container);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}
.btn--primary {
  margin-top: 1rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
}

/* COLUNA 2 */
.desc-col {
  background: var(--color-surface);
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
}

/* COLUNA 3 */
.suggestion-col {
}
.suggestion-block {
  margin-bottom: 1.5rem;
}
.suggestion-block h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--color-on-surface-variant);
}
.avatars-row {
  display: flex;
  gap: 0.5rem;
}
.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* responsivo */
@media (max-width: 900px) {
  .profile-content.grid {
    grid-template-columns: 1fr;
  }
}
</style>
