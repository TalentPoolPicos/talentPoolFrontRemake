import { http } from '@/lib/axios';
import type { SignInDto, SignUpDto, TokensDto, User } from '@/types';

export const authService = {
  async signIn(payload: SignInDto): Promise<TokensDto> {
    const { data } = await http.post<TokensDto>('/auth/sign-in', payload);
    return data;
  },

  async signUp(payload: SignUpDto): Promise<TokensDto> {
    const { data } = await http.post<TokensDto>('/auth/sign-up', payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<TokensDto> {
    const { data } = await http.post<TokensDto>('/auth/refresh', { refreshToken });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await http.get<User>('/me');
    return data;
  },
};
