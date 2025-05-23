import { defineStore, storeToRefs } from 'pinia'
import type { components } from '@/types/api'
import { http } from '@/services/http'
import { useAuthStore } from '@/stores/auth'

export type UserDto = components['schemas']['UserDto']
type UsersPageDto = components['schemas']['UsersPageDto']
type PartialUserDto = components['schemas']['PartialUserDto']

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()
  const { loggedUser } = storeToRefs(authStore)

  const byPagination = async (queries: { page: number; limit: number }): Promise<UsersPageDto> => {
    const { data } = await http.get<UsersPageDto>('/users', {
      params: {
        ...queries,
      },
    })
    return data
  }

  const partialUpdate = async (user: PartialUserDto): Promise<UserDto> => {
    if (loggedUser.value === null) {
      throw new Error('User not logged in')
    }

    const { data } = await http.patch<UserDto>(`/users`, user)
    loggedUser.value = data
    return data
  }

  const remove = async () => {
    if (loggedUser.value === null) {
      throw new Error('User not logged in')
    }

    await http.delete(`/users`)
    authStore.logout()
  }

  const fetch = async () => {
    if (loggedUser.value === null) {
      throw new Error('User not logged in')
    }

    const { data } = await http.get<UserDto>(`/users/${loggedUser.value.uuid}`)
    loggedUser.value = data
    return data
  }

  const findByUuid = async (uuid: string): Promise<UserDto> => {
    const { data } = await http.get<UserDto>(`/users/${uuid}`)
    return data
  }

  const uploadProfilePicture = async (file: File) => {
    if (loggedUser.value === null) {
      throw new Error('User not logged in')
    }

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
    if (loggedUser.value === null) {
      throw new Error('User not logged in')
    }

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
    byPagination,
    partialUpdate,
    remove,
    fetch,
    findByUuid,
    uploadProfilePicture,
    uploadBannerPicture,
  }
})
