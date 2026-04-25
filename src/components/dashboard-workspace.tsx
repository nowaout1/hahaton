"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { UserDashboard } from "@/components/user-dashboard";
import { hasToken } from "@/features/auth/model";
import { UserRole } from "@/shared/types";
import { useSession } from "@/stores/session-context";
import { Button } from "@/ui/button";

type Role = "user" | "manager" | "admin";

const ROLE_COPY: Record<Role, { badge: string; title: string; subtitle: string }> = {
  user: {
    badge: "Мой график",
    title: "Личный кабинет графика",
    subtitle: "Отмечайте смены, выходные и отпуск, быстро пересчитывайте итог и отправляйте расписание без лишних экранов.",
  },
  manager: {
    badge: "Контроль команды",
    title: "Панель руководителя",
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
  const router = useRouter();
  const { user, hydrateUser, logout } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const ensureAccess = async () => {
      if (!hasToken()) {
        router.replace("/sign_in");
        return;
      }

      await hydrateUser();
      if (!isMounted) return;
      setReady(true);
    };

    ensureAccess();

    return () => {
      isMounted = false;
    };
  }, [hydrateUser, router]);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/sign_in");
    }
  }, [ready, router, user]);

  if (!ready || !user) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 pb-8 pt-24 text-white sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1400px] rounded-[24px] border border-white/8 bg-black px-6 py-14 text-center text-sm uppercase tracking-[0.14em] text-white/45">
          Проверяем права доступа...
        </div>
      </main>
    );
  }

  const role = mapUserRole(user.role);
  const copy = ROLE_COPY[role];

  return (
    <main className="min-h-screen bg-[#050505] px-4 pb-8 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <section className="overflow-hidden rounded-[24px] border border-white/8 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-6 border-b border-white/8 px-5 py-5 sm:px-6 lg:px-8 lg:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-[720px] flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image src="/logo/t2_Logo_White_sRGB.svg" alt="t2 logo" width={40} height={40} />
                  <span className="inline-flex w-fit rounded-sm bg-[#FF0064] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                    {copy.badge}
                  </span>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-[12ch] text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">{copy.title}</h1>
                  <p className="max-w-[58ch] text-sm leading-6 text-white/55 sm:text-base">{copy.subtitle}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/40">{user.full_name ?? user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <RoleButton active={role === "user"} allowed={role === "user"} label="Сотрудник" />
                <RoleButton active={role === "manager"} allowed={role === "manager"} label="Руководитель" />
                <RoleButton active={role === "admin"} allowed={role === "admin"} label="Админ" />
                <Button type="button" color="ghost" className="min-w-[148px] rounded-md border border-white/12 bg-white/4 text-white" onClick={logout}>
                  Выйти
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 lg:p-5">
            {role === "user" && <UserDashboard />}
            {role === "manager" && <ManagerDashboard />}
            {role === "admin" && <AdminDashboard />}
          </div>
        </section>
      </div>
    </main>
  );
}

function RoleButton({ active, allowed, label }: { active: boolean; allowed: boolean; label: string }) {
  return (
    <Button
      type="button"
      color={active ? "magenta" : "ghost"}
      disabled={!allowed}
      title={allowed ? "Роль из бэкенда" : "Недоступно: роль назначается бэкендом"}
      className={active
        ? "min-w-[148px] rounded-md border border-transparent"
        : "min-w-[148px] rounded-md border border-white/12 bg-white/4 text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-45"}
      data-disabled={!allowed}
    >
      {label}
    </Button>
  );
}
