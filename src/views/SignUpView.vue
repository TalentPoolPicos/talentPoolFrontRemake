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

        
      </form>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Routes } from '@/router'
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

</style>