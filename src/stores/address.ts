import { http } from "@/services/http";
import type { components } from "@/types/api";
import { defineStore } from "pinia";
import { useUserStore } from "./user";

type AddressDto = components['schemas']['AddressDto']
type CreateOrUpdateAddressDto = components['schemas']['CreateOrUpdateAddressDto']


export const useAddressStore = defineStore("address", () => {
  const userStore = useUserStore();

  const findByUserUuid = async (userUuid: string): Promise<AddressDto[]> => {
    const { data } = await http.get<AddressDto[]>(`/address/${userUuid}`);
    return data;
  }

  const createOrUpdate = async (address: CreateOrUpdateAddressDto): Promise<AddressDto> => {
    const { data } = await http.post<AddressDto>(`/address`, address);
    userStore.fetch();
    return data;
  }

  return {
    findByUserUuid,
    createOrUpdate,
  }
})
