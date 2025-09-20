import { http } from '@/lib/axios';
import type { LikeInitiatorsResponseDto, LikeReceiversResponseDto } from '@/types';

export const likesService = {
  async getInitiators(userUuid: string): Promise<LikeInitiatorsResponseDto> {
    const { data } = await http.get<LikeInitiatorsResponseDto>(`/likes/${userUuid}/initiators`);
    return data;
  },

  async getReceivers(userUuid: string): Promise<LikeReceiversResponseDto> {
    const { data } = await http.get<LikeReceiversResponseDto>(`/likes/${userUuid}/receivers`);
    return data;
  },
};
