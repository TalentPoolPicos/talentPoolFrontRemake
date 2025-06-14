<!-- src/views/Registration.vue -->
<template>
  <div class="page registration">
    <!-- barra de título -->
    <div class="page-header registration">
      <span>Cadastro</span>
    </div>

    <main class="registration-grid">
      <!-- ilustração -->
      <div class="illustration">
        <div class="shape"></div>
        <img src="@/assets/hero-illustration.png" alt="Cadastro" />
      </div>

      <!-- formulário -->
      <div class="registration-card">
        <h2>Banco de Talentos<br />para estudantes e empresas</h2>

        <form @submit.prevent="onRegister" class="auth-form">
          <!-- nome do usuário ou organização -->
          <input type="text" placeholder="Nome" v-model="username" required />

          <!-- email -->
          <input type="email" placeholder="Email" v-model="email" required />

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
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

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
import { Routes } from '@/router'
import type { components } from '@/types/api'
import eyeOpen from '@/assets/1visibility_pass.svg'
import eyeClosed from '@/assets/0visibility_pass.svg'

type SignUpDto = components['schemas']['SignUpDto']

// Define prop role recebida da rota
const props = defineProps<{ role: 'student' | 'enterprise' }>()
const role = props.role ?? 'student' // fallback

console.log('Role recebido:', role)

const username = ref('')
const email = ref('')
const password = ref('')
const password2 = ref('')

const showPwd = ref(false)
const showPwd2 = ref(false)
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

function isStrongPassword(pwd: string): boolean {
  // Pelo menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  return strongRegex.test(pwd)
}

const passwordError = ref('')

const onRegister = async () => {
  passwordError.value = ''

  if (!isStrongPassword(password.value)) {
    passwordError.value =
      'Senha fraca: use maiúsculas, minúsculas, números e símbolos, mínimo 8 caracteres.'
    return
  }

  if (password.value !== password2.value) {
    alert('As senhas não coincidem.')
    return
  }

  if (password.value !== password2.value) {
    alert('As senhas não coincidem.')
    return
  }

  // Se precisar, faça validações específicas do role aqui

  const payload: SignUpDto = {
    username: username.value,
    email: email.value,
    password: password.value,
  }

  loading.value = true
  try {
    // Passa o role recebido para a função de signUp
    await auth.signUp(payload, role)
    router.push({ name: Routes.Home })
  } catch {
    alert(err.response?.data?.message || 'Erro ao cadastrar.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* estilos adaptados com novos nomes */

.nav-bar {
  position: relative;
  z-index: 10;
}

.page-header.registration {
  width: 100%;
  height: 3rem;
  background: var(--color-secondary-container);
  display: flex;
  align-items: center;
  padding-inline: 2rem;
  border-radius: 0 0 0.5rem 0.5rem;
  color: var(--color-on-secondary-container);
  font-size: 1.1rem;
  font-weight: 500;
}

.registration-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  padding: 2rem 4rem;
  background: var(--color-surface);
  min-height: calc(100vh - 64px - 3rem);
}

.illustration {
  position: relative;
}
.shape {
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--color-background-mute);
  border-radius: 1.5rem;
  top: -1rem;
  left: -1rem;
  z-index: 0;
}
.illustration img {
  position: relative;
  width: 100%;
  height: auto;
  z-index: 1;
}

.registration-card {
  background: var(--color-secondary-container);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.registration-card h2 {
  margin-bottom: 1.5rem;
  color: var(--color-text);
  font-size: 1.75rem;
  line-height: 1.2;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.auth-form input {
  height: 2.5rem;
  border-radius: 0.75rem;
  border: none;
  padding: 0 1rem 0 1rem;
  padding-right: 3rem;
  font-size: 0.95rem;
  background: var(--color-always-white);
  width: 100%;
  box-sizing: border-box;
}

.pwd-wrapper {
  position: relative;
  width: 100%;
}
.pwd-wrapper .eye {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}
.pwd-wrapper .eye img {
  width: 100%;
  height: 100%;
  display: block;
}

.btn-primary {
  width: 100%;
  margin-top: 1rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  height: 3.5rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.85;
}

.error-message {
  color: var(--color-error);
  font-size: 0.85rem;
  margin-top: 0.2rem;
  margin-bottom: 0.8rem;
}

/* =================== tablets (≤ 1024 px) =================== */
@media (max-width: 1024px) {
  .registration-grid {
    padding: 2rem;
    gap: 1.5rem;
  }
  .registration-card {
    padding: 2rem;
  }
  .registration-card h2 {
    font-size: 1.6rem;
  }
}

/* =================== móveis (≤ 768 px) =================== */
@media (max-width: 768px) {
  .registration-grid {
    grid-template-columns: 1fr; /* quebra em 1 coluna */
    padding: 1.5rem;
  }
  .illustration {
    display: none; /* oculta imagem */
  }
  .registration-card {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }
  .page-header.registration {
    font-size: 1rem;
    padding-inline: 1rem;
  }
}

/* =================== mini-móveis (≤ 480 px) =================== */
@media (max-width: 480px) {
  .registration-card {
    padding: 1.5rem;
  }
  .registration-card h2 {
    font-size: 1.4rem;
  }
  .auth-form input {
    font-size: 0.9rem;
  }
  .btn-primary {
    font-size: 1rem;
  }
}
</style>
