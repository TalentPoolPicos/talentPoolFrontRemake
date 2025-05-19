<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const { toggle } = themeStore

const icon = computed(() => ({ auto: '🌓', light: '🌞', dark: '🌚' })[theme.value])
</script>

<template>
  <button class="theme-btn" @click="toggle" :aria-label="`Tema: ${theme}`">
    <transition name="fade-scale" mode="out-in">
      <span :key="icon">{{ icon }}</span>
    </transition>
  </button>
</template>

<style scoped>
.theme-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 1.4rem;
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.3s,
    border-color 0.3s;
}
.theme-btn:hover,
.theme-btn:focus-visible {
  border-color: var(--color-border-hover);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.4) rotate(-90deg);
}
</style>
