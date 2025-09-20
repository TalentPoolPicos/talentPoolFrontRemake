import { http } from '@/lib/axios';
import type {
  PublicUserProfileResponseDto,
  UserPreviewResponseDto
} from '@/types';

export const usersService = {
  async getUserPreview(uuid: string): Promise<UserPreviewResponseDto> {
    const { data } = await http.get<UserPreviewResponseDto>(`/users/${uuid}/preview`);
    return data;
  },

  async getPublicProfile(uuid: string): Promise<PublicUserProfileResponseDto> {
    const { data } = await http.get<PublicUserProfileResponseDto>(`/users/${uuid}`);
    return data;
  },
};
