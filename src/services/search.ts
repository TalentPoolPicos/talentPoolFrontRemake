import { http } from '@/lib/axios';
import type {
  SearchJobsParams, SearchJobsResponseDto,
  SearchUsersParams, SearchUsersResponseDto, UserPreviewResponseDto
} from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_FILES_BASE
  ?? (http.defaults.baseURL ?? '')
).replace(/\/+$/, '');

const pick = (...vals: Array<string | null | undefined>) =>
  vals.find(v => !!v && String(v).trim() !== '') ?? null;

const toAbs = (u?: string | null) => {
  if (!u) return null;
  if (/^(https?:)?\/\//i.test(u) || u.startsWith('data:')) return u;
  return `${API_BASE}${u.startsWith('/') ? '' : '/'}${u}`;
};

const normalizeUser = (u: any): UserPreviewResponseDto => ({
  ...u,
  avatarUrl: toAbs(pick(u.avatarUrl, u.profilePicture, u.avatar_url)),
  bannerUrl: toAbs(pick(u.bannerUrl, u.banner_url, u.bannerURL)),
});

export const searchService = {
  async users(params: SearchUsersParams = {}): Promise<SearchUsersResponseDto> {
    const { data } = await http.get<SearchUsersResponseDto>('/search/users', {
      params: {
        q: params.q ?? '',
        role: params.role,
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
    return {
      ...data,
      hits: (data.hits ?? []).map(normalizeUser),
    };
  },

  async jobs(params: SearchJobsParams = {}): Promise<SearchJobsResponseDto> {
    const { data } = await http.get<SearchJobsResponseDto>('/search/jobs', {
      params: {
        q: params.q ?? '',
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });
    return data;
  },
};
