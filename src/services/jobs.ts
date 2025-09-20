import { http } from '@/lib/axios';
import type { JobResponseDto } from '@/types';

export const jobsService = {
  async getByUuid(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.get<JobResponseDto>(`/jobs/${uuid}`);
    return data;
  },
};
