import { api } from '@/shared/api-client';
import type { CollectionPeriod, PeriodStats, SubmissionList } from '@/shared/types';

export const fetchCurrentPeriod = () => api.get<CollectionPeriod | null>('/periods/current');

export const createPeriod = (payload: { period_start: string; period_end: string; deadline: string }) =>
  api.post<CollectionPeriod>('/periods', payload);

export const closePeriod = (periodId: number) => api.post<CollectionPeriod>(`/periods/${periodId}/close`);

export const fetchPeriodStats = () => api.get<PeriodStats>('/periods/current/stats');

export const fetchSubmissions = () => api.get<SubmissionList>('/periods/current/submissions');

export const fetchHistory = () => api.get<CollectionPeriod[]>('/periods/history');
