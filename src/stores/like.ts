import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { http } from '@/services/http'
import { useAuthStore } from './auth'

type RecommendedUsersPageDto = components['schemas']['RecommendedUsersPageDto']
type LikeDto = components['schemas']['LikeDto']
type IsLikeDto = components['schemas']['IsLikeDto']
type UsersPageDto = components['schemas']['UsersPageDto']

export const useLikeStore = defineStore('tag', () => {
  const authStore = useAuthStore()


  const recommendedUsers = async (queries: {
    page?: number
    limit?: number
  }): Promise<RecommendedUsersPageDto> => {
    const { data } = await http.get<RecommendedUsersPageDto>('/like/recommendations', {
      params: {
        ...queries,
      },
    })
    return data
  }
  const hasLiked = async (userUuid: string): Promise<IsLikeDto> => {
    const { data } = await http.get<IsLikeDto>(`/like/has-liked/${userUuid}`)
    return data
  }

  const initiatorLikes = async (queries: {
    page?: number
    limit?: number
    userUuid?: string
  }): Promise<UsersPageDto> => {
    if (authStore.isLoggedIn && !queries.userUuid) {
      queries.userUuid = authStore.loggedUser?.uuid
    }

    const { data } = await http.get<UsersPageDto>(`/like/initiator/${queries.userUuid}`, {
      params: {
        ...queries,
        userUuid: queries.userUuid,
      },
    })
    return data
  }

  const receiverLikes = async (queries: {
    page?: number
    limit?: number
    userUuid?: string
  }): Promise<UsersPageDto> => {
    if (authStore.isLoggedIn && !queries.userUuid) {
      queries.userUuid = authStore.loggedUser?.uuid
    }

    const { data } = await http.get<UsersPageDto>(`/like/receiver/${queries.userUuid}`, {
      params: {
        ...queries,
      },
    })
    return data
  }

  const like = async (userUuid: string): Promise<LikeDto> => {
    const { data } = await http.post<LikeDto>(`/like/${userUuid}`)
    return data
  }

  const unlike = async (userUuid: string): Promise<void> => {
    await http.delete(`/like/${userUuid}`)
  }

  return {
    recommendedUsers,
    hasLiked,
    initiatorLikes,
    receiverLikes,
    like,
    unlike,
  }
})
