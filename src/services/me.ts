import { http } from '@/lib/axios';
import type {
  UserProfileResponseDto,
  UpdateProfileDto,
  UpdateStudentProfileDto,
  UpdateEnterpriseProfileDto,
  UpdateSocialMediaDto,
  AddTagDto,
  CreateAddressDto,
  UpdateAddressDirectDto,
  UploadAvatarResponseDto,
  UploadBannerResponseDto,
  UploadCurriculumResponseDto,
  UploadHistoryResponseDto,
  HasLikedResponseDto,
  GiveLikeResponseDto,
  RemoveLikeResponseDto,
  CreateJobDto,
  JobResponseDto,
  JobListResponseDto,
  ApplicationListResponseDto,
  StudentApplicationListResponseDto,
  JobApplicationStudentResponseDto,
  EnterpriseJobsPaginationDto,
  GetApplicationsFilterDto,
  StudentApplicationsPaginationDto,
  UpdateJobContentDto,
  UpdateApplicationStatusDto,
  AddApplicationNotesDto,
  ApplyToJobDto,
  NotificationListDto
} from '@/types';
import { toFormData } from '@/helpers/formData';

export const meService = {
  async getMyProfile(): Promise<UserProfileResponseDto> {
    const { data } = await http.get<UserProfileResponseDto>('/me');
    return data;
  },

  async updateProfile(body: UpdateProfileDto): Promise<UserProfileResponseDto> {
    const { data } = await http.put<UserProfileResponseDto>('/me', body);
    return data;
  },

  async updateStudentProfile(body: UpdateStudentProfileDto): Promise<UserProfileResponseDto> {
    const { data } = await http.put<UserProfileResponseDto>('/me/student', body);
    return data;
  },

  async updateEnterpriseProfile(body: UpdateEnterpriseProfileDto): Promise<UserProfileResponseDto> {
    const { data } = await http.put<UserProfileResponseDto>('/me/enterprise', body);
    return data;
  },

  async updateSocialMedia(body: UpdateSocialMediaDto): Promise<UserProfileResponseDto> {
    const { data } = await http.put<UserProfileResponseDto>('/me/social-media', body);
    return data;
  },

  async deleteSocialMedia(uuid: string): Promise<UserProfileResponseDto> {
    const { data } = await http.delete<UserProfileResponseDto>(`/me/social-media/${uuid}`);
    return data;
  },

  async addTag(body: AddTagDto): Promise<UserProfileResponseDto> {
    const { data } = await http.post<UserProfileResponseDto>('/me/tags', body);
    return data;
  },

  async deleteTag(uuid: string): Promise<UserProfileResponseDto> {
    const { data } = await http.delete<UserProfileResponseDto>(`/me/tags/${uuid}`);
    return data;
  },

  async createAddress(body: CreateAddressDto): Promise<UserProfileResponseDto> {
    const { data } = await http.post<UserProfileResponseDto>('/me/address', body);
    return data;
  },

  async updateAddress(body: UpdateAddressDirectDto): Promise<UserProfileResponseDto> {
    const { data } = await http.put<UserProfileResponseDto>('/me/address', body);
    return data;
  },

  async uploadAvatar(file: File): Promise<UploadAvatarResponseDto> {
    const { data } = await http.post<UploadAvatarResponseDto>('/me/avatar', toFormData(file), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadBanner(file: File): Promise<UploadBannerResponseDto> {
    const { data } = await http.post<UploadBannerResponseDto>('/me/banner', toFormData(file), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadCurriculum(file: File): Promise<UploadCurriculumResponseDto> {
    const { data } = await http.post<UploadCurriculumResponseDto>(
      '/me/student/curriculum',
      toFormData(file),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async uploadHistory(file: File): Promise<UploadHistoryResponseDto> {
    const { data } = await http.post<UploadHistoryResponseDto>(
      '/me/student/history',
      toFormData(file),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  async checkLike(targetUuid: string): Promise<HasLikedResponseDto> {
    const { data } = await http.get<HasLikedResponseDto>(`/me/likes/${targetUuid}/check`);
    return data;
  },

  async giveLike(targetUuid: string): Promise<GiveLikeResponseDto> {
    const { data } = await http.post<GiveLikeResponseDto>(`/me/likes/${targetUuid}`);
    return data;
  },

  async removeLike(targetUuid: string): Promise<RemoveLikeResponseDto> {
    const { data } = await http.delete<RemoveLikeResponseDto>(`/me/likes/${targetUuid}`);
    return data;
  },

  async createJob(body: CreateJobDto): Promise<JobResponseDto> {
    const { data } = await http.post<JobResponseDto>('/me/enterprise/jobs', body);
    return data;
  },

  async getMyJobs(params: EnterpriseJobsPaginationDto = {}): Promise<JobListResponseDto> {
    const { data } = await http.get<JobListResponseDto>('/me/enterprise/jobs', { params });
    return data;
  },

  async getMyJob(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.get<JobResponseDto>(`/me/enterprise/jobs/${uuid}`);
    return data;
  },

  async updateJobContent(uuid: string, body: UpdateJobContentDto): Promise<JobResponseDto> {
    const { data } = await http.put<JobResponseDto>(`/me/enterprise/jobs/${uuid}/content`, body);
    return data;
  },

  async publishJob(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.put<JobResponseDto>(`/me/enterprise/jobs/${uuid}/publish`);
    return data;
  },

  async pauseJob(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.put<JobResponseDto>(`/me/enterprise/jobs/${uuid}/pause`);
    return data;
  },

  async closeJob(uuid: string): Promise<JobResponseDto> {
    const { data } = await http.put<JobResponseDto>(`/me/enterprise/jobs/${uuid}/close`);
    return data;
  },

  async getJobApplications(uuid: string): Promise<ApplicationListResponseDto> {
    const { data } = await http.get<ApplicationListResponseDto>(`/me/enterprise/jobs/${uuid}/applications`);
    return data;
  },

  async getAllCompanyApplications(params: GetApplicationsFilterDto = {}): Promise<ApplicationListResponseDto> {
    const { data } = await http.get<ApplicationListResponseDto>(`/me/enterprise/applications`, { params });
    return data;
  },

  async getJobApplicationsFiltered(uuid: string, params: GetApplicationsFilterDto = {}): Promise<ApplicationListResponseDto> {
    const { data } = await http.get<ApplicationListResponseDto>(`/me/enterprise/jobs/${uuid}/applications/filtered`, {
      params,
    });
    return data;
  },

  async updateApplicationStatus(uuid: string, body: UpdateApplicationStatusDto): Promise<any> {
    const { data } = await http.put<any>(`/me/enterprise/job-applications/${uuid}/status`, body);
    return data;
  },

  async addApplicationNotes(uuid: string, body: AddApplicationNotesDto): Promise<any> {
    const { data } = await http.put<any>(`/me/enterprise/applications/${uuid}/notes`, body);
    return data;
  },

  async applyToJob(jobUuid: string, body: ApplyToJobDto): Promise<JobApplicationStudentResponseDto> {
    const { data } = await http.post<JobApplicationStudentResponseDto>(`/me/student/job-applications/${jobUuid}`, body);
    return data;
  },

  async getMyApplications(params: StudentApplicationsPaginationDto = {}): Promise<StudentApplicationListResponseDto> {
    const { data } = await http.get<StudentApplicationListResponseDto>('/me/student/job-applications', { params });
    return data;
  },

  async removeApplication(uuid: string): Promise<{ message: string }> {
    const { data } = await http.delete<{ message: string }>(`/me/student/job-applications/${uuid}`);
    return data;
  },

  async getMyNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<NotificationListDto> {
    const { data } = await http.get<NotificationListDto>('/me/notifications', { params });
    return data;
  },

  async markNotificationAsRead(id: number): Promise<{ message: string; success: boolean }> {
    const { data } = await http.put<{ message: string; success: boolean }>(`/me/notifications/${id}/read`);
    return data;
  },

  async markAllNotificationsAsRead(): Promise<{ message: string; count: number }> {
    const { data } = await http.put<{ message: string; count: number }>(`/me/notifications/read-all`);
    return data;
  },

  async getUnreadNotificationsCount(): Promise<{ unreadCount: number }> {
    const { data } = await http.get<{ unreadCount: number }>(`/me/notifications/unread-count`);
    return data;
  },
};
