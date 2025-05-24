<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type Role } from '@/stores/auth'
import { Routes } from '@/router'

const props = defineProps<{
  role: Role | undefined
}>()

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const handleSubmit = async () => {
  console.log('handleSubmit', username.value, password.value, props.role)
  if (username.value == '' || password.value == '') {
    alert('Por favor, preencha usuário e senha.')
    return
  }

  if (props.role == undefined) {
    alert('Por favor, selecione um tipo de usuário.')
    router.push({ name: Routes.Home })
    return
  }

  loading.value = true
  try {
    await auth
      .signIn(
        {
          username: username.value,
          password: password.value,
        },
        props.role,
      )
      .then((value) => {
        const user = value.user
        if (user.role === 'student') {
          router.push({ name: Routes.StudentLoggedProfile })
        } else if (user.role === 'enterprise') {
          router.push({ name: Routes.EnterpriseLoggedProfile })
        } else {
          alert('Tipo de usuário inválido.')
        }
      })
  } finally {
    loading.value = false
  }
}
</script>

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
        <button class="btn btn--primary" :disabled="loading" @click="handleSubmit">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </main>
  </div>
</template>

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
