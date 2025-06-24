<template>
  <div class="signup-wrapper">
    <div class="background-decoration">
      <div class="decoration-circle decoration-circle-1"></div>
      <div class="decoration-circle decoration-circle-2"></div>
      <div class="decoration-circle decoration-circle-3"></div>
      <div class="decoration-circle decoration-circle-4"></div>
    </div>

    <div class="signup-container" :class="{ 'fade-in': isVisible }">
      <div class="signup-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
              <path
                d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <h1 class="signup-title">Criar nova conta</h1>
        <p class="signup-subtitle">Preencha os dados abaixo para começar</p>
      </div>

      <Transition name="error-slide">
        <div v-if="error" class="error-alert">
          <div class="error-content">
            <div class="error-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <span class="error-message">{{ error }}</span>
          </div>
          <button type="button" class="error-close" @click="clearError" aria-label="Fechar erro">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" />
            </svg>
          </button>
        </div>
      </Transition>

      <form class="signup-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="section-label">Tipo de conta</label>
          <div class="user-type-selector">
            <label class="user-type-option" :class="{ selected: userType === 'student' }">
              <input type="radio" v-model="userType" value="student" />
              <div class="option-content">
                <div class="option-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 10v6M2 10l10-5 10 5-10 5z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 12v5c3 3 9 3 12 0v-5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div class="option-text">
                  <span class="option-title">Estudante</span>
                  <span class="option-description">Buscar oportunidades de estágio</span>
                </div>
              </div>
            </label>
            <label class="user-type-option" :class="{ selected: userType === 'enterprise' }">
              <input type="radio" v-model="userType" value="enterprise" />
              <div class="option-content">
                <div class="option-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 21h18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M5 21V7l8-4v18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19 21V11l-6-4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div class="option-text">
                  <span class="option-title">Empresa</span>
                  <span class="option-description">Oferecer vagas de estágio</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="form-group" :class="{ 'has-error': usernameError, 'has-focus': username }">
          <div class="input-container">
            <div class="input-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder=" "
              autocomplete="username"
              @blur="validateUsername"
              @input="usernameError && validateUsername()"
            />
            <label for="username" class="form-label">Nome de usuário</label>
            <div class="input-border"></div>
          </div>
          <Transition name="error-text">
            <div v-if="usernameError" class="error-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ usernameError }}</span>
            </div>
          </Transition>
        </div>

        <div class="form-group" :class="{ 'has-error': emailError, 'has-focus': email }">
          <div class="input-container">
            <div class="input-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder=" "
              autocomplete="email"
              @blur="validateEmail"
              @input="emailError && validateEmail()"
            />
            <label for="email" class="form-label">E-mail</label>
            <div class="input-border"></div>
          </div>
          <Transition name="error-text">
            <div v-if="emailError" class="error-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ emailError }}</span>
            </div>
          </Transition>
        </div>

        <div class="form-group" :class="{ 'has-error': passwordError, 'has-focus': password }">
          <div class="input-container">
            <div class="input-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder=" "
              autocomplete="new-password"
              @blur="validatePassword"
              @input="passwordError && validatePassword()"
            />
            <label for="password" class="form-label">Senha</label>
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <svg
                v-if="showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22M12 9a3 3 0 1 1 0 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
            <div class="input-border"></div>
          </div>
          <Transition name="error-text">
            <div v-if="passwordError" class="error-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ passwordError }}</span>
            </div>
          </Transition>
        </div>

        <div
          class="form-group"
          :class="{ 'has-error': confirmPasswordError, 'has-focus': confirmPassword }"
        >
          <div class="input-container">
            <div class="input-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M9 16l2 2 4-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              placeholder=" "
              autocomplete="new-password"
              @blur="validateConfirmPassword"
              @input="confirmPasswordError && validateConfirmPassword()"
            />
            <label for="confirmPassword" class="form-label">Confirmar senha</label>
            <button
              type="button"
              class="password-toggle"
              @click="toggleConfirmPasswordVisibility"
              :aria-label="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <svg
                v-if="showConfirmPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22M12 9a3 3 0 1 1 0 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
            <div class="input-border"></div>
          </div>
          <Transition name="error-text">
            <div v-if="confirmPasswordError" class="error-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ confirmPasswordError }}</span>
            </div>
          </Transition>
        </div>

        <!-- <div class="form-group" :class="{ 'has-error': termsError }">
          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="acceptTerms"
              class="checkbox-input"
              @change="validateTerms"
            />
            <div class="checkbox-custom">
              <svg
                v-if="acceptTerms"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline
                  points="20,6 9,17 4,12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="checkbox-text">
              Eu aceito os
              <a href="#" class="terms-link">termos de uso</a>
              e
              <a href="#" class="terms-link">política de privacidade</a>
            </span>
          </label>
          <Transition name="error-text">
            <div v-if="termsError" class="error-text">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ termsError }}</span>
            </div>
          </Transition>
        </div> -->

        <button
          type="submit"
          class="signup-button"
          :class="{ loading: loading, disabled: !isFormValid }"
          :disabled="loading || !isFormValid"
        >
          <div class="button-content">
            <Transition name="button-content" mode="out-in">
              <div v-if="!loading" key="normal" class="button-normal">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Criar conta</span>
              </div>
              <div v-else key="loading" class="button-loading">
                <div class="loading-spinner"></div>
                <span>Criando conta...</span>
              </div>
            </Transition>
          </div>
          <div class="button-ripple"></div>
        </button>

        <div class="form-footer">
          <span class="footer-text">Já tem uma conta?</span>
            <RouterLink :to="RoutePaths[Routes.SignIn]" class="link-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
              d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              />
            </svg>
            Fazer login
            </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Routes, RoutePaths } from '@/router'
