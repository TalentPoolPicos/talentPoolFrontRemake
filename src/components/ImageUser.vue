<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserDto } from '@/stores/user'
import { useUserStore } from '@/stores/user'
import CircleAvatar from '@/components/CircleAvatar.vue'
import defaultBanner from '@/assets/banner.png'

const props = defineProps<{
  user?: UserDto | null
  editable?: boolean
}>()

const userStore = useUserStore()

/* ---------- reatividade ---------- */
const hoverAvatar = ref(false)
const hoverBanner = ref(false)

const displayUser = computed<UserDto | null>(() => props.user ?? userStore.loggedUser ?? null)

const canEdit = computed(
  () => props.editable === true && displayUser.value?.uuid === userStore.loggedUser?.uuid,
)

/* ---------- uploaders ---------- */
const openFilePicker = (accept: string, onSelect: (f: File) => Promise<void>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        await onSelect(file)
      } catch (err) {
        console.error(err)
        alert('Erro ao enviar imagem.')
      }
    }
  }
  input.click()
}

const uploadProfilePicture = () => {
  if (!canEdit.value) return
  openFilePicker('image/*', async (file) => {
    await userStore.uploadProfilePicture(file)
  })
}

const uploadBannerPicture = () => {
  if (!canEdit.value) return
  openFilePicker('image/*', async (file) => {
    await userStore.uploadBannerPicture(file)
  })
}
</script>

<template>
  <div class="banner-container">
    <!-- banner -->
    <div
      class="banner-wrapper"
      @mouseenter="hoverBanner = true"
      @mouseleave="hoverBanner = false"
      @click="uploadBannerPicture"
      :style="{ cursor: canEdit ? 'pointer' : 'default' }"
    >
      <img :src="displayUser?.bannerPicture || defaultBanner" alt="Banner" class="banner" />
      <div v-if="canEdit && hoverBanner" class="overlay-banner">Editar banner</div>
    </div>

    <!-- avatar -->
    <div
      class="avatar-wrapper"
      @mouseenter="hoverAvatar = true"
      @mouseleave="hoverAvatar = false"
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
      <div v-if="canEdit && hoverAvatar" class="overlay-avatar">Editar foto de perfil</div>
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  grid-column: 1 / -1;
  position: relative;
}

/* ------ banner ------ */
.banner-wrapper {
  position: relative;
}
.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}
.overlay-banner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0 0 0 / 55%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px 8px 0 0;
  pointer-events: none;
  user-select: none;
}

/* ------ avatar ------ */
.avatar-wrapper {
  position: absolute;
  bottom: -40px;
  left: 1.5rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  overflow: hidden;
}

.overlay-avatar {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0 0 0 / 55%);
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
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
