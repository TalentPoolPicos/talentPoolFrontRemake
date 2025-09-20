export type Role = 'student' | 'enterprise' | 'admin';

export type SocialMediaItem = {
  uuid: string;
  type: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type TagItem = {
  uuid: string;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type AddressDto = {
  uuid: string;
  zipCode: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentDto = {
  uuid: string;
  course?: string;
  registrationNumber?: string;
  lattes?: string;
  curriculumUrl?: string | null;
  historyUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnterpriseDto = {
  uuid: string;
  fantasyName?: string;
  cnpj?: string;
  socialReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PrivateStatsDto = {
  totalLikesReceived: number;
  totalLikesGiven: number;
  profileCompleteness: number;
  joinedDate: string;
  lastActiveDate: string;
};

export type UserProfileResponseDto = {
  uuid: string;
  username: string;
  email: string;
  role: Role;
  name?: string;
  description?: string;
  birthDate?: string;
  isVerified: boolean;
  isActive: boolean;
  isComplete: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  student?: StudentDto;
  enterprise?: EnterpriseDto;
  socialMedia?: SocialMediaItem[];
  tags?: TagItem[];
  address?: AddressDto;
  stats: PrivateStatsDto;
  createdAt: string;
  updatedAt: string;
};

export type PublicUserProfileResponseDto = {
  uuid: string;
  username: string;
  role: Role;
  name?: string;
  description?: string;
  birthDate?: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  student?: StudentDto;
  enterprise?: EnterpriseDto;
  socialMedia?: SocialMediaItem[];
  tags?: TagItem[];
  address?: AddressDto;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileDto = {
  name?: string;
  description?: string;
  birthDate?: string; // ISO
};

export type UpdateStudentProfileDto = {
  course?: string | null;
  registrationNumber?: string | null;
  lattes?: string | null;
};

export type UpdateEnterpriseProfileDto = {
  fantasyName?: string | null;
  cnpj?: string | null;
  socialReason?: string | null;
};

export type UpdateSocialMediaDto = {
  socialMedia: Array<{ type: string; url: string }>;
};

export type AddTagDto = { label: string };

export type CreateAddressDto = {
  zipCode: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

export type UpdateAddressDirectDto = Partial<CreateAddressDto>;

export type UploadAvatarResponseDto = { avatarUrl: string; filename: string };
export type UploadBannerResponseDto = { bannerUrl: string; filename: string };
export type UploadCurriculumResponseDto = { curriculumUrl: string; filename: string };
export type UploadHistoryResponseDto = { historyUrl: string; filename: string };

export type HasLikedResponseDto = { hasLiked: boolean; targetUserUuid: string };
export type GiveLikeResponseDto = { message: string; targetUserUuid: string };
export type RemoveLikeResponseDto = { message: string; targetUserUuid: string };

export type JobListResponseDto = any;
export type ApplicationListResponseDto = any;
export type StudentApplicationListResponseDto = any;
export type JobApplicationStudentResponseDto = any;

export type EnterpriseJobsPaginationDto = {
  status?: 'draft' | 'published' | 'closed';
  limit?: number;
  offset?: number;
};

export type GetApplicationsFilterDto = {
  status?: string;
  limit?: number;
  offset?: number;
};

export type StudentApplicationsPaginationDto = {
  limit?: number;
  offset?: number;
};

export type CreateJobDto = any;
export type UpdateJobContentDto = any;
export type ApplyToJobDto = any;
export type UpdateApplicationStatusDto = any;
export type AddApplicationNotesDto = any;

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationListDto = {
  notifications: { notifications: NotificationItem[] };
  unreadCount: number;
  stats: { total: number; unread: number; byType: Record<string, number> };
  pagination: { page: number; limit: number; total: number };
};

export type User = {
  uuid: string;
  username: string;
  email?: string;
  name?: string;
  description?: string;
  role: Role;
  profilePicture?: string | null;
  bannerUrl?: string | null;
};

export type SignInDto = {
  username: string;
  password: string;
};

export type SignUpDto = {
  username: string;
  email: string;
  password: string;
  name: string;
  description?: string;
};

export type TokensDto = {
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
};

export type UserPreviewResponseDto = {
  uuid: string;
  username: string;
  role: 'student' | 'enterprise' | 'admin';
  name?: string;
  description?: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  mainTags?: string[];
  location?: string;
};

export type LikeInitiatorsResponseDto = {
  initiators: UserPreviewResponseDto[];
  total: number;
};

export type LikeReceiversResponseDto = {
  receivers: UserPreviewResponseDto[];
  total: number;
};

export type JobPreviewDto = {
  uuid: string;
  title: string;
  status: JobStatus;
  createdAt: string;
  publishedAt?: string;
  company: {
    uuid: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
};

export type SearchUsersParams = {
  q?: string;
  role?: 'student' | 'enterprise';
  limit?: number;
  offset?: number;
};

export type SearchJobsParams = {
  q?: string;
  limit?: number;
  offset?: number;
};

export type SearchUsersResponseDto = {
  hits: UserPreviewResponseDto[];
  total: number;
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
};

export type SearchJobsResponseDto = {
  hits: JobPreviewDto[];
  total: number;
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
};

export type JobStatus = 'draft' | 'published' | 'closed';

export type JobCompanyPreview = {
  uuid: string;
  username: string;
  name: string | null;
  avatarUrl?: string | null;
};

export type JobResponseDto = {
  uuid: string;
  title: string;
  body: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  company: JobCompanyPreview;
  totalApplications: number;
  hasApplied?: boolean;
};