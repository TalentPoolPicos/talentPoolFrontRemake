import { http } from '@/lib/axios';
import type { JobResponseDto } from '@/types';

import type { EnterprisePublishedJobsResponse } from '@/types';

export const jobsService = {
  async getByUuid(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.get<JobResponseDto>(`/jobs/${uuid}`);
    return data;
  },

  async getEnterprisePublishedJobs(
    userUuid: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<EnterprisePublishedJobsResponse> {
    const { data } = await http.get<EnterprisePublishedJobsResponse>(
      `/jobs/enterprise/${userUuid}/published`,
      { params }
    );
    return data;
  },

  async getPublishedJobs(
    params: { limit?: number; offset?: number } = {}
  ): Promise<EnterprisePublishedJobsResponse> {
    const { data } = await http.get<EnterprisePublishedJobsResponse>(
      `/jobs/published`,
      { params }
    );
    return data;
  },
};
