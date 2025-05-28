<!-- src/views/Registration.vue -->
<template>
  <div class="page registration">
    <NavBar />

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
          <input
            type="text"
            placeholder="Nome completo ou nome da organização"
            v-model="username"
            required
          />

          <!-- email -->
          <input
            type="email"
            placeholder="Email"
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
    await auth.signUp(payload, ) // pode mudar o segundo argumento para um termo mais genérico

    router.push({ name: Routes.Home })
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || 'Erro ao cadastrar.')
  } finally {
    loading.value = false
  }
}
</script>
