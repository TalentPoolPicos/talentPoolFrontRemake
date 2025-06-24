import { defineStore } from 'pinia'
import { http } from '@/services/http'
import { useUserStore } from './user'
import type { components } from '@/types/api'

type SocialMediaDto = components['schemas']['SocialMediaDto']
// payload esperado pelo backend — só `type` e `url`
type CreateSocialMediaDto = { type: 'discord' | 'linkedin' | 'github'; url: string }

export const userSocialMediaStore = defineStore('userSocialMedia', () => {
  const userStore = useUserStore()

  /* GET all links do usuário */
  const findAllByUserUuid = async (uuid: string) => {
    const { data } = await http.get<SocialMediaDto[]>(`/socialmedia/${uuid}`)
    return data
  }

  /* cria OU atualiza link */
  const createOrUpdate = async (payload: CreateSocialMediaDto) => {
    const { data } = await http.post<SocialMediaDto>('/socialmedia', payload)
    userStore.fetch()
    return data
  }

  const remove = async (uuid: string) => {
    await http.delete(`/socialmedia/${uuid}`)
    userStore.fetch()
  }

  return { findAllByUserUuid, createOrUpdate, remove }
})
