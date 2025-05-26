<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserDto } from '@/stores/user'
import { useUserStore } from '@/stores/user'
import CircleAvatar from '@/components/CircleAvatar.vue'
import defaultBanner from '@/assets/banner.png'

const props = defineProps<{
  user?: UserDto | null
  /**
   * Indica se o usuário pode editar a foto de perfil.
   * Se não for passado, assume-se que não é editável.
   */
  editable?: boolean
}>()

const userStore = useUserStore()

const hover = ref(false)

const displayUser = computed<UserDto | null>(() => {
  return props.user ?? userStore.loggedUser ?? null
})

const canEdit = computed(() => {
  return props.editable === true && displayUser.value?.uuid === userStore.loggedUser?.uuid
})

const uploadProfilePicture = () => {
  if (!canEdit.value) return

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      await userStore.uploadProfilePicture(file)
    } catch (err) {
      console.error('Falha no upload:', err)
      alert('Erro ao enviar imagem.')
    }
  }
  input.click()
}
</script>

<template>
  <div>
    <div class="banner-container">
      <img :src="displayUser?.bannerPicture || defaultBanner" alt="Banner" class="banner" />

      <div
        class="avatar-wrapper"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click="uploadProfilePicture"
        :style="{ cursor: canEdit ? 'pointer' : 'default' }"
      >
        <CircleAvatar
          :src="
            displayUser?.profilePicture ??
            `https://robohash.org/${displayUser?.username ?? 'default'}`
          "
          :width="150"
          :height="150"
        />

        <div v-if="canEdit && hover" class="overlay">Editar foto de perfil</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  grid-column: 1 / -1;
  position: relative;
}

.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-wrapper img {
  border-radius: 50%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0 0 0 / 55%);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  padding: 0 10px;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
}

/* Responsivo */
@media (max-width: 800px) {
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
