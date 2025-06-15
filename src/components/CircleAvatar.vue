<script setup lang="ts">
defineProps<{
  src: string
  alt?: string | null
  width?: number | null
  height?: number | null
}>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const onClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<template>
  <div
    class="circle-avatar"
    :style="{ width: `${width ?? 44}px`, height: `${height ?? 44}px` }"
    tabindex="0"
    role="button"
    @click="onClick"
  >
    <img :src="src" />
  </div>
</template>

<style scoped>
img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.circle-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  border: 2px solid var(--color-border-hover);
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.3s,
    border-color 0.3s;
}
.circle-avatar:hover,
.circle-avatar:focus-visible {
  border-color: var(--color-primary);
}
</style>
