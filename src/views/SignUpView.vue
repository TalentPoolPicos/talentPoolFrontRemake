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


</style>