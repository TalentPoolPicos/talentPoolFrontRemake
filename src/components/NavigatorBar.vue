<script setup lang="ts">
import ThemeToggle from './ThemeToggle.vue'
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentPath = computed(() => route.path)
</script>

<template>
  <header class="nav-bar">
    <div class="brand">
      <span class="small">Banco&nbsp;de</span>
      <span class="strong">Talentos</span>
    </div>

    <nav class="links">
      <RouterLink to="/" :class="{ active: currentPath === '/' }">Início</RouterLink>
      <RouterLink to="/about" :class="{ active: currentPath.startsWith('/about') }"
        >Sobre</RouterLink
      >
      <RouterLink to="/news" :class="{ active: currentPath.startsWith('/news') }"
        >Notícias</RouterLink
      >
    </nav>

    <div class="right-tools">
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
  color: var(--color-on-primary-container, #fff);
  gap: 2rem;
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
  color: var(--color-on-primary-container, #fff);
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
  background: var(--color-on-primary-container, #fff);
}

.right-tools {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-wrapper {
  display: inline-flex;
  align-items: center;
  background: var(--color-surface, #ffffff);
  border: 2px solid var(--color-border, #d0d0d0);
  border-radius: 6px;
  padding-inline: 0.75rem 0.5rem;
  height: 34px;
  color: var(--color-on-surface, #000);
}
.search-wrapper .icon {
  margin-right: 0.4rem;
  font-size: 1rem;
}
.search-wrapper input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 120px;
  color: inherit;
  font-size: 0.9rem;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.2rem;
  height: 36px;
  border: 2px solid var(--color-on-primary-container, #fff);
  color: var(--color-on-primary-container, #fff);
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition:
    background-color 0.25s,
    color 0.25s;
}
.btn-outline:hover {
  background: var(--color-on-primary-container, #fff);
  color: var(--color-primary-container, #4f768b);
}
</style>
