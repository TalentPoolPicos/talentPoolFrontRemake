<script setup lang="ts">
defineProps<{ loading: boolean }>()
</script>

<template>
  <transition name="fade" mode="out-in" appear :duration="{ enter: 500, leave: 500 }">
    <div v-if="loading" key="loader" class="loading-wrapper">
      <span class="ring" />
      <div class="brand">
        <span class="small">Banco&nbsp;de</span>
        <span class="strong">Talentos</span>
      </div>
    </div>

    <div v-else key="content" class="content-wrapper">
      <slot />
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 90dvh;
  gap: 0.75rem;
  user-select: none;
}

.ring {
  width: 3.5rem;
  height: 3.5rem;
  border: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: pulse 1.2s infinite ease-in-out;
  box-sizing: border-box;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.brand {
  display: flex;
  flex-direction: column;
  line-height: 1;
  text-align: center;
}

.brand .small {
  font-size: 0.8rem;
  opacity: 0.9;
}
.brand .strong {
  font-weight: 700;
  font-size: 1.2rem;
}

.content-wrapper {
  width: 100%;
  height: 100%;
}
</style>
