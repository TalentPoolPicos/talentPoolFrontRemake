// src/stores/like.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '@/services/http'
import type { components } from '@/types/api'

type UserDto = components['schemas']['UserDto']
type RecommendedUsersPageDto = components['schemas']['RecommendedUsersPageDto']
type UsersPageDto = components['schemas']['UsersPageDto']
type LikeDto = components['schemas']['LikeDto']
type IsLikeDto = components['schemas']['IsLikeDto']

export const useLikeStore = defineStore('like', () => {
  // estados
  const recommendations = ref<UserDto[]>([])
  const recommendationsTotal = ref(0)

  const yourLikes = ref<UserDto[]>([])
  const yourLikesTotal = ref(0)

  const likedByYou = ref<UserDto[]>([])
  const likedByYouTotal = ref(0)

  // Ações

  async function fetchRecommendations(queries: { page?: number; limit?: number }): Promise<RecommendedUsersPageDto> {
    const { data } = await http.get<RecommendedUsersPageDto>('/like/recommendations', {
      params: queries,
    })
    recommendations.value = data.users
    recommendationsTotal.value = data.total
    return data
  }

  async function likeUser(userUuid: string): Promise<LikeDto> {
    const { data } = await http.post<LikeDto>(`/like/${userUuid}`)
    return data
  }

  async function unlikeUser(userUuid: string): Promise<void> {
    await http.delete(`/like/${userUuid}`)
  }

  async function fetchYourLikes(queries: { page?: number; limit?: number }): Promise<UsersPageDto> {
    const { data } = await http.get<UsersPageDto>('/like/your-likes', {
      params: queries,
    })
    yourLikes.value = data.users
    yourLikesTotal.value = data.total
    return data
  }

  async function fetchLikedByYou(queries: { page?: number; limit?: number }): Promise<UsersPageDto> {
    const { data } = await http.get<UsersPageDto>('/like/liked-by-you', {
      params: queries,
    })
    likedByYou.value = data.users
    likedByYouTotal.value = data.total
    return data
  }

  async function hasLiked(userUuid: string): Promise<boolean> {
    const { data } = await http.get<IsLikeDto>(`/like/has-liked/${userUuid}`)
    return data.isLike
  }

  return {
    // estados reativos
    recommendations,
    recommendationsTotal,
    yourLikes,
    yourLikesTotal,
    likedByYou,
    likedByYouTotal,
    // ações
    fetchRecommendations,
    likeUser,
    unlikeUser,
    fetchYourLikes,
    fetchLikedByYou,
    hasLiked,
  }
})
