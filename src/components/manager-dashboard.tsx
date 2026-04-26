"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusDialog } from "@/components/status-dialog";
import { fetchUsers } from "@/features/admin/model";
import { closePeriod, createPeriod, fetchCurrentPeriod } from "@/features/periods/model";
import { fetchUserSchedule } from "@/features/schedule/model";
import type { CollectionPeriod, ScheduleDayPayload, User } from "@/shared/types";
import { Button } from "@/ui/button";

type Employee = {
  id: number;
  name: string;
  alliance: string;
  status: "submitted" | "pending";
  progress: number;
  email?: string;
  entries: Record<string, ScheduleDayPayload>;
};

type Filter = "all" | "submitted" | "pending";

function toInputDate(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function buildDeadline(value: string) {
  return `${value}T23:59:59`;
}

function formatPeriod(period: CollectionPeriod | null) {
  if (!period) return "Период не открыт";
  return `${period.period_start} - ${period.period_end}`;
}

function mapEmployee(user: User, entries: Record<string, ScheduleDayPayload>): Employee {
  const filledDays = Object.keys(entries).length;
  return {
    id: user.id,
    name: user.full_name ?? user.email ?? `Пользователь ${user.id}`,
    alliance: user.alliance ?? "Без альянса",
    email: user.email,
    status: filledDays > 0 ? "submitted" : "pending",
    progress: filledDays > 0 ? 100 : 24,
    entries,
  };
}

function createExcelLikeBlob(employees: Employee[]) {
  const allDates = Array.from(
    new Set(employees.flatMap((employee) => Object.keys(employee.entries))),
  ).sort();

  const rows = employees
    .filter((employee) => Object.keys(employee.entries).length > 0)
    .map((employee) => {
      const cells = allDates
        .map((dateKey) => {
          const entry = employee.entries[dateKey];
          if (!entry) return "<td></td>";
          return `<td>${String(entry.status)}</td>`;
        })
        .join("");

      return `<tr><td>${employee.alliance}</td><td>${employee.name}</td>${cells}</tr>`;
    })
    .join("");

  const headerDates = allDates.map((dateKey) => `<th>${dateKey}</th>`).join("");
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Альянс</th><th>Сотрудник</th>${headerDates}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  return new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
}

function triggerDownload(blob: Blob, fileName: string) {
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function ManagerDashboard({ currentUserId }: { currentUserId?: number }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activity, setActivity] = useState("Загружаю команду и графики сотрудников.");
  const [period, setPeriod] = useState<CollectionPeriod | null>(null);
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [periodBusy, setPeriodBusy] = useState(false);
  const [periodClosed, setPeriodClosed] = useState(false);
  const [periodStart, setPeriodStart] = useState("2026-04-20");
  const [periodEnd, setPeriodEnd] = useState("2026-05-03");
  const [dialog, setDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });

  const loadManagerData = useCallback(async () => {
    try {
      const [currentPeriod, users] = await Promise.all([
        fetchCurrentPeriod().catch(() => null),
        fetchUsers().catch(() => []),
      ]);

      const teamUsers = users.filter((user) => user.id !== currentUserId);

      const scheduleResults = await Promise.all(
        teamUsers.map(async (user) => {
          try {
            const schedule = await fetchUserSchedule(user.id);
            return mapEmployee(user, schedule.entries);
          } catch {
            return mapEmployee(user, {});
          }
        }),
      );

      setEmployees(scheduleResults);
      setSelectedId((current) => (current && scheduleResults.some((employee) => employee.id === current) ? current : scheduleResults[0]?.id ?? null));
      setPeriod(currentPeriod);
      setPeriodClosed(!currentPeriod);

      if (currentPeriod) {
        setPeriodStart(toInputDate(currentPeriod.period_start));
        setPeriodEnd(toInputDate(currentPeriod.period_end));
      }

      setActivity(scheduleResults.length ? "Контур команды загружен по рабочим endpoint'ам." : "В вашем контуре пока нет сотрудников.");
    } catch {
      setEmployees([]);
      setSelectedId(null);
      setPeriod(null);
      setPeriodClosed(true);
      setActivity("Не удалось загрузить данные менеджера из API.");
    }
  }, [currentUserId]);

  useEffect(() => {
    const run = async () => {
      await loadManagerData();
    };
    void run();
  }, [loadManagerData]);

  const selected = employees.find((employee) => employee.id === selectedId) ?? null;

  const filtered = useMemo(
    () => (filter === "all" ? employees : employees.filter((employee) => employee.status === filter)),
    [employees, filter],
  );

  const counts = useMemo(
    () => ({
      total: employees.length,
      submitted: employees.filter((employee) => employee.status === "submitted").length,
      pending: employees.filter((employee) => employee.status === "pending").length,
    }),
    [employees],
  );

  const exportExcel = async () => {
    const submittedEmployees = employees.filter((employee) => Object.keys(employee.entries).length > 0);
    if (!submittedEmployees.length) {
      setDialog({
        open: true,
        title: "Нет данных",
        message: "Для выгрузки Excel пока нет заполненных графиков.",
      });
      return;
    }

    const blob = createExcelLikeBlob(submittedEmployees);
    triggerDownload(blob, `schedule-${new Date().toISOString().slice(0, 10)}.xls`);
    setActivity("Excel выгружен из фронта на основе доступных графиков.");
    setDialog({
      open: true,
      title: "Excel сформирован",
      message: "Файл с графиками успешно сформирован и скачан.",
    });
  };

  const openUserSchedule = async () => {
    if (!selected) return;
    try {
      const result = await fetchUserSchedule(selected.id);
      setActivity(`Открыт график сотрудника ${result.user.full_name ?? selected.name}. Записей: ${Object.keys(result.entries).length}.`);
      setDialog({
        open: true,
        title: "График загружен",
        message: `График сотрудника ${result.user.full_name ?? selected.name} успешно получен.`,
      });
    } catch (error) {
      setActivity(`Не удалось открыть график сотрудника ${selected.name}.`);
      setDialog({
        open: true,
        title: "Ошибка",
        message: error instanceof Error ? error.message : "Не удалось открыть график сотрудника.",
      });
    }
  };

  const openPeriodModal = () => {
    setPeriodClosed(!period);
    setPeriodModalOpen(true);
  };

  const handleCloseCurrentPeriod = async () => {
    if (!period) {
      setPeriodClosed(true);
      return;
    }
    setPeriodBusy(true);
    try {
      await closePeriod(period.id);
      setPeriod(null);
      setPeriodClosed(true);
      setActivity("Текущий период закрыт. Теперь можно создать новый.");
      setDialog({
        open: true,
        title: "Период закрыт",
        message: "Текущий период успешно закрыт. Теперь можно создать следующий.",
      });
      await loadManagerData();
    } catch (error) {
      setActivity("Не удалось закрыть текущий период.");
      setDialog({
        open: true,
        title: "Ошибка",
        message: error instanceof Error ? error.message : "Не удалось закрыть текущий период.",
      });
    } finally {
      setPeriodBusy(false);
    }
  };

  const handleCreatePeriod = async () => {
    if (!periodClosed || !periodStart || !periodEnd) return;
    setPeriodBusy(true);
    try {
      const created = await createPeriod({
        period_start: periodStart,
        period_end: periodEnd,
        deadline: buildDeadline(periodEnd),
      });
      setPeriod(created);
      setPeriodClosed(false);
      setPeriodModalOpen(false);
      setActivity(`Создан новый период: ${created.period_start} - ${created.period_end}.`);
      setDialog({
        open: true,
        title: "Период создан",
        message: `Новый период ${created.period_start} - ${created.period_end} успешно создан.`,
      });
      await loadManagerData();
    } catch (error) {
      setActivity("Не удалось создать новый период.");
      setDialog({
        open: true,
        title: "Ошибка",
        message: error instanceof Error ? error.message : "Не удалось создать новый период.",
      });
    } finally {
      setPeriodBusy(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_320px]">
        <section className="rounded-[18px] border border-white/8 bg-[#0C0C0C] p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Сбор графиков</div>
              <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">Контур команды</h2>
              <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/42">Текущий период: {formatPeriod(period)}</div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Все" />
                <FilterButton active={filter === "submitted"} onClick={() => setFilter("submitted")} label="Сдали" />
                <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label="Не сдали" />
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={openPeriodModal}>
                  Управлять периодом
                </Button>
                <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={exportExcel}>
                  Экспорт Excel
                </Button>
                <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={() => void loadManagerData()} disabled={periodBusy}>
                  Обновить
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Всего" value={counts.total} tone="white" />
            <SummaryCard label="Сдали" value={counts.submitted} tone="lime" />
            <SummaryCard label="Не сдали" value={counts.pending} tone="white" />
          </div>

          <div className="mt-5 overflow-hidden rounded-[16px] border border-white/8">
            {filtered.map((employee) => {
              const selectedRow = employee.id === selected?.id;
              return (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => setSelectedId(employee.id)}
                  className={`grid w-full gap-3 border-b border-white/8 px-4 py-4 text-left transition last:border-b-0 md:grid-cols-[minmax(0,1fr)_150px_100px] ${selectedRow ? "bg-white/7" : "bg-black hover:bg-white/4"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-sm bg-[#151515] text-sm font-extrabold uppercase text-white">
                      {employee.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-[0.05em]">{employee.name}</div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">ID {employee.id}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-white/42">{employee.alliance}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[#FF0064]" style={{ width: `${employee.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-start md:justify-end">
                    <span className={`rounded-sm px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] ${statusChip(employee.status)}`}>
                      {statusLabel(employee.status)}
                    </span>
                  </div>
                </button>
              );
            })}
            {!filtered.length && <div className="px-4 py-6 text-sm text-white/55">Сотрудники по текущему фильтру не найдены.</div>}
          </div>
        </section>

        <aside className="rounded-[18px] border border-white/8 bg-[#111111] p-4">
          <div className="border-b border-white/8 pb-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Выбран сотрудник</div>
            <div className="mt-3 text-xl font-extrabold uppercase">{selected?.name ?? "Нет выбора"}</div>
            <div className="mt-2 text-sm text-white/55">{selected?.alliance ?? "Выберите сотрудника из списка"}</div>
          </div>
          <div className="mt-4 grid gap-2">
            <Button type="button" color="magenta" className="rounded-md" onClick={openUserSchedule} disabled={!selected}>
              Открыть график
            </Button>
            <Button
              type="button"
              color="ghost"
              className="rounded-md border border-white/12 bg-white/4 text-white"
              onClick={() =>
                setActivity(
                  selected
                    ? `Текущий статус по ${selected.name}: ${selected.status === "submitted" ? "график сдан" : "график пока не сдан"}.`
                    : "Сначала выберите сотрудника.",
                )
              }
              disabled={!selected}
            >
              Показать статус
            </Button>
            <Button
              type="button"
              color="ghost"
              className="rounded-md border border-white/12 bg-white/4 text-white"
              onClick={() =>
                setActivity(
                  selected
                    ? `Напоминание для ${selected.name} пока не поддержано бэком. Для этого понадобится отдельный серверный endpoint.`
                    : "Сначала выберите сотрудника.",
                )
              }
              disabled={!selected}
            >
              Напомнить
            </Button>
          </div>
          <div className="mt-5 rounded-[14px] border border-white/8 bg-black px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Активность</div>
            <p className="mt-3 text-sm leading-6 text-white/65">{activity}</p>
          </div>
        </aside>
      </div>

      {periodModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4">
          <div className="w-full max-w-[560px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Период сбора</div>
                <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">Создание нового периода</h3>
              </div>
              <button
                type="button"
                onClick={() => setPeriodModalOpen(false)}
                className="rounded-sm border border-white/12 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60 transition hover:border-[#FF0064] hover:text-[#FF0064]"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">Начало периода</span>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">Конец периода</span>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                />
              </label>
            </div>

            <div className="mt-4 rounded-[14px] border border-white/8 bg-black px-4 py-4 text-sm leading-6 text-white/62">
              Сначала закройте текущий период. После этого станет доступна кнопка создания нового периода.
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                color="ghost"
                className="rounded-md border border-white/12 bg-white/4 text-white"
                onClick={() => void handleCloseCurrentPeriod()}
                disabled={periodBusy || !period}
              >
                Закрыть текущий период
              </Button>
              <Button
                type="button"
                color="magenta"
                className="rounded-md"
                onClick={() => void handleCreatePeriod()}
                disabled={periodBusy || !periodClosed || !periodStart || !periodEnd}
              >
                Отправить
              </Button>
            </div>
          </div>
        </div>
      )}

      <StatusDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        onClose={() => setDialog({ open: false, title: "", message: "" })}
      />
    </>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] transition ${active ? "bg-[#FF0064] text-white" : "border border-white/12 bg-white/4 text-white/70 hover:bg-white/8"}`}
    >
      {label}
    </button>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "lime" | "white" }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-black px-4 py-4">
      <div className={`text-3xl font-extrabold ${tone === "lime" ? "text-[#CCFF00]" : "text-white"}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">{label}</div>
    </div>
  );
}

function statusChip(status: Employee["status"]) {
  return status === "submitted" ? "bg-[#CCFF00] text-black" : "bg-white/8 text-white/72";
}

function statusLabel(status: Employee["status"]) {
  return status === "submitted" ? "Сдал" : "Ожидается";
}
