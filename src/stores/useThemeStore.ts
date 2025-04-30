import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const PREFERENCES = ['auto', 'light', 'dark'] as const
export type Theme = typeof PREFERENCES[number]

const STORAGE_KEY = 'theme'

function applyTheme(pref: Theme) {
  const el = document.documentElement
  el.classList.remove('theme-light', 'theme-dark')
  if (pref === 'light') el.classList.add('theme-light')
  if (pref === 'dark') el.classList.add('theme-dark')
}

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  const theme = ref<Theme>(
    PREFERENCES.includes(stored as Theme) ? (stored as Theme) : 'auto'
  )

  function toggle() {
    const i = (PREFERENCES.indexOf(theme.value) + 1) % PREFERENCES.length
    theme.value = PREFERENCES[i]
  }

  watch(
    theme,
    val => {
      applyTheme(val)
      localStorage.setItem(STORAGE_KEY, val)
    },
    { immediate: true }
  )

  return { theme, toggle }
})
