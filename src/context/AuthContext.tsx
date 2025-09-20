'use client';

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User, SignInDto, SignUpDto, TokensDto } from '@/types';
import { authService } from '@/services/auth';
import { http } from '@/lib/axios';

type AxiosErrorLike = {
  config?: any;
  response?: { status?: number };
};
type AxiosRequestConfigLike = {
  headers?: Record<string, any>;
  [k: string]: any;
};

type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  isEnterprise: boolean;
  isAdmin: boolean;
  isBootstrapped: boolean;
  signIn: (payload: SignInDto) => Promise<void>;
  signUp: (payload: SignUpDto) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isStudent: false,
  isEnterprise: false,
  isAdmin: false,
  isBootstrapped: false,
  signIn: async () => { },
  signUp: async () => { },
  logout: () => { },
});

const STORAGE_KEY = 'normal_user';
const STORAGE_KEY_ACCESS_TOKEN = `${STORAGE_KEY}_access_token`;
const STORAGE_KEY_REFRESH_TOKEN = `${STORAGE_KEY}_refresh_token`;
const STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN = `${STORAGE_KEY}_access_token_expires_in`;
const STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN = `${STORAGE_KEY}_refresh_token_expires_in`;

type RetryConfig = {
  _retry?: boolean;
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, any>;
  params?: any;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  [k: string]: any;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [accessTokenExp, setAccessTokenExp] = useState<number | null>(null);
  const [refreshTokenExp, setRefreshTokenExp] = useState<number | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshing = useRef(false);
  const pendingQueue = useRef<((token: string | null) => void)[]>([]);

  const saveTokens = useCallback((t: TokensDto) => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, t.access_token);
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, t.refresh_token);
    localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN, String(now + t.access_token_expires_in * 1000));
    localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN, String(now + t.refresh_token_expires_in * 1000));
    setAccessToken(t.access_token);
    setRefreshToken(t.refresh_token);
    setAccessTokenExp(now + t.access_token_expires_in * 1000);
    setRefreshTokenExp(now + t.refresh_token_expires_in * 1000);
  }, []);

  const saveUser = useCallback((u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
    setUser(u);
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN);
    localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN);
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setAccessTokenExp(null);
    setRefreshTokenExp(null);
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (!accessTokenExp) return;
    const delay = accessTokenExp - Date.now() - 30_000;
    if (delay <= 0) {
      void refreshAccessToken();
      return;
    }
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => void refreshAccessToken(), delay);
  }, [accessTokenExp]);

  useEffect(() => {
    scheduleRefresh();
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return false;
    if (accessTokenExp && Date.now() < accessTokenExp) return true;

    if (isRefreshing.current) {
      await new Promise<void>((resolve) => {
        pendingQueue.current.push(() => resolve());
      });
      return !!accessToken;
    }

    try {
      isRefreshing.current = true;
      const tokens = await authService.refresh(refreshToken);
      saveTokens(tokens);
      pendingQueue.current.forEach((fn) => fn(tokens.access_token));
      pendingQueue.current = [];
      return true;
    } catch (err) {
      clearAll();
      pendingQueue.current.forEach((fn) => fn(null));
      pendingQueue.current = [];
      return false;
    } finally {
      isRefreshing.current = false;
    }
  }, [refreshToken, accessTokenExp, accessToken, saveTokens, clearAll]);

  useEffect(() => {
    const id = http.interceptors.response.use(
      (r) => r,
      async (error: any) => {
        const original = (error?.config ?? {}) as RetryConfig;

        if (error?.response?.status === 401 && !original?._retry) {
          original._retry = true;

          const ok = await refreshAccessToken();
          if (ok) {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN)}`;

            if (!original.url && error?.config?.url) {
              original.url = error.config.url as string;
            }

            return http.request(original as any);
          }
        }

        return Promise.reject(error);
      }
    );
    return () => http.interceptors.response.eject(id);
  }, [refreshAccessToken]);

  const signIn = useCallback(async (payload: SignInDto) => {
    const tokens = await authService.signIn(payload);
    saveTokens(tokens);
    const me = await authService.me();
    saveUser(me);
  }, [saveTokens, saveUser]);

  const signUp = useCallback(async (payload: SignUpDto) => {
    const tokens = await authService.signUp(payload);
    saveTokens(tokens);
    const me = await authService.me();
    saveUser(me);
  }, [saveTokens, saveUser]);

  const logout = useCallback(() => {
    clearAll();
  }, [clearAll]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const uStr = localStorage.getItem(STORAGE_KEY);
      const at = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
      const rt = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);
      const atExpStr = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_IN);
      const rtExpStr = localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_IN);

      if (uStr) setUser(JSON.parse(uStr));
      if (at) setAccessToken(at);
      if (rt) setRefreshToken(rt);
      if (atExpStr) setAccessTokenExp(parseInt(atExpStr));
      if (rtExpStr) setRefreshTokenExp(parseInt(rtExpStr));
    } finally {
      setIsBootstrapped(true);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isLoggedIn = !!user;
    return {
      user,
      isLoggedIn,
      isStudent: user?.role === 'student',
      isEnterprise: user?.role === 'enterprise',
      isAdmin: user?.role === 'admin',
      isBootstrapped,
      signIn,
      signUp,
      logout,
    };
  }, [user, isBootstrapped, signIn, signUp, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
