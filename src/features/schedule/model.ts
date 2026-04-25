import { api } from '@/shared/api-client';
import type { ScheduleBulkUpdate, ScheduleDayPayload, ScheduleForUser } from '@/shared/types';

export const fetchMySchedule = () => api.get<Record<string, ScheduleDayPayload>>('/schedules/me');

export const updateMySchedule = (payload: ScheduleBulkUpdate) =>
  api.put<Record<string, ScheduleDayPayload>>('/schedules/me', payload);

export const fetchUserSchedule = (userId: number) => api.get<ScheduleForUser>(`/schedules/by-user/${userId}`);
