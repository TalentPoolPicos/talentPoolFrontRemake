export const path = {
  home: () => '/' as const,
  about: () => '/about' as const,
  news: () => '/news' as const,

  signin: () => '/signin' as const,
  signup: () => '/signup' as const,

  profile: () => '/profile' as const,
  profileByUuid: (uuid: string) => `/profile/${uuid}` as const,

  search: (q: string) => `/search?q=${encodeURIComponent(q)}` as const,

  jobDetails: (uuid: string) => `/jobs/${uuid}` as const,

  jobsPublic: () => '/jobs' as const,

  jobsPublished: () => '/jobs/published' as const,

  applications: () => '/applications' as const,
  companyJobs: () => '/jobs' as const,
  notifications: () => '/notifications' as const,
} satisfies Record<string, (...args: any[]) => string>;

export type AppPath = ReturnType<(typeof path)[keyof typeof path]>;
