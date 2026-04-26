"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { UserDashboard } from "@/components/user-dashboard";
import { Button } from "@/ui/button";
import { useSession } from "@/stores/session-context";
import { UserRole } from "@/shared/types";

type Role = "user" | "manager" | "admin";

const ROLE_COPY: Record<Role, { badge: string; title: string; subtitle: string }> = {
  user: {
    badge: "Мой график",
    title: "Личный кабинет графика",
    subtitle: "Отмечайте смены, выходные и отпуск, быстро пересчитывайте итог и отправляйте расписание без лишних экранов.",
  },
  manager: {
    badge: "Контроль команды",
    title: "Панель менеджера",
    subtitle: "Следите за заполнением графиков, выбирайте сотрудников и пробивайтесь по статусам без нагромождения.",
  },
  admin: {
    badge: "Root access",
    title: "Управление персоналом",
    subtitle: "Роли, верификация, альянсы и состав команды в одном плотном рабочем контуре.",
  },
};

function mapUserRole(role: UserRole | undefined): Role {
  if (role === UserRole.ADMIN) return "admin";
  if (role === UserRole.MANAGER) return "manager";
  return "user";
}

export function DashboardWorkspace() {
  const { user, hydrateUser, logout } = useSession();

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const role = mapUserRole(user?.role);
  const copy = useMemo(() => ROLE_COPY[role], [role]);

  return (
    <main className="min-h-screen bg-[#050505] px-4 pb-8 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <section className="overflow-hidden rounded-[24px] border border-white/8 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-6 border-b border-white/8 px-5 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-[720px] flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image src="/logo/t2_Logo_White_sRGB.svg" alt="t2 logo" width={40} height={40} className="h-10 w-auto" />
                  <span className="inline-flex w-fit rounded-sm bg-[#FF0064] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                    {copy.badge}
                  </span>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-[12ch] text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">{copy.title}</h1>
                  <p className="max-w-[58ch] text-sm leading-6 text-white/55 sm:text-base">{copy.subtitle}</p>
                  {user ? <p className="text-xs uppercase tracking-[0.15em] text-white/40">{user.full_name ?? user.email}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-w-[148px] items-center justify-center rounded-md bg-[#FF0064] px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                  {role === "user" ? "Сотрудник" : role === "manager" ? "Менеджер" : "Админ"}
                </span>
                <Button type="button" color="ghost" className="min-w-[148px] rounded-md border border-white/12 bg-white/4 text-white" onClick={logout}>
                  Выйти
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 lg:p-5">
            {role === "user" && <UserDashboard userName={user?.full_name ?? user?.email} isVerified={user?.is_verified} />}
            {role === "manager" && <ManagerDashboard currentUserId={user?.id} />}
            {role === "admin" && <AdminDashboard />}
          </div>
        </section>
      </div>
    </main>
  );
}
