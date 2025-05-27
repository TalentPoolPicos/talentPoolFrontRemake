import { defineStore } from 'pinia'
import { useUserStore } from './user'
import type { components } from '@/types/api'
import { http } from '@/services/http'

type TagDto = components['schemas']['TagDto']
type CreateTagDto = components['schemas']['CreateTagDto']

export const useTagStore = defineStore('tag', () => {
  const userStore = useUserStore()

  const findAllByUserUuid = async (uuid: string): Promise<TagDto[]> => {
    const { data } = await http.get<TagDto[]>(`/tag/${uuid}`)
    return data
  }

  const findByUuid = async (uuid: string): Promise<TagDto> => {
    const { data } = await http.get<TagDto>(`/tag/${uuid}`)
    return data
  }

  const create = async (tag: CreateTagDto): Promise<TagDto> => {
    const { data } = await http.post<TagDto>(`/tag`, tag)
    userStore.fetch()
    return data
  }

  const remove = async (uuid: string): Promise<void> => {
    await http.delete(`/tag/${uuid}`)
    userStore.fetch()
  }

  return {
    findAllByUserUuid,
    findByUuid,
    create,
    remove,
  }
})
