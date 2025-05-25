<script setup lang="ts">
import type { UserDto } from '@/stores/user'
import { useUserStore } from '@/stores/user'
import { onMounted, ref, watch } from 'vue'
import CircleAvatar from '@/components/CircleAvatar.vue'
import defaultBanner from '@/assets/banner.png'

const prop = defineProps<{
  user?: UserDto | undefined | null
}>()
const userStore = useUserStore()

const userComponent = ref<UserDto | null>(null)

const refresh = async () => {
  if (prop.user) {
    userComponent.value = prop.user
  } else {
    userComponent.value = await userStore.loggedUser
  }
}
onMounted(() => {
  refresh()
})

watch(() => prop.user, refresh)

const uploadProfilePicture = () => {
  if (userComponent.value?.uuid === userStore.loggedUser?.uuid) {
    // Cria um input file dinamicamente
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files[0]) {
        const file = target.files[0]
        userStore
          .uploadProfilePicture(file)
          .then(() => {
            refresh()
          })
          .catch((error) => {
            console.error('Erro ao fazer upload da imagem:', error)
          })
      }
    }
    input.click()
  }
}
</script>
<template>
  <div>
    <div class="banner-container">
      <img :src="user?.bannerPicture || defaultBanner" alt="Banner" class="banner" />
      <div class="avatar-wrapper">
        <CircleAvatar
          :src="user?.profilePicture ?? `https://robohash.org/${user?.username ?? 'default'}`"
          @click="uploadProfilePicture"
          :width="150"
          :height="150"
        />
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
  border-radius: 50%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.avatar-wrapper img {
  border-radius: 50%;
}

@media (max-width: 800px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
  .main h1 {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .docs-links {
    margin-left: 0;
  }
}
</style>