import type { components } from '@/types/api'

type SignUpDto = components['schemas']['SignUpDto']

// Props - mantive o role para compatibilidade caso ainda queira passar via rota
const props = defineProps<{ role?: 'student' | 'enterprise' }>()

const auth = useAuthStore()
const router = useRouter()

// Dados do formulário
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const userType = ref<'student' | 'enterprise'>(props.role ?? 'student') // Usa o role da prop se existir, senão 'student'
const acceptTerms = ref(false)

// Estados de UI
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isVisible = ref(false) // Para a animação de fade-in

// Estados de erro para validação
const emailError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const termsError = ref('')

// Computed property para validar o formulário
const isFormValid = computed(() => {
  return (
    email.value.length > 0 &&
    username.value.length > 0 &&
    password.value.length > 0 &&
    confirmPassword.value.length > 0 
    // && acceptTerms.value 
    && !emailError.value &&
    !usernameError.value &&
    !passwordError.value &&
    !confirmPasswordError.value 
    // && !termsError.value
  )
})

// Funções de validação
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'E-mail é obrigatório.'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'E-mail deve ter um formato válido.'
  } else {
    emailError.value = ''
  }
}

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = 'Usuário é obrigatório.'
  } else if (username.value.length < 3) {
    usernameError.value = 'Usuário deve ter pelo menos 3 caracteres.'
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    usernameError.value = 'Usuário pode conter apenas letras, números e underscore.'
  } else {
    usernameError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Senha é obrigatória.'
  } else if (password.value.length < 8) {
    passwordError.value = 'Senha deve ter pelo menos 8 caracteres.'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(password.value)) {
    passwordError.value =
      'Senha deve conter ao menos uma letra maiúscula, minúscula, um número e um símbolo.'
  } else {
    passwordError.value = ''
    if (confirmPassword.value) validateConfirmPassword() // Revalida a confirmação se a senha mudar
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Confirmação de senha é obrigatória.'
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Senhas não coincidem.'
  } else {
    confirmPasswordError.value = ''
  }
}

const validateTerms = () => {
  if (!acceptTerms.value) {
    termsError.value = 'Você deve aceitar os termos de uso.'
  } else {
    termsError.value = ''
  }
}

