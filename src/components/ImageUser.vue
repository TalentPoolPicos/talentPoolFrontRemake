<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { UserDto } from '@/stores/user'
import { useUserStore } from '@/stores/user'
import CircleAvatar from '@/components/CircleAvatar.vue'
import defaultBanner from '@/assets/banner.png'

/* ---------- props ---------- */
const props = defineProps<{
  user?: UserDto | null
  editable?: boolean
}>()

/* ---------- store ---------- */
const userStore = useUserStore()

/* ---------- reatividade ---------- */
const hoverAvatar = ref(false)
const hoverBanner = ref(false)
const dragging = ref(false)
const offsetX = ref(0) // deslocamento horizontal aplicado

let startX = 0,
  startOffset = 0,
  minOffset = 0,
  maxOffset = 0

const imgRef = ref<HTMLImageElement>()
const wrapperRef = ref<HTMLDivElement>()

/* ---------- computed ---------- */
const displayUser = computed<UserDto | null>(() => props.user ?? userStore.loggedUser ?? null)

const canEdit = computed(
  () => props.editable === true && displayUser.value?.uuid === userStore.loggedUser?.uuid,
)

/* ---------- util: abre input file ---------- */
const openPicker = async (callback: (f: File) => Promise<void>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        await callback(file)
        offsetX.value = 0
        await nextTick()
        calcBounds()
      } catch {
        alert('Erro ao enviar imagem.')
      }
    }
  }
  input.click()
}

const uploadProfilePicture = () =>
  canEdit.value &&
  openPicker(async (file: File) => {
    await userStore.uploadProfilePicture(file)
  })

const uploadBannerPicture = () =>
  canEdit.value &&
  openPicker(async (file: File) => {
    await userStore.uploadBannerPicture(file)
  })

/* ---------- drag handlers ---------- */
const onDown = (e: MouseEvent) => {
  if (!canEdit.value) return
  dragging.value = true
  startX = e.clientX
  startOffset = offsetX.value
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const onMove = (e: MouseEvent) => {
  if (!dragging.value) return
  const delta = e.clientX - startX
  offsetX.value = Math.max(Math.min(startOffset + delta, maxOffset), minOffset)
}

const onUp = () => {
  dragging.value = false
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onUp)
}

/* ---------- calcula limites ---------- */
const calcBounds = () => {
  const img = imgRef.value
  const wrap = wrapperRef.value
  if (!img || !wrap) return
  const extra = img.clientWidth - wrap.clientWidth
  minOffset = -extra
  maxOffset = 0
  offsetX.value = Math.max(Math.min(offsetX.value, maxOffset), minOffset)
}

/* ---------- lifecycle ---------- */
onMounted(() => {
  calcBounds()
  window.addEventListener('resize', calcBounds)
})
watch(() => displayUser.value?.bannerPicture, calcBounds)
</script>

<template>
  <div class="banner-container">
    <!-- banner -->
    <div
      class="banner-wrapper"
      ref="wrapperRef"
      @mouseenter="hoverBanner = true"
      @mouseleave="hoverBanner = false"
      @mousedown="onDown"
      @dblclick="uploadBannerPicture"
      :style="{ cursor: canEdit ? (dragging ? 'grabbing' : 'grab') : 'default' }"
    >
      <img
        ref="imgRef"
        class="banner-img"
        :src="displayUser?.bannerPicture || defaultBanner"
        :style="{ transform: `translateX(${offsetX}px)` }"
        @load="calcBounds"
        draggable="false"
      />

      <div v-if="canEdit && hoverBanner && !dragging" class="overlay-banner">
        Duplo clique para trocar
      </div>
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

/* ------- banner -------- */
.banner-wrapper {
  position: relative;
  height: 220px; /* mesmo tamanho da página pública */
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.banner-img {
  height: 100%;
  width: auto;
  min-width: 100%;
  user-select: none;
  pointer-events: none;
}

.overlay-banner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(0 0 0 / 55%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  pointer-events: none;
}

/* ------- avatar -------- */
.avatar-wrapper {
  position: absolute;
  bottom: -50px; /* alinhado ao ProfileView */
  left: 1.5rem;
  display: flex;
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
  text-align: center;
  pointer-events: none;
}

@media (max-width: 800px) {
  .avatar-wrapper {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
