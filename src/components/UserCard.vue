<script setup lang="ts">
import CircleAvatar from '@/components/CircleAvatar.vue'
import defaultBanner from '@/assets/banner.png'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { RoutePaths, Routes } from '@/router/index'
import type { UserDto } from '@/stores/user'
import { onMounted, ref, watch } from 'vue'
import { useLikeStore } from '@/stores/like'

const props = defineProps<{
  user: UserDto
}>()
const likeStore = useLikeStore()
const authStore = useAuthStore()
const router = useRouter()

const getRobotAvatar = (username: string) => `https://robohash.org/${username}?set=set2&size=72x72`

const handleSearch = () => {
  if (props.user.role === 'student') {
    router.push(RoutePaths[Routes.StudentProfile].replace(':uuid', props.user.uuid))
  } else if (props.user.role === 'enterprise') {
    router.push(RoutePaths[Routes.EnterpriseProfile].replace(':uuid', props.user.uuid))
  }
}

const loadingLike = ref(true)
const isLiked = ref(false)

const checkIfLiked = (user: UserDto | undefined) => {
  if (
    authStore.isLoggedIn &&
    user &&
    authStore.loggedUser?.uuid !== user?.uuid &&
    user?.role !== authStore.loggedUser?.role
  ) {
    loadingLike.value = true
    likeStore
      .hasLiked(user?.uuid)
      .then((liked) => {
        isLiked.value = liked.isLike
        loadingLike.value = false
      })
      .catch(() => {
        console.error('Erro ao verificar se o usuário foi curtido')
        loadingLike.value = false
        isLiked.value = false
      })
  }
}

const match = () => {
  if (!authStore.isLoggedIn) {
    router.push(RoutePaths[Routes.Home])
    return
  }

  if (authStore.loggedUser?.uuid === props.user.uuid) {
    alert('Você não pode dar like em si mesmo.')
    return
  }

  loadingLike.value = true
  isLiked.value = !isLiked.value

  if (isLiked.value) {
    likeStore
      .like(props.user.uuid)
      .then(() => {
        loadingLike.value = false
      })
      .catch((e) => {
        console.error('Erro ao curtir o usuário', e)
        loadingLike.value = false
        isLiked.value = false
      })
  } else {
    likeStore
      .unlike(props.user.uuid)
      .then(() => {
        loadingLike.value = false
      })
      .catch((e) => {
        console.error('Erro ao descurtir o usuário', e)
        loadingLike.value = false
        isLiked.value = true
      })
  }
}

onMounted(checkIfLiked)
watch(() => props.user, checkIfLiked, { immediate: true })
</script>

<template>
  <li class="result-card" @click="handleSearch">
    <div class="card-content">
      <div class="image-user-container">
        <div class="card-circle-avatar">
          <CircleAvatar
            :src="user.profilePicture || getRobotAvatar(user.username ?? 'default')"
            :width="72"
            :height="72"
            class="circle-avatar"
          />
        </div>
        <img :src="user.bannerPicture || defaultBanner" alt="Banner do usuário" />
      </div>
      <div class="info">
        <p>
          <strong>{{ user.student?.name || user.enterprise?.name }}</strong>
        </p>
        <p class="location">Picos, PI</p>
        <div class="tags">
          <span class="tag" v-for="tag in user.tags" :key="tag.uuid">
            {{ tag.label.replace(' ', '_') }}
          </span>
        </div>
      </div>
      <div
        v-if="
          authStore.isLoggedIn &&
          authStore.loggedUser?.uuid !== user.uuid &&
          user.role !== authStore.loggedUser?.role
        "
        class="match-indicator"
        @click.stop="match"
        :class="{ liked: isLiked }"
      >
        <span class="emoji" :class="{ animateIn: loadingLike }" v-if="loadingLike"> ⏳ </span>
        <span class="emoji heart" :class="{ animateOut: !isLiked }" v-else-if="!isLiked">🖤</span>
        <span class="emoji flame" :class="{ animateIn: isLiked }" v-else-if="isLiked">❤️‍🔥</span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.result-card {
  background-color: var(--color-surface);
  border-radius: 10px;
  padding: 1.2rem;
  border: 1px solid var(--color-outline-variant);
  cursor: pointer;
  margin: 0 auto;
  height: 220px;
  max-width: 400px;
  width: 100%;
  display: inline;
  justify-content: space-between;
  position: relative;
  transition:
    box-shadow 0.2s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.result-card:hover {
  border-color: var(--color-primary);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.8rem;
  flex-grow: 1;
}

.image-user-container {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px var(--color-shadow);
}

.image-user-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
  align-items: center;
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;
}

.card-circle-avatar {
  position: absolute;
  margin: 0.2rem;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  width: 100%;
  flex-grow: 1;
}

.info p {
  margin: 0;
  line-height: 1.3;
  color: var(--color-on-surface);
}

.info strong {
  font-size: 1.1em;
  color: var(--color-on-surface);
}

.location {
  font-size: 0.85rem;
  color: var(--color-on-surface-variant);
  margin-top: 0.2em;
}

.tags {
  margin-top: 0.8rem;
  padding-left: 0.5rem;
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 100%;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: 4px;
  -ms-overflow-style: none;
}

.tags::-webkit-scrollbar {
  height: 4px;
}

.tags::-webkit-scrollbar-thumb {
  background-color: var(--color-on-surface-variant);
  border-radius: 3px;
}

.tag {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  line-break: none;
  white-space: nowrap;
  flex-shrink: 0;
  margin-bottom: 5px;
  box-shadow: 0 1px 3px var(--color-shadow);
  transition:
    background 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}

.match-indicator {
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  width: 3rem;
  height: 2rem;
  justify-content: center;
  align-items: center;
  display: flex;
  align-items: center;
  backdrop-filter: blur(5px);
  border: 1px solid var(--color-border);
  background-color: rgba(255, 255, 255, 0.2);
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.match-indicator.liked {
  border-color: var(--color-primary);
}

.match-indicator:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: var(--color-primary);
}

.match-indicator span {
  font-size: 1.2rem;
  display: inline-block;
  user-select: none;

  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.animateIn {
  animation: pop 0.4s ease-in-out;
}

.animateOut {
  animation: pop 0.4s ease-in-out;
}

@keyframes pop {
  0% {
    transform: scale(0);
    transform: rotate(90deg);

    opacity: 0;
  }
  60% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    transform: rotate(0deg);
  }
}
</style>
