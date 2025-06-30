<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Routes } from '@/router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const fieldErrors = ref<{ username?: string; password?: string }>({})

const isFormValid = computed(
  () =>
    username.value.trim().length >= 3 &&
    password.value.trim().length >= 6 &&
    !fieldErrors.value.username &&
    !fieldErrors.value.password,
)

const validateField = (field: 'username' | 'password') => {
  fieldErrors.value = { ...fieldErrors.value }
  if (field === 'username') {
    if (!username.value.trim()) {
      fieldErrors.value.username = 'Usuário é obrigatório'
    } else if (username.value.trim().length < 3) {
      fieldErrors.value.username = 'Mínimo de 3 caracteres'
    } else {
      delete fieldErrors.value.username
    }
  }
  if (field === 'password') {
    if (!password.value.trim()) {
      fieldErrors.value.password = 'Senha é obrigatória'
    } else if (password.value.length < 6) {
      fieldErrors.value.password = 'Mínimo de 6 caracteres'
    } else {
      delete fieldErrors.value.password
    }
  }
}

const clearError = () => (error.value = '')

const handleSubmit = async () => {
  error.value = ''
  validateField('username')
  validateField('password')

  if (!isFormValid.value) {
    error.value = 'Por favor, corrija os campos destacados.'
    return
  }

  loading.value = true

  try {
    const result = await auth.signIn({
      username: username.value.trim(),
      password: password.value,
    })

    if (!result || !('user' in result) || !result.user) {
      error.value = 'Usuário não encontrado.'
      return
    }

    const user = result.user

    if (user.role === 'student') {
      router.push({ name: Routes.StudentLoggedProfile })
    } else if (user.role === 'enterprise') {
      router.push({ name: Routes.EnterpriseLoggedProfile })
    } else {
      error.value = 'Tipo de usuário inválido.'
    }
  } catch (err: unknown) {
    console.error('Erro no login:', err)

    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as Record<string, unknown>).response === 'object' &&
      (err as { response: unknown }).response !== null &&
      'status' in (err as { response: Record<string, unknown> }).response &&
      typeof (err as { response: { status: unknown } }).response.status === 'number'
    ) {
      const status = (err as { response: { status: number } }).response.status

      if (status === 400) {
        error.value = 'Usuário ou senha inválidos. Verifique os dados e tente novamente.'
      } else {
        error.value = `Erro ${status} ao fazer login. Tente novamente mais tarde.`
      }
    } else {
      error.value = 'Erro inesperado ao fazer login. Verifique sua conexão e tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <main class="login-container">
      <div class="login-header">
        <h1 class="login-title">Bem-vindo</h1>
        <p class="login-subtitle">Entre com suas credenciais</p>
      </div>

      <!-- Alerta de erro -->
      <Transition name="fade-slide">
        <div v-if="error" class="error-alert">
          <span class="error-text">{{ error }}</span>
          <button @click="clearError" class="error-close" aria-label="Fechar">×</button>
        </div>
      </Transition>

      <!-- Formulário -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Usuário</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Digite seu usuário"
              @blur="validateField('username')"
              :class="{ 'input-error': fieldErrors.username }"
              :disabled="loading"
              autocomplete="username"
            />
            <svg
              v-if="!fieldErrors.username && username"
              class="icon-check"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <Transition name="fade">
            <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>
          </Transition>
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Digite sua senha"
              @blur="validateField('password')"
              :class="{ 'input-error': fieldErrors.password }"
              :disabled="loading"
              autocomplete="current-password"
            />
            <svg
              v-if="!fieldErrors.password && password"
              class="icon-check"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 111.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <Transition name="fade">
            <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
          </Transition>
        </div>

        <button class="submit-button" type="submit" :disabled="loading || !isFormValid">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login-wrapper {
  background: var(--color-background);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.login-container {
  max-width: 420px;
  width: 100%;
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.login-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--color-on-surface);
}
.login-subtitle {
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
}

.error-alert {
  background-color: var(--color-error-container);
  border: 1px solid var(--color-error);
  color: var(--color-on-error-container);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.error-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-error);
  cursor: pointer;
}

.form-group {
  margin-bottom: 1.5rem;
}
.input-wrapper {
  position: relative;
}
input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-surface);
  color: var(--color-on-surface);
}
input.input-error {
  border-color: var(--color-error);
}
.icon-check {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-success);
}

.field-error {
  font-size: 0.85rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.submit-button {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
