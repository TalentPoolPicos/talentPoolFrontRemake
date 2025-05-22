<template>
  <div class="login-wrapper">
    <main class="login-form-container">
      <form class="card" @submit.prevent="handleSubmit">
        <div class="input-container">
          <label for="username">Usuário</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Digite seu usuário"
            required
          />
        </div>
        <div class="input-container">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button class="btn btn--primary" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import api from '@/services/api'

const username = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

async function handleSubmit() {
  if (!username.value || !password.value) {
    alert('Por favor, preencha usuário e senha.')
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/student/sign-in', {
      username: username.value,
      password: password.value,
    })

    const { access_token, refresh_token, user } = res.data as {
      access_token: string
      refresh_token: string
      user: { role: string; uuid: string }
    }

    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

    if (user.role === 'student') {
      router.push({ name: 'student-profile', params: { uuid: user.uuid } })
    } else if (user.role === 'enterprise') {
      router.push({ name: 'enterprise-profile', params: { uuid: user.uuid } })
    } else {
      router.push({ name: 'home' })
    }
  } catch (err: unknown) {
    let msg = 'Erro ao fazer login.'
    if (axios.isAxiosError(err) && err.response) {
      const data = err.response.data as Record<string, unknown>
      if (typeof data.message === 'string') msg = data.message
    }
    alert(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  background: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 2rem;
}
.login-form-container {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.input-container {
  display: flex;
  flex-direction: column;
}
.input-container label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--color-on-surface);
}
.input-container input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  font-size: 1rem;
}
.input-container input::placeholder {
  color: var(--color-on-surface-variant);
}
.input-container input:focus {
  border-color: var(--color-primary);
  outline: none;
}
.btn--primary {
  background: linear-gradient(45deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  border: none;
  padding: 1rem 0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn--primary:hover:not(:disabled) {
  background: linear-gradient(45deg, var(--color-primary-container), var(--color-primary));
}
@media (max-width: 768px) {
  .login-form-container {
    max-width: 100%;
    padding: 2rem;
  }
}
</style>
