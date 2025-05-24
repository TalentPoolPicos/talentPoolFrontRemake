<!-- src/views/EnterpriseRegister.vue -->
<template>
  <div class="page enterprise">
    <NavBar />

    <!-- barra de título -->
    <div class="page-header org">
      <span>Cadastro de Organização</span>
    </div>

    <main class="enterprise-grid">
      <!-- ilustração -->
      <div class="illustration">
        <div class="shape"></div>
        <img src="@/assets/hero-illustration.png" alt="Enterprise" />
      </div>

      <!-- formulário -->
      <div class="enterprise-card">
        <h2>Banco de Talentos<br />para empresas</h2>

        <form @submit.prevent="onRegister" class="auth-form">
          <!-- username (nome da org) -->
          <input
            type="text"
            placeholder="Nome da organização"
            v-model="username"
            required
          />

          <!-- email -->
          <input
            type="email"
            placeholder="Email da organização"
            v-model="email"
            required
          />

          <!-- senha -->
          <div class="pwd-wrapper">
            <input
              :type="showPwd ? 'text' : 'password'"
              placeholder="Senha"
              v-model="password"
              required
            />
            <span class="eye" @click="showPwd = !showPwd">
              <img :src="showPwd ? eyeClosed : eyeOpen" alt="Exibir/ocultar senha" />
            </span>
          </div>

          <!-- confirmar senha -->
          <div class="pwd-wrapper">
            <input
              :type="showPwd2 ? 'text' : 'password'"
              placeholder="Confirme a senha"
              v-model="password2"
              required
            />
            <span class="eye" @click="showPwd2 = !showPwd2">
              <img :src="showPwd2 ? eyeClosed : eyeOpen" alt="Exibir/ocultar senha" />
            </span>
          </div>

          <button class="btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Routes } from '@/router'        // garanta que "Home" existe
import type { components } from '@/types/api'
import eyeOpen   from '@/assets/1visibility_pass.svg'
import eyeClosed from '@/assets/0visibility_pass.svg'

type SignUpDto = components['schemas']['SignUpDto']

/* ----- estado ----- */
const username  = ref('')
const email     = ref('')
const password  = ref('')
const password2 = ref('')

const showPwd   = ref(false)
const showPwd2  = ref(false)
const loading   = ref(false)

/* ----- serviços ----- */
const auth   = useAuthStore()
const router = useRouter()

/* ----- submit ----- */
const onRegister = async () => {
  if (password.value !== password2.value) {
    alert('As senhas não coincidem.')
    return
  }

  const payload: SignUpDto = {
    username: username.value,
    email: email.value,
    password: password.value,
  }

  loading.value = true
  try {
    await auth.signUp(payload, 'enterprise')

    router.push({ name: Routes.Home })
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || 'Erro ao cadastrar organização.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* (estilos idênticos aos já fornecidos) */
.nav-bar { position: relative; z-index: 10; }

.page-header.org {
  width: 100%; height: 3rem;
  background: var(--color-secondary-container);
  display: flex; align-items: center;
  padding-inline: 2rem;
  border-radius: 0 0 0.5rem 0.5rem;
  color: var(--color-on-secondary-container);
  font-size: 1.1rem; font-weight: 500;
}

.enterprise-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem; align-items: center;
  padding: 2rem 4rem; background: var(--color-surface);
  min-height: calc(100vh - 64px - 3rem);
}

.illustration { position: relative; }
.shape {
  position: absolute; width: 100%; height: 100%;
  background: var(--color-background-mute);
  border-radius: 1.5rem; top: -1rem; left: -1rem; z-index: 0;
}
.illustration img { position: relative; width: 100%; height: auto; z-index: 1; }

.enterprise-card {
  background: var(--color-secondary-container); padding: 2.5rem;
  border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.enterprise-card h2 {
  margin-bottom: 1.5rem; color: var(--color-text);
  font-size: 1.75rem; line-height: 1.2;
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.auth-form input {
  height: 2.5rem; border-radius: 0.75rem; border: none;
  padding: 0 1rem 0 1rem; padding-right: 3rem;
  font-size: 0.95rem; background: var(--color-always-white);
  width: 100%; box-sizing: border-box;
}

.pwd-wrapper { position: relative; width: 100%; }
.pwd-wrapper .eye {
  position: absolute; top: 50%; right: 1rem; transform: translateY(-50%);
  width: 1.25rem; height: 1.25rem; cursor: pointer;
}
.pwd-wrapper .eye img { width: 100%; height: 100%; display: block; }

.btn-primary {
  width: 100%; margin-top: 1rem;
  background: var(--color-primary); color: var(--color-on-primary);
  height: 3.5rem; border-radius: 0.75rem;
  font-size: 1.1rem; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* =================== tablets (≤ 1024 px) =================== */
@media (max-width: 1024px) {
  .enterprise-grid {
    padding: 2rem;
    gap: 1.5rem;
  }
  .enterprise-card { padding: 2rem; }
  .enterprise-card h2 { font-size: 1.6rem; }
}

/* =================== móveis (≤ 768 px) =================== */
@media (max-width: 768px) {
  .enterprise-grid {
    grid-template-columns: 1fr;           /* quebra em 1 coluna */
    padding: 1.5rem;
  }
  .illustration { display: none; }        /* oculta imagem */
  .enterprise-card {
    width: 100%; max-width: 420px; margin: 0 auto;
  }
  .page-header.org {
    font-size: 1rem; padding-inline: 1rem;
  }
}

/* =================== mini-móveis (≤ 480 px) =================== */
@media (max-width: 480px) {
  .enterprise-card { padding: 1.5rem; }
  .enterprise-card h2 { font-size: 1.4rem; }
  .auth-form input { font-size: 0.9rem; }
  .btn-primary { font-size: 1rem; }
}
</style>
