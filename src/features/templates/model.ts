import { api } from '@/shared/api-client';
import type { ScheduleTemplate } from '@/shared/types';

export interface CreateTemplatePayload {
  name: string;
  work_days: number;
  rest_days: number;
  shift_start: string;
  shift_end: string;
  has_break: boolean;
  break_start?: string;
  break_end?: string;
}

export const fetchTemplates = () => api.get<ScheduleTemplate[]>('/templates');

export const createTemplate = (payload: CreateTemplatePayload) => api.post<ScheduleTemplate>('/templates', payload);

export const deleteTemplate = (id: number) => api.delete<void>(`/templates/${id}`);
