"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as adminApi from "@/features/admin/model";
import { fetchUserSchedule } from "@/features/schedule/model";
import {
  mergeAllianceOptions,
  loadStoredAlliances,
  saveStoredAlliances,
} from "@/shared/alliances";
import type { User, UserRole } from "@/shared/types";
import { Button } from "@/ui/button";

type AdminUser = {
  id: number;
  name: string;
  alliance: string;
  role: "user" | "manager" | "admin";
  verified: boolean;
};

const toRole = (role: UserRole): AdminUser["role"] => {
  if (role === "admin") return "admin";
  if (role === "manager") return "manager";
  return "user";
};

function mapUser(user: User): AdminUser {
  return {
    id: user.id,
    name: user.full_name ?? user.email ?? `Пользователь ${user.id}`,
    alliance: user.alliance ?? "Без альянса",
    role: toRole(user.role),
    verified: user.is_verified,
  };
}

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alliances, setAlliances] = useState<string[]>([]);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [activity, setActivity] = useState("Загружаю команду и альянсы.");
  const [busy, setBusy] = useState(false);
  const [allianceModalOpen, setAllianceModalOpen] = useState(false);
  const [allianceMode, setAllianceMode] = useState<"create" | "rename">(
    "create",
  );
  const [selectedAlliance, setSelectedAlliance] = useState("");
  const [allianceDraft, setAllianceDraft] = useState("");

  const syncAlliances = useCallback((usersState: AdminUser[]) => {
    const nextAlliances = mergeAllianceOptions(
      loadStoredAlliances(),
      usersState.map((user) => user.alliance),
    );
    setAlliances(nextAlliances);
    saveStoredAlliances(nextAlliances);
  }, []);

  const loadUsers = useCallback(async () => {
    setBusy(true);
    try {
      const response = await adminApi.fetchUsers();
      const mapped = response.map(mapUser);
      setUsers(mapped);
      syncAlliances(mapped);
      setActivity(
        mapped.length
          ? "Список сотрудников обновлен из API."
          : "В API пока нет сотрудников.",
      );
    } catch {
      const stored = loadStoredAlliances();
      setUsers([]);
      setAlliances(stored);
      setActivity("Не удалось загрузить список сотрудников из API.");
    } finally {
      setBusy(false);
    }
  }, [syncAlliances]);

  useEffect(() => {
    const run = async () => {
      await loadUsers();
    };
    void run();
  }, [loadUsers]);

  const stats = useMemo(
    () => ({
      total: users.length,
      verified: users.filter((user) => user.verified).length,
      attention: users.filter((user) => !user.verified).length,
    }),
    [users],
  );

  const registerChange = (message: string) => {
    setPendingChanges((current) => current + 1);
    setActivity(message);
  };

  const changeAlliance = async (userId: number, alliance: string) => {
    const nextUsers = users.map((user) =>
      user.id === userId ? { ...user, alliance } : user,
    );
    setUsers(nextUsers);
    syncAlliances(nextUsers);
    try {
      await adminApi.changeAlliance(userId, alliance);
      const user = users.find((item) => item.id === userId);
      if (user)
        registerChange(
          `Альянс пользователя ${user.name} изменен на ${alliance}.`,
        );
    } catch {
      setActivity("Не удалось обновить альянс в API.");
      await loadUsers();
    }
  };

  const changeRole = async (userId: number, role: AdminUser["role"]) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user)),
    );
    try {
      await adminApi.changeRole(userId, role as UserRole);
      const user = users.find((item) => item.id === userId);
      if (user) registerChange(`Роль пользователя ${user.name} изменена.`);
    } catch {
      setActivity("Не удалось обновить роль в API.");
      await loadUsers();
    }
  };

  const toggleVerified = async (userId: number) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    if (user.verified) {
      setActivity(
        "Снять верификацию бэкенд не умеет. Можно только подтверждать пользователей.",
      );
      return;
    }

    setUsers((current) =>
      current.map((entry) =>
        entry.id === userId ? { ...entry, verified: true } : entry,
      ),
    );
    try {
      await adminApi.verifyUser(userId);
      registerChange(`Пользователь ${user.name} верифицирован.`);
    } catch {
      setActivity("Не удалось верифицировать пользователя в API.");
      await loadUsers();
    }
  };

  const removeUser = async (userId: number) => {
    const user = users.find((item) => item.id === userId);
    const nextUsers = users.filter((item) => item.id !== userId);
    setUsers(nextUsers);
    syncAlliances(nextUsers);
    try {
      await adminApi.deleteUser(userId);
      if (user) registerChange(`Пользователь ${user.name} удален из списка.`);
    } catch {
      setActivity("Не удалось удалить пользователя из API.");
      await loadUsers();
    }
  };

  const previewSchedule = async (userId: number) => {
    try {
      const result = await fetchUserSchedule(userId);
      const name =
        result.user.full_name ?? result.user.email ?? `Пользователь ${userId}`;
      setActivity(
        `График пользователя ${name} загружен. Заполнено дней: ${Object.keys(result.entries).length}.`,
      );
    } catch {
      setActivity("Не удалось загрузить график пользователя.");
    }
  };

  const openAllianceModal = (mode: "create" | "rename") => {
    setAllianceMode(mode);
    setSelectedAlliance(alliances[0] ?? "");
    setAllianceDraft(mode === "rename" ? (alliances[0] ?? "") : "");
    setAllianceModalOpen(true);
  };

  const submitAllianceDraft = async () => {
    const trimmed = allianceDraft.trim();
    if (!trimmed) return;

    if (allianceMode === "create") {
      const nextAlliances = mergeAllianceOptions(alliances, [trimmed]);
      setAlliances(nextAlliances);
      saveStoredAlliances(nextAlliances);
      setAllianceModalOpen(false);
      registerChange(
        `Новый альянс "${trimmed}" добавлен во фронт. Он закрепится в бэке после назначения пользователю.`,
      );
      return;
    }

    if (!selectedAlliance || selectedAlliance === trimmed) {
      setAllianceModalOpen(false);
      return;
    }

    const affectedUsers = users.filter(
      (user) => user.alliance === selectedAlliance,
    );
    if (!affectedUsers.length) {
      const nextAlliances = mergeAllianceOptions(
        alliances.filter((alliance) => alliance !== selectedAlliance),
        [trimmed],
      );
      setAlliances(nextAlliances);
      saveStoredAlliances(nextAlliances);
      setAllianceModalOpen(false);
      registerChange(
        `Название альянса "${selectedAlliance}" обновлено во фронте. В бэке оно появится после назначения пользователю.`,
      );
      return;
    }

    setBusy(true);
    const nextUsers = users.map((user) =>
      user.alliance === selectedAlliance
        ? { ...user, alliance: trimmed }
        : user,
    );
    setUsers(nextUsers);
    syncAlliances(nextUsers);

    const results = await Promise.allSettled(
      affectedUsers.map((user) => adminApi.changeAlliance(user.id, trimmed)),
    );
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length) {
      setActivity("Не удалось переименовать альянс для части пользователей.");
      await loadUsers();
    } else {
      registerChange(
        `Альянс "${selectedAlliance}" переименован в "${trimmed}".`,
      );
    }

    setBusy(false);
    setAllianceModalOpen(false);
  };

  return (
    <>
      <div className="space-y-5 rounded-[18px] bg-black p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Состав команды
            </div>
            <p className="mt-2 max-w-[52ch] text-sm leading-6 text-white/58">
              Роли, верификация и альянсы теперь работают на реальных данных
              API. Отдельной сущности альянса на бэке нет, поэтому название
              закрепляется через пользователей.
            </p>
            <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              Изменений за сессию: {pendingChanges}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              color="ghost"
              className="rounded-sm border border-white/12 bg-white/4 text-white"
              onClick={() => openAllianceModal("create")}
            >
              Создать альянс
            </Button>
            <Button
              type="button"
              color="ghost"
              className="rounded-sm border border-white/12 bg-white/4 text-white"
              onClick={() => openAllianceModal("rename")}
            >
              Назвать альянс
            </Button>
            <Button
              type="button"
              color="ghost"
              className="rounded-sm border border-white/12 bg-white/4 text-white"
              onClick={() => void loadUsers()}
              disabled={busy}
            >
              Обновить
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[16px] border border-white/6">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-white/8 text-left">
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Пользователь
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Альянс
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Роль
                </th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Верификация
                </th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/6 bg-black transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-sm border-l-[3px] border-[#FF0064] bg-[#1A1A1A] text-sm font-extrabold uppercase">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.alliance}
                      onChange={(event) =>
                        void changeAlliance(user.id, event.target.value)
                      }
                      className="rounded-sm border border-white/10 bg-[#1A1A1A] px-3 py-2 text-xs font-semibold outline-none transition focus:border-[#FF0064]"
                    >
                      {alliances.map((alliance) => (
                        <option key={alliance} value={alliance}>
                          {alliance}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(event) =>
                        void changeRole(
                          user.id,
                          event.target.value as AdminUser["role"],
                        )
                      }
                      className="rounded-sm border border-white/10 bg-[#1A1A1A] px-3 py-2 text-xs font-semibold uppercase outline-none transition focus:border-[#FF0064]"
                    >
                      <option value="user">Оператор</option>
                      <option value="manager">Менеджер</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void toggleVerified(user.id)}
                      className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]"
                    >
                      <span
                        className={`flex size-5 items-center justify-center rounded-full border text-[11px] ${user.verified ? "border-[#CCFF00] bg-[#CCFF00] text-black" : "border-white/12 bg-transparent text-transparent"}`}
                      >
                        ✓
                      </span>
                      <span
                        className={
                          user.verified ? "text-white" : "text-white/38"
                        }
                      >
                        {user.verified ? "Verified" : "Unverified"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label="Посмотреть график"
                        tone="view"
                        onClick={() => void previewSchedule(user.id)}
                      >
                        View
                      </IconButton>
                      <IconButton
                        label="Удалить"
                        tone="danger"
                        onClick={() => void removeUser(user.id)}
                      >
                        Del
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <AdminStat
            label="Всего сотрудников"
            value={stats.total}
            tone="white"
          />
          <AdminStat
            label="Верифицировано"
            value={stats.verified}
            tone="lime"
          />
          <AdminStat
            label="Требуют внимания"
            value={stats.attention}
            tone="magenta"
          />
        </div>
        <div className="rounded-[14px] border border-white/8 bg-[#111111] px-4 py-4">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Активность
          </div>
          <p className="mt-3 text-sm leading-6 text-white/62">{activity}</p>
        </div>
      </div>

      {allianceModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4">
          <div className="w-full max-w-[460px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              {allianceMode === "create"
                ? "Создание альянса"
                : "Название альянса"}
            </div>
            <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">
              {allianceMode === "create"
                ? "Новый альянс"
                : "Переименовать альянс"}
            </h3>

            {allianceMode === "rename" && (
              <select
                value={selectedAlliance}
                onChange={(event) => {
                  setSelectedAlliance(event.target.value);
                  setAllianceDraft(event.target.value);
                }}
                className="mt-5 w-full rounded-[14px] border border-white/10 bg-black px-4 py-4 text-sm text-white outline-none transition focus:border-[#FF0064]"
              >
                {alliances.map((alliance) => (
                  <option key={alliance} value={alliance}>
                    {alliance}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={allianceDraft}
              onChange={(event) => setAllianceDraft(event.target.value)}
              placeholder={
                allianceMode === "create"
                  ? "Название нового альянса"
                  : "Новое название"
              }
              className="mt-5 w-full rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#FF0064]"
            />

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                color="ghost"
                className="rounded-md border border-white/12 bg-white/4 text-white"
                onClick={() => setAllianceModalOpen(false)}
              >
                Закрыть
              </Button>
              <Button
                type="button"
                color="magenta"
                className="rounded-md"
                onClick={() => void submitAllianceDraft()}
                disabled={!allianceDraft.trim() || busy}
              >
                Отправить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconButton({
  children,
  tone,
  onClick,
  label,
}: {
  children: React.ReactNode;
  tone: "view" | "danger";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-sm border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] transition ${tone === "view" ? "border-white/12 text-white/60 hover:border-[#CCFF00] hover:text-[#CCFF00]" : "border-white/12 text-white/60 hover:border-[#FF0064] hover:text-[#FF0064]"}`}
    >
      {children}
    </button>
  );
}

function AdminStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "lime" | "magenta";
}) {
  const toneClass =
    tone === "lime"
      ? "text-[#CCFF00]"
      : tone === "magenta"
        ? "text-[#FF0064]"
        : "text-white";
  return (
    <div className="rounded-[14px] bg-[#1A1A1A] px-4 py-4">
      <div className={`text-3xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </div>
    </div>
  );
}
