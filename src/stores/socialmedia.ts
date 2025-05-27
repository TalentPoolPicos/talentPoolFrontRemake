import { defineStore } from "pinia";
import { useUserStore } from "./user";
import type { components } from "@/types/api";
import { http } from "@/services/http";

type SocialMediaDto = components['schemas']['SocialMediaDto']


export const userSocialMediaStore = defineStore("userSocialMedia", () => {
  const userStore = useUserStore()

  const findAllByUserUuid = async (userUuid: string): Promise<SocialMediaDto[]> => {
    const { data } = await http.get<SocialMediaDto[]>(`/socialmedia/${userUuid}`);
    return data;
  };

  const findByUuid = async (uuid: string): Promise<SocialMediaDto> => {
    const { data } = await http.get<SocialMediaDto>(`/socialmedia/${uuid}`);
    return data;
  };

  const create = async (socialMedia: SocialMediaDto): Promise<SocialMediaDto> => {
    const { data } = await http.post<SocialMediaDto>(`/socialmedia`, socialMedia);
    userStore.fetch();
    return data;
  };

  const remove = async (uuid: string): Promise<void> => {
    await http.delete(`/socialmedia/${uuid}`);
    userStore.fetch();
  };

  return {
    findAllByUserUuid,
    findByUuid,
    create,
    remove,
  };

})
