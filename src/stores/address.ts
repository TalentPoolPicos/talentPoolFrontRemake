// src/stores/address.ts
import { http } from '@/services/http'
import type { components } from '@/types/api'
import { defineStore } from 'pinia'
import { useUserStore } from './user'

type AddressDto = components['schemas']['AddressDto']
export type CreateOrUpdateAddressDto = components['schemas']['CreateOrUpdateAddressDto']

export const useAddressStore = defineStore('address', () => {
  const userStore = useUserStore()

  const findByUserUuid = async (userUuid: string): Promise<AddressDto | null> => {
    try {
      const { data } = await http.get<AddressDto>(`/address/${userUuid}`)
      return data
    } catch (err: unknown) {
      function isAxiosError(error: unknown): error is { response: { status: number } } {
        return (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: unknown }).response === 'object' &&
          (error as { response?: unknown }).response !== null &&
          'status' in (error as { response: { status?: unknown } }).response
        )
      }

      if (
        isAxiosError(err) &&
        typeof err.response.status === 'number' &&
        err.response.status === 404
      ) {
        return null
      }
      throw err
    }
  }

  const createOrUpdate = async (address: CreateOrUpdateAddressDto): Promise<AddressDto> => {
    const { data } = await http.post<AddressDto>(`/address`, address)
    userStore.fetch()
    return data
  }

  return {
    findByUserUuid,
    createOrUpdate,
  }
})
