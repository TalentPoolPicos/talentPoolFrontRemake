export const path = {
  home: () => '/' as const,
  about: () => '/about' as const,
  news: () => '/news' as const,

  signin: () => '/signin' as const,
  signup: () => '/signup' as const,

  profile: () => '/profile' as const,

  profileByUuid: (uuid: string) => `/profile/${uuid}` as const,

  // helper - atualizar quando implementar a pesquisa //
  search: (q: string) => `/search?q=${encodeURIComponent(q)}` as const,
} satisfies Record<string, (...args: any[]) => string>;

export type AppPath = ReturnType<(typeof path)[keyof typeof path]>;
