"use client";

import { useMemo, useState } from "react";
import { Button } from "@/ui/button";
import { downloadExcel, triggerBlobDownload } from "@/features/export/model";
import { fetchUserSchedule } from "@/features/schedule/model";

type Employee = { id: number; name: string; alliance: string; status: "submitted" | "pending"; progress: number };

const INITIAL_EMPLOYEES: Employee[] = [
  { id: 44921, name: "Иван Иванов", alliance: "Альянс Центр", status: "submitted", progress: 100 },
  { id: 44922, name: "Петр Петров", alliance: "Альянс Юг", status: "pending", progress: 44 },
  { id: 44923, name: "Мария Соколова", alliance: "Альянс Север", status: "pending", progress: 24 },
  { id: 44924, name: "Анна Котова", alliance: "Альянс Центр", status: "submitted", progress: 100 },
];

type Filter = "all" | "submitted" | "pending";

export function ManagerDashboard() {
  const [filter, setFilter] = useState<Filter>("all");
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedId, setSelectedId] = useState<number>(INITIAL_EMPLOYEES[0].id);
  const [activity, setActivity] = useState("Выберите сотрудника или примените быстрое действие.");

  const selected = employees.find((employee) => employee.id === selectedId) ?? employees[0];

  const filtered = useMemo(() => (filter === "all" ? employees : employees.filter((employee) => employee.status === filter)), [employees, filter]);
  const counts = useMemo(() => ({ submitted: employees.filter((e) => e.status === "submitted").length, pending: employees.filter((e) => e.status === "pending").length }), [employees]);

  const updateEmployee = (status: Employee["status"], message: string) => {
    setEmployees((current) => current.map((employee) => employee.id === selected.id ? { ...employee, status, progress: status === "submitted" ? 100 : 34 } : employee));
    setActivity(message);
  };

  const exportExcel = async () => {
    try {
      const blob = await downloadExcel();
      triggerBlobDownload(blob, `schedule-${new Date().toISOString().slice(0, 10)}.xlsx`);
      setActivity("Excel-экспорт сформирован и скачан.");
    } catch {
      setActivity("Excel-экспорт недоступен. Проверьте подключение к API.");
    }
  };

  const openUserSchedule = async () => {
    try {
      const result = await fetchUserSchedule(selected.id);
      setActivity(`Открыт график сотрудника ${result.user.full_name ?? selected.name}. Записей: ${Object.keys(result.entries).length}.`);
    } catch {
      setActivity(`Открыт график сотрудника ${selected.name}. API временно недоступен.`);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_320px]">
      <section className="rounded-[18px] border border-white/8 bg-[#0C0C0C] p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Сбор графиков</div><h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">Контур команды</h2></div>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Все" />
            <FilterButton active={filter === "submitted"} onClick={() => setFilter("submitted")} label="Сдали" />
            <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label="Не сдали" />
            <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={exportExcel}>Экспорт Excel</Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2"><SummaryCard label="Сдали" value={counts.submitted} tone="lime" /><SummaryCard label="Не сдали" value={counts.pending} tone="white" /></div>

        <div className="mt-5 overflow-hidden rounded-[16px] border border-white/8">
          {filtered.map((employee) => {
            const selectedRow = employee.id === selected.id;
            return (
              <button key={employee.id} type="button" onClick={() => setSelectedId(employee.id)} className={`grid w-full gap-3 border-b border-white/8 px-4 py-4 text-left transition last:border-b-0 md:grid-cols-[minmax(0,1fr)_150px_100px] ${selectedRow ? "bg-white/7" : "bg-black hover:bg-white/4"}`}>
                <div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-sm bg-[#151515] text-sm font-extrabold uppercase text-white">{employee.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><div className="text-sm font-bold uppercase tracking-[0.05em]">{employee.name}</div><div className="text-[11px] uppercase tracking-[0.16em] text-white/42">ID {employee.id}</div></div></div>
                <div className="space-y-2"><div className="text-[11px] uppercase tracking-[0.14em] text-white/42">{employee.alliance}</div><div className="h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[#FF0064]" style={{ width: `${employee.progress}%` }} /></div></div>
                <div className="flex items-center justify-start md:justify-end"><span className={`rounded-sm px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] ${statusChip(employee.status)}`}>{statusLabel(employee.status)}</span></div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-[18px] border border-white/8 bg-[#111111] p-4">
        <div className="border-b border-white/8 pb-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Выбран сотрудник</div><div className="mt-3 text-xl font-extrabold uppercase">{selected.name}</div><div className="mt-2 text-sm text-white/55">{selected.alliance}</div></div>
        <div className="mt-4 grid gap-2">
          <Button type="button" color="magenta" className="rounded-md" onClick={openUserSchedule}>Открыть график</Button>
          <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={() => updateEmployee("submitted", `График ${selected.name} подтвержден руководителем.`)}>Отметить как сданный</Button>
          <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={() => updateEmployee("pending", `Сотруднику ${selected.name} отправлено напоминание.`)}>Напомнить</Button>
        </div>
        <div className="mt-5 rounded-[14px] border border-white/8 bg-black px-4 py-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Активность</div><p className="mt-3 text-sm leading-6 text-white/65">{activity}</p></div>
      </aside>
    </div>
  );
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-sm px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] transition ${active ? "bg-[#FF0064] text-white" : "border border-white/12 bg-white/4 text-white/70 hover:bg-white/8"}`}>{label}</button>;
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "lime" | "white" }) {
  return <div className="rounded-[14px] border border-white/8 bg-black px-4 py-4"><div className={`text-3xl font-extrabold ${tone === "lime" ? "text-[#CCFF00]" : "text-white"}`}>{value}</div><div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">{label}</div></div>;
}

function statusChip(status: Employee["status"]) { return status === "submitted" ? "bg-[#CCFF00] text-black" : "bg-white/8 text-white/72"; }
function statusLabel(status: Employee["status"]) { return status === "submitted" ? "Сдал" : "Ожидается"; }
