<!-- src/views/StudentRegister.vue -->
<template>
  <div class="page student">
    <NavBar />

    <div class="page-header">
      <span>Cadastro de Estudante</span>
    </div>

    <main class="student-container">
      <div class="student-card">
        <form @submit.prevent="onRegister" class="auth-form">
          <!-- e-mail -->
          <input
            type="email"
            placeholder="E-mail institucional"
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
              placeholder="Confirmação da senha"
              v-model="password2"
              required
            />
            <span class="eye" @click="showPwd2 = !showPwd2">
              <img :src="showPwd2 ? eyeClosed : eyeOpen" alt="Exibir/ocultar senha" />
            </span>
          </div>

          <!-- username / nome -->
          <input
            type="text"
            placeholder="Nome de usuário"
            v-model="username"
            required
          />

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
import eyeOpen   from '@/assets/1visibility_pass.svg'
import eyeClosed from '@/assets/0visibility_pass.svg'

type SignUpDto = components['schemas']['SignUpDto']

/* ----- estado ----- */
const email     = ref('')
const password  = ref('')
const password2 = ref('')
const username  = ref('')

const showPwd  = ref(false)
const showPwd2 = ref(false)
const loading  = ref(false)

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
    await auth.signUp(payload, 'student')
    router.push({ name: Routes.StudentLoggedProfile }) // ajuste se precisar
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || 'Erro ao cadastrar estudante.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.nav-bar { position: relative; z-index: 10; }

.page-header {
  width: 100%; height: 3rem;
  background: linear-gradient(
    to right,
    var(--color-on-primary-container) 0%,
    var(--color-primary-container)    100%
  );
  display: flex; align-items: center;
  padding-inline: 2rem;
  border-radius: 0 0 1.5rem 1.5rem;
  color: var(--color-on-primary);
  font-size: 1.1rem; font-weight: 500;
  overflow: hidden;
}

.student-container {
  display: flex; justify-content: center; align-items: flex-start;
  padding-top: 2rem; background: var(--color-surface);
  min-height: calc(100vh - 64px - 3rem);
}

.student-card {
  background: var(--color-secondary);
  padding: 2rem 1.5rem; border-radius: 1rem;
  width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }

.auth-form input {
  height: 2.5rem; border-radius: 0.5rem; border: none;
  padding: 0 1rem; padding-right: 3rem;
  font-size: 0.95rem; width: 100%; box-sizing: border-box;
}

/* ------- olhinho ------- */
.pwd-wrapper { position: relative; width: 100%; }
.pwd-wrapper .eye {
  position: absolute; top: 50%; right: 1rem; transform: translateY(-50%);
  width: 1.25rem; height: 1.25rem; cursor: pointer;
}
.pwd-wrapper .eye img { width: 100%; height: 100%; display: block; }

.btn-primary {
  width: 100%; margin-top: 1rem;
  background: var(--color-on-primary-container); color: var(--color-on-primary);
  border: 1px solid var(--color-on-primary);
  height: 3rem; border-radius: 0.5rem;
  font-size: 1rem; font-weight: 600; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
