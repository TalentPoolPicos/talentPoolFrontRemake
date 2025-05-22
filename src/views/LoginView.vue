<template>
  <div class="register-wrapper">
    <main class="register-form-container">
      <form class="card" @submit.prevent="handleSubmit">
        <div class="input-container">
          <label for="email">E-mail institucional</label>
          <input id="email" v-model="email" type="email" placeholder="Digite seu e-mail" required />
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
        <div class="input-container">
          <label for="confirmPwd">Confirmação da senha</label>
          <input
            id="confirmPwd"
            v-model="confirmPwd"
            type="password"
            placeholder="Confirme sua senha"
            required
          />
        </div>
        <div class="input-container">
          <label for="name">Nome completo</label>
          <input id="name" v-model="name" type="text" placeholder="Digite seu nome" required />
        </div>
        <button class="btn btn--primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Cadastrar' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const confirmPwd = ref('')
const name = ref('')
const loading = ref(false)

function handleSubmit() {
  if (!email.value || !password.value || password.value !== confirmPwd.value) {
    alert('Por favor, preencha todos os campos corretamente.')
    return
  }
  loading.value = true
  setTimeout(() => {
    loading.value = false
    alert('Cadastro realizado com sucesso!')
  }, 1500)
}
</script>

<style scoped>
.register-wrapper {
  background: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 2rem;
}

.register-form-container {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
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
}

.input-container input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.input-container input:focus {
  border-color: var(--color-primary);
}

.btn--primary {
  background: linear-gradient(45deg, var(--color-primary), var(--color-primary-container));
  color: var(--color-on-primary);
  border: none;
  padding: 1rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 600;
}

.btn--primary:hover {
  background: linear-gradient(45deg, var(--color-primary-container), var(--color-primary));
}

@media (max-width: 768px) {
  .register-form-container {
    max-width: 100%;
    padding: 2rem;
  }
}
</style>