// Função para lidar com o envio do formulário
const handleSubmit = async () => {
  // Executa todas as validações antes de tentar enviar
  validateEmail()
  validateUsername()
  validatePassword()
  validateConfirmPassword()
  validateTerms()

  // Se o formulário não for válido, para a execução
  if (!isFormValid.value) {
    return
  }

  loading.value = true
  error.value = '' // Limpa qualquer erro anterior

  try {
    const payload: SignUpDto = {
      username: username.value,
      email: email.value,
      password: password.value,
    }

    const result = await auth.signUp(payload, userType.value) // Passa o userType selecionado
    const user = result.user // Assumindo que a resposta de signUp tem um objeto 'user'

    // Redireciona com base no tipo de usuário após o cadastro bem-sucedido
    if (user.role === 'student') {
      router.push({ name: Routes.StudentLoggedProfile })
    } else if (user.role === 'enterprise') {
      router.push({ name: Routes.EnterpriseLoggedProfile })
    } else {
      error.value = 'Tipo de usuário inválido retornado pela API.'
    }
  } catch (err: any) {
    // Trata erros da API
    error.value = err.message || 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Funções para alternar a visibilidade da senha
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Limpa a mensagem de erro da API
const clearError = () => {
  error.value = ''
}

// Efeito de fade-in no carregamento do componente
onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<style scoped>
/* Base Layout */
.signup-wrapper {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-container), var(--color-secondary-container));
  opacity: 0.08;
  animation: float 25s ease-in-out infinite;
}

.decoration-circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.decoration-circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
  animation-delay: -8s;
}

.decoration-circle-3 {
  width: 200px;
  height: 200px;
  top: 20%;
  left: -100px;
  animation-delay: -16s;
}

.decoration-circle-4 {
  width: 150px;
  height: 150px;
  bottom: 30%;
  right: -75px;
  animation-delay: -24s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  25% { transform: translate(20px, -20px) rotate(90deg) scale(1.05); }
  50% { transform: translate(-15px, 15px) rotate(180deg) scale(0.95); }
  75% { transform: translate(25px, 10px) rotate(270deg) scale(1.02); }
}

/* Signup Container */
.signup-container {
  background: var(--color-surface);
  border-radius: 32px;
  padding: 48px;
  width: 100%;
  max-width: 520px;
  box-shadow: 
    0 1px 3px 0 var(--color-shadow),
    0 4px 8px 3px color-mix(in srgb, var(--color-shadow) 15%, transparent),
    0 8px 16px 6px color-mix(in srgb, var(--color-shadow) 10%, transparent);
  border: 1px solid var(--color-outline-variant);
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.signup-container.fade-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Header */
.signup-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  margin-bottom: 24px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  margin: 0 auto 16px;
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.signup-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.signup-subtitle {
  color: var(--color-on-surface-variant);
  font-size: 16px;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
}

/* Error Alert */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--color-error-container);
  color: var(--color-on-error-container);
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
  position: relative;
  overflow: hidden;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.error-icon {
  flex-shrink: 0;
  color: var(--color-error);
  margin-top: 2px;
}

.error-message {
  font-size: 14px;
  line-height: 1.4;
}

.error-close {
  background: none;
  border: none;
  color: var(--color-on-error-container);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.error-close:hover {
  background: color-mix(in srgb, var(--color-on-error-container) 10%, transparent);
}

/* Form */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 12px;
}

/* User Type Selector */
.user-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.user-type-option {
  position: relative;
  cursor: pointer;
  border: 2px solid var(--color-outline-variant);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--color-surface);
}

.user-type-option:hover {
  border-color: var(--color-outline);
  background: var(--color-surface-variant);
}

.user-type-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.user-type-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.option-icon {
  color: var(--color-on-surface-variant);
  transition: color 0.3s ease;
}

.user-type-option.selected .option-icon {
  color: var(--color-on-primary-container);
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-on-surface);
}

.user-type-option.selected .option-title {
  color: var(--color-on-primary-container);
}

.option-description {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  line-height: 1.3;
}

.user-type-option.selected .option-description {
  color: var(--color-on-primary-container);
  opacity: 0.8;
}

