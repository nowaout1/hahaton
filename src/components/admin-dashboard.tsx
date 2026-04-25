"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/ui/button";
import * as adminApi from "@/features/admin/model";
import { UserRole } from "@/shared/types";

type AdminUser = {
  id: number;
  name: string;
  alliance: string;
  role: "user" | "manager" | "admin";
  verified: boolean;
};

const INITIAL_USERS: AdminUser[] = [
  { id: 44921, name: "Иван Иванов", alliance: "Альянс Центр", role: "user", verified: true },
  { id: 44922, name: "Петр Петров", alliance: "Альянс Юг", role: "admin", verified: false },
  { id: 44923, name: "Анна Романова", alliance: "Альянс Север", role: "manager", verified: true },
];

const toRole = (role: UserRole): AdminUser["role"] => {
  if (role === UserRole.ADMIN) return "admin";
  if (role === UserRole.MANAGER) return "manager";
  return "user";
};

export function AdminDashboard() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [alliances, setAlliances] = useState(["Альянс Центр", "Альянс Север", "Альянс Юг"]);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [activity, setActivity] = useState("Выберите действие: роль, альянс, верификация или просмотр.");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminApi.fetchUsers();
        if (!response.length) return;
        const mapped = response.map((u) => ({
          id: u.id,
          name: u.full_name ?? u.email ?? `Пользователь ${u.id}`,
          alliance: u.alliance ?? "Альянс Центр",
          role: toRole(u.role),
          verified: u.is_verified,
        }));
        setUsers(mapped);
      } catch {
        setActivity("API недоступен. Используются демо-данные.");
      }
    };
    load();
  }, []);

  const stats = useMemo(() => ({
    total: users.length,
    verified: users.filter((user) => user.verified).length,
    attention: users.filter((user) => !user.verified || user.role === "admin").length,
  }), [users]);

  const registerChange = (message: string) => {
    setPendingChanges((current) => current + 1);
    setActivity(message);
  };

  const changeAlliance = async (userId: number, alliance: string) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, alliance } : user)));
    try {
      await adminApi.changeAlliance(userId, alliance);
    } catch {
      setActivity("Не удалось обновить альянс в API.");
    }
    const user = users.find((item) => item.id === userId);
    if (user) registerChange(`Альянс пользователя ${user.name} изменен на ${alliance}.`);
  };

  const changeRole = async (userId: number, role: AdminUser["role"]) => {
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));
    try {
      await adminApi.changeRole(userId, role as UserRole);
    } catch {
      setActivity("Не удалось обновить роль в API.");
    }
    const user = users.find((item) => item.id === userId);
    if (user) registerChange(`Роль пользователя ${user.name} изменена.`);
  };

  const toggleVerified = async (userId: number) => {
    const user = users.find((item) => item.id === userId);
    setUsers((current) => current.map((u) => (u.id === userId ? { ...u, verified: !u.verified } : u)));
    if (!user) return;
    if (!user.verified) {
      try {
        await adminApi.verifyUser(userId);
      } catch {
        setActivity("Не удалось верифицировать пользователя в API.");
      }
    }
    registerChange(user.verified ? `Верификация пользователя ${user.name} снята.` : `Пользователь ${user.name} верифицирован.`);
  };

  const removeUser = async (userId: number) => {
    const user = users.find((item) => item.id === userId);
    setUsers((current) => current.filter((item) => item.id !== userId));
    try {
      await adminApi.deleteUser(userId);
    } catch {
      setActivity("Удаление в API недоступно. Пользователь удален локально.");
    }
    if (user) registerChange(`Пользователь ${user.name} удален из списка.`);
  };

  const addUser = () => {
    const nextId = Math.max(...users.map((user) => user.id)) + 1;
    const nextUser: AdminUser = { id: nextId, name: "Новый пользователь", alliance: alliances[0], role: "user", verified: false };
    setUsers((current) => [nextUser, ...current]);
    registerChange("Новая запись добавлена в начало списка.");
  };

  const createAlliance = () => {
    const nextAlliance = `Альянс ${alliances.length + 1}`;
    setAlliances((current) => [...current, nextAlliance]);
    registerChange(`Создан новый альянс: ${nextAlliance}.`);
  };

  const submitChanges = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setPendingChanges(0);
    setBusy(false);
    setActivity("Изменения отправлены.");
  };

  return (
    <div className="space-y-5 rounded-[18px] bg-black p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Состав команды</div>
          <p className="mt-2 max-w-[52ch] text-sm leading-6 text-white/58">Назначайте роли, меняйте альянсы и сразу фиксируйте верификацию без переходов на отдельные экраны.</p>
          <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">Неотправленных изменений: {pendingChanges}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" color="ghost" className="rounded-sm border border-white/12 bg-white/4 text-white" onClick={createAlliance}>Создать альянс</Button>
          <Button type="button" color="magenta" className="rounded-sm" onClick={submitChanges} disabled={busy}>{busy ? "Отправка..." : "Отправить изменения"}</Button>
          <Button type="button" color="magenta" className="rounded-sm" onClick={addUser}>+ Добавить пользователя</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[16px] border border-white/6">
        <table className="min-w-full border-collapse">
          <thead><tr className="border-b border-white/8 text-left"><th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">Пользователь</th><th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">Альянс</th><th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">Роль</th><th className="px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/40">Верификация</th><th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.16em] text-white/40">Действия</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/6 bg-black transition hover:bg-white/[0.02]">
                <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-sm border-l-[3px] border-[#FF0064] bg-[#1A1A1A] text-sm font-extrabold uppercase">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><div className="text-sm font-bold">{user.name}</div><div className="text-[10px] uppercase tracking-[0.16em] text-white/35">ID: {user.id}</div></div></div></td>
                <td className="px-4 py-4"><select value={user.alliance} onChange={(event) => changeAlliance(user.id, event.target.value)} className="rounded-sm border border-white/10 bg-[#1A1A1A] px-3 py-2 text-xs font-semibold outline-none transition focus:border-[#FF0064]">{alliances.map((alliance) => <option key={alliance}>{alliance}</option>)}</select></td>
                <td className="px-4 py-4"><select value={user.role} onChange={(event) => changeRole(user.id, event.target.value as AdminUser["role"])} className="rounded-sm border border-white/10 bg-[#1A1A1A] px-3 py-2 text-xs font-semibold uppercase outline-none transition focus:border-[#FF0064]"><option value="user">Оператор</option><option value="manager">Руководитель</option><option value="admin">Админ</option></select></td>
                <td className="px-4 py-4"><button type="button" onClick={() => toggleVerified(user.id)} className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]"><span className={`flex size-5 items-center justify-center rounded-full border text-[11px] ${user.verified ? "border-[#CCFF00] bg-[#CCFF00] text-black" : "border-white/12 bg-transparent text-transparent"}`}>✓</span><span className={user.verified ? "text-white" : "text-white/38"}>{user.verified ? "Verified" : "Unverified"}</span></button></td>
                <td className="px-4 py-4"><div className="flex justify-end gap-2"><IconButton label="Смотреть график" tone="view" onClick={() => setActivity(`Открыт график пользователя ${user.name}.`)}>View</IconButton><IconButton label="Удалить" tone="danger" onClick={() => removeUser(user.id)}>Del</IconButton></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-3"><AdminStat label="Всего сотрудников" value={stats.total} tone="white" /><AdminStat label="Верифицировано" value={stats.verified} tone="lime" /><AdminStat label="Требуют внимания" value={stats.attention} tone="magenta" /></div>
      <div className="rounded-[14px] border border-white/8 bg-[#111111] px-4 py-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Активность</div><p className="mt-3 text-sm leading-6 text-white/62">{activity}</p></div>
    </div>
  );
}

function IconButton({ children, tone, onClick, label }: { children: React.ReactNode; tone: "view" | "danger"; onClick: () => void; label: string }) {
  return <button type="button" aria-label={label} onClick={onClick} className={`rounded-sm border px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] transition ${tone === "view" ? "border-white/12 text-white/60 hover:border-[#CCFF00] hover:text-[#CCFF00]" : "border-white/12 text-white/60 hover:border-[#FF0064] hover:text-[#FF0064]"}`}>{children}</button>;
}

function AdminStat({ label, value, tone }: { label: string; value: number; tone: "white" | "lime" | "magenta" }) {
  const toneClass = tone === "lime" ? "text-[#CCFF00]" : tone === "magenta" ? "text-[#FF0064]" : "text-white";
  return <div className="rounded-[14px] bg-[#1A1A1A] px-4 py-4"><div className={`text-3xl font-extrabold ${toneClass}`}>{value}</div><div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</div></div>;
}
