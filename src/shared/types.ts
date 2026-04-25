export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export interface User {
  id: number;
  external_id?: string;
  email?: string;
  full_name?: string;
  alliance?: string;
  category?: string;
  role: UserRole;
  registered: boolean;
  is_verified: boolean;
}

export interface CollectionPeriod {
  id: number;
  alliance: string;
  period_start: string;
  period_end: string;
  deadline: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleDayPayload {
  status: string;
  meta?: Record<string, unknown>;
}

export interface ScheduleBulkUpdate {
  days: Record<string, ScheduleDayPayload>;
}

export interface ScheduleForUser {
  user: User;
  entries: Record<string, ScheduleDayPayload>;
  vacation_work?: Record<string, unknown>;
}

export interface ScheduleTemplate {
  id: number;
  user_id: number;
  name: string;
  work_days: number;
  rest_days: number;
  shift_start: string;
  shift_end: string;
  has_break: boolean;
  break_start?: string;
  break_end?: string;
  created_at: string;
  updated_at: string;
}

export interface PeriodStats {
  total_employees: number;
  submitted_count: number;
  pending_count: number;
}

export interface SubmissionListUser {
  id: number;
  full_name: string;
  email: string;
  alliance: string;
}

export interface SubmissionList {
  submitted: SubmissionListUser[];
  pending: SubmissionListUser[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  external_id?: string;
  full_name?: string;
  alliance?: string;
  category?: string;
  role?: UserRole;
}