/* Input Fields */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 2;
  color: var(--color-on-surface-variant);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid var(--color-outline-variant);
  border-radius: 16px;
  background: var(--color-surface);
  color: var(--color-on-surface);
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
  position: relative;
  z-index: 1;
}

.form-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  transform: translateY(-32px) scale(0.85);
  color: var(--color-primary);
  background: var(--color-surface);
  padding: 0 8px;
}

.form-input:focus ~ .input-icon {
  color: var(--color-primary);
  transform: scale(1.1);
}

.form-input:focus ~ .input-border {
  transform: scaleX(1);
}

.form-label {
  position: absolute;
  left: 52px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-on-surface-variant);
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 2;
  background: transparent;
  border-radius: 4px;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 1px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  z-index: 2;
}

.password-toggle:hover {
  background: var(--color-surface-variant);
  color: var(--color-on-surface);
  transform: scale(1.05);
}

/* Error States */
.has-error .form-input {
  border-color: var(--color-error);
}

.has-error .form-input:focus {
  border-color: var(--color-error);
}

.has-error .input-icon {
  color: var(--color-error);
}

.has-error .form-label {
  color: var(--color-error);
}

.has-error .input-border {
  background: var(--color-error);
}

.error-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-error);
  font-size: 14px;
  margin-left: 16px;
  line-height: 1.4;
}

/* Checkbox */
.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 8px 0;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-outline-variant);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  background: var(--color-surface);
  margin-top: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.checkbox-text {
  font-size: 14px;
  color: var(--color-on-surface);
  line-height: 1.5;
}

.terms-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.has-error .checkbox-custom {
  border-color: var(--color-error);
}

/* Submit Button */
.signup-button {
  width: 100%;
  padding: 16px 24px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  margin-top: 8px;
  min-height: 56px;
}

.signup-button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 90%, var(--color-on-primary));
  transform: translateY(-2px);
  box-shadow: 
    0 4px 8px 0 color-mix(in srgb, var(--color-primary) 30%, transparent),
    0 8px 16px 4px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.signup-button:active:not(:disabled) {
  transform: translateY(0);
}

.signup-button.disabled {
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.button-normal,
.button-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.button-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  transform: scale(0);
  border-radius: inherit;
  pointer-events: none;
}

.signup-button:active .button-ripple {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer Links */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--color-outline-variant);
}

.footer-text {
  color: var(--color-on-surface-variant);
  font-size: 14px;
}

.link-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: var(--color-primary);
}

.link-primary:hover {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

/* Transitions */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

.error-text-enter-active,
.error-text-leave-active {
  transition: all 0.3s ease;
}

.error-text-enter-from,
.error-text-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.button-content-enter-active,
.button-content-leave-active {
  transition: all 0.2s ease;
}

.button-content-enter-from,
.button-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  .signup-wrapper {
    padding: 16px;
  }
  
  .signup-container {
    padding: 32px 24px;
    border-radius: 24px;
    max-width: 100%;
  }
  
  .signup-title {
    font-size: 24px;
  }
  
  .logo-icon {
    width: 64px;
    height: 64px;
  }
  
  .user-type-selector {
    grid-template-columns: 1fr;
  }
  
  .decoration-circle-1,
  .decoration-circle-2,
  .decoration-circle-3,
  .decoration-circle-4 {
    display: none;
  }
}

@media (max-width: 480px) {
  .signup-wrapper {
    padding: 8px;
  }
  
  .signup-container {
    padding: 24px 20px;
    border-radius: 20px;
  }
  
  .signup-title {
    font-size: 22px;
  }
  
  .form-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus management */
.form-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.signup-button:focus-visible {
  outline: 2px solid var(--color-on-primary);
  outline-offset: 2px;
}

.checkbox-container:focus-within .checkbox-custom {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .signup-container {
    border-width: 2px;
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .signup-button {
    border: 2px solid var(--color-primary);
  }
  
  .user-type-option {
    border-width: 2px;
  }
}

</style>