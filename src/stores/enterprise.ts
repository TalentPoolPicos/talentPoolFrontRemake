import { defineStore, storeToRefs } from "pinia"
import { useAuthStore } from "./auth"
import type { components } from "@/types/api"
import { ref, watch } from "vue"
import { http } from "@/services/http"

type UserDto = components['schemas']['UserDto']
type EnterpriseDto = components['schemas']['EnterpriseDto']
type PartialEnterpriseDto = components['schemas']['PartialEnterpriseDto']
type EnterprisePageDto = components['schemas']['EnterprisePageDto']


export const useEnterpriseStore = defineStore('enterprise', () => {
  const authStore = useAuthStore()
  const { loggedUser } = storeToRefs(authStore)

  const loggedEnterprise = ref<EnterpriseDto | null>(
    loggedUser.value?.enterprise ? loggedUser.value.enterprise : null,
  )

  watch(loggedEnterprise, (val) => {
    if (val) {
      loggedUser.value = {
        ...loggedUser.value,
        enterprise: val,
      } as UserDto
    }
  }
  )

  const isEnterprise = () => {
    if (loggedUser.value === null || loggedUser.value.role !== 'enterprise') {
      throw new Error('User not logged in or not an enterprise')
    }
  }

  const enterpriseByPagination = async (queries: {
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

  const partialLoggedUpdateEnterprise = async (enterprise: PartialEnterpriseDto): Promise<EnterpriseDto> => {
    isEnterprise()

    const { data } = await http.patch<EnterpriseDto>(`/enterprises`, enterprise)
    loggedEnterprise.value = data
    return data
  }

  const getLoggedEnterprise = async (): Promise<EnterpriseDto> => {
    isEnterprise()

    const { data } = await http.get<EnterpriseDto>(`/enterprises/${loggedUser.value?.uuid}`)
    loggedEnterprise.value = data
    return data
  }

  const enterpriseByUuid = async (uuid: string): Promise<EnterpriseDto> => {
    const { data } = await http.get<EnterpriseDto>(`/enterprises/${uuid}`)
    return data
  }

  return {
    loggedEnterprise,
    isEnterprise,
    enterpriseByPagination,
    partialLoggedUpdateEnterprise,
    getLoggedEnterprise,
    enterpriseByUuid,
  }
})
