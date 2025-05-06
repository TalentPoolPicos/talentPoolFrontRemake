<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const currentPath = computed(() => route.path)

const isMenuOpen = ref(false)

const windowWidth = ref(0)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  updateWindowWidth()
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>

<template>
  <header class="nav-bar">
    <div class="brand">
      <span class="small">Banco&nbsp;de</span>
      <span class="strong">Talentos</span>
    </div>

    <div class="hamburger" v-if="windowWidth <= 800" @click="isMenuOpen = !isMenuOpen">&#9776;</div>

    <div class="menu-dialog" v-if="isMenuOpen">
      <div class="hamburger" @click="isMenuOpen = false">&#10005;</div>

      <RouterLink to="/" :class="{ active: currentPath === '/' }" @click="isMenuOpen = false"
        >Início</RouterLink
      >
      <RouterLink
        to="/about"
        :class="{ active: currentPath.startsWith('/about') }"
        @click="isMenuOpen = false"
        >Sobre</RouterLink
      >
      <RouterLink
        to="/news"
        :class="{ active: currentPath.startsWith('/news') }"
        @click="isMenuOpen = false"
        >Notícias</RouterLink
      >

      <label class="search-wrapper">
        <span class="icon">🔍</span>
        <input type="search" placeholder="Search" />
      </label>
      <RouterLink to="/login" class="btn-outline">Entrar</RouterLink>

      <ThemeToggle />
    </div>

    <nav class="links" v-show="windowWidth > 800">
      <RouterLink to="/" :class="{ active: currentPath === '/' }">Início</RouterLink>
      <RouterLink to="/about" :class="{ active: currentPath.startsWith('/about') }"
        >Sobre</RouterLink
      >
      <RouterLink to="/news" :class="{ active: currentPath.startsWith('/news') }"
        >Notícias</RouterLink
      >
    </nav>

    <div class="right-tools" v-show="windowWidth > 800">
      <label class="search-wrapper">
        <span class="icon">🔍</span>
        <input type="search" placeholder="Search" />
      </label>
      <RouterLink to="/login" class="btn-outline">Entrar</RouterLink>
      <ThemeToggle />
    </div>
  </header>
</template>

<style scoped>
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 2rem;
  height: 64px;
  color: var(--color-on-primary-container);
  gap: 2rem;
  position: relative;
}

.brand {
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-align: left;
  user-select: none;
}

.brand .small {
  font-size: 0.75rem;
  opacity: 0.9;
}

.brand .strong {
  font-weight: 700;
  font-size: 1.1rem;
}

.links {
  display: flex;
  gap: 2.5rem;
}

.links a {
  position: relative;
  padding-block: 4px;
  font-weight: 500;
  color: var(--color-on-primary-container);
  text-decoration: none;
  transition: color 0.25s;
}

.links a:hover {
  opacity: 0.8;
}

.links a.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 3px;
  margin-inline: auto;
  width: 70%;
  border-radius: 999px;
  background: var(--color-on-primary-container);
}

.right-tools {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-wrapper {
  display: inline-flex;
  align-items: center;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  padding-inline: 0.75rem 0.5rem;
  height: 34px;
  color: var(--color-on-surface);
  border-color: var(--color-on-primary-container);
}

.search-wrapper .icon {
  margin-right: 0.4rem;
  font-size: 1rem;
}

.search-wrapper input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 180px;
  color: inherit;
  font-size: 0.9rem;
}

.search-wrapper input::placeholder {
  color: var(--color-on-primary-container);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.2rem;
  height: 36px;
  border: 2px solid var(--color-on-primary-container);
  color: var(--color-on-primary-container);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition:
    background-color 0.25s,
    color 0.25s;
}

.btn-outline:hover {
  background: var(--color-on-primary-container);
  color: var(--color-primary-container);
}

.hamburger {
  display: none;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1001;
}

.menu-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-surface);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
}

.menu-dialog a {
  margin: 0.6rem 0;
  font-size: 1.2rem;
  color: var(--color-on-primary-container);
  text-decoration: none;
  transition: color 0.25s;
}

@media (max-width: 800px) {
  .links {
    display: none;
  }

  .hamburger {
    display: block;
  }

  .right-tools {
    display: none;
  }
}
</style>
