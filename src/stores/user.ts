import { defineStore } from 'pinia'
import { STORAGE_KEY } from './auth'
import type { components } from '@/types/api'
import { ref, watch } from 'vue'
import { http } from '@/services/http'

type UserDto = components['schemas']['UserDto']
type UsersPageDto = components['schemas']['UsersPageDto']
type PartialUserDto = components['schemas']['PartialUserDto']

export const useUserStore = defineStore('user', () => {
  const userStored = localStorage.getItem(STORAGE_KEY)
  const loggedUser = ref<UserDto | null>(userStored ? JSON.parse(userStored) : null)

  watch(
    loggedUser,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      else localStorage.removeItem(STORAGE_KEY)
    },
    { immediate: true },
  )

  const usersByPagination = async (queries: { page: number; limit: number }) => {
    const { data } = await http.get<UsersPageDto>('/users', {
      params: {
        ...queries,
      },
    })
    return data
  }

  const partialLoggedUpdateUser = async (user: PartialUserDto): Promise<UserDto> => {
    const { data } = await http.patch<UserDto>(`/users`, user)
    loggedUser.value = data
    return data
  }

  const deleteLoggedUser = async () => {
    await http.delete(`/users`)
    loggedUser.value = null
  }

  const getLoggedUser = async () => {
    const { data } = await http.get<UserDto>(`/users/${loggedUser.value?.uuid}`)
    loggedUser.value = data
    return data
  }

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.post<UserDto>(`/users/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    loggedUser.value = data
    return data
  }

  const uploadBannerPicture = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.post<UserDto>(`/users/banner-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    loggedUser.value = data
    return data
  }

  return {
    loggedUser,
    usersByPagination,
    partialLoggedUpdateUser,
    deleteLoggedUser,
    getLoggedUser,
    uploadProfilePicture,
    uploadBannerPicture,
  }
})
