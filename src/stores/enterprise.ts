import { defineStore } from 'pinia'
import type { components } from '@/types/api'
import { http } from '@/services/http'
import { useUserStore } from './user'

type EnterpriseDto = components['schemas']['EnterpriseDto']
type PartialEnterpriseDto = components['schemas']['PartialEnterpriseDto']
type EnterprisePageDto = components['schemas']['EnterprisePageDto']

export const useEnterpriseStore = defineStore('enterprise', () => {
  const userStore = useUserStore()

  const isEnterprise = () => {
    if (userStore.loggedUser === null || userStore.loggedUser.role !== 'enterprise') {
      throw new Error('User not logged in or not an enterprise')
    }
  }

  const byPagination = async (queries: {
    page: number
    limit: number
  }): Promise<EnterprisePageDto> => {
    const { data } = await http.get<EnterprisePageDto>('/enterprises', {
      params: {
        ...queries,
      },
    })
    return data
  }

  const partialUpdate = async (enterprise: PartialEnterpriseDto): Promise<EnterpriseDto> => {
    isEnterprise()

    const { data } = await http.patch<EnterpriseDto>(`/enterprises`, enterprise)
    userStore.getLoggedUser()
    return data
  }

  const findByUuid = async (uuid: string): Promise<EnterpriseDto> => {
    const { data } = await http.get<EnterpriseDto>(`/enterprises/${uuid}`)
    return data
  }

  return {
    isEnterprise,
    byPagination,
    partialUpdate,
    findByUuid,
  }
})
