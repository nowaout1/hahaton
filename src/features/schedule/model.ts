import { api } from "@/shared/api-client";
import type {
  ScheduleBulkUpdate,
  ScheduleDayPayload,
  ScheduleForUser,
} from "@/shared/types";

export const fetchMySchedule = async () => {
  const response =
    await api.get<Record<string, ScheduleDayPayload>>("/api/schedules/me");
  return response;
};

export const updateMySchedule = async (payload: ScheduleBulkUpdate) =>
  api.put<Record<string, ScheduleDayPayload>>("/api/schedules/me", payload);

export const fetchUserSchedule = async (userId: number) =>
  api.get<ScheduleForUser>(`/api/schedules/by-user/${userId}`);
