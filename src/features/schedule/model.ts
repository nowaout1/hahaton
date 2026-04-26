import { api } from "@/shared/api-client";
import type {
  ScheduleBulkUpdate,
  ScheduleDayPayload,
  ScheduleForUser,
} from "@/shared/types";

export const fetchMySchedule = async () => {
  const response =
    await api.get<Record<string, ScheduleDayPayload>>("/schedules/me");
  return response;
};

export const updateMySchedule = async (payload: ScheduleBulkUpdate) =>
  api.put<Record<string, ScheduleDayPayload>>("/schedules/me", payload);

export const fetchUserSchedule = async (userId: number) =>
  api.get<ScheduleForUser>(`/schedules/by-user/${userId}`);
