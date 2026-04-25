"use client";

import { useMemo, useState } from "react";
import { Button } from "@/ui/button";

type DayStatus = "shift" | "split" | "dayoff" | "vacation" | "empty";

const TOOLS: Array<{
  id: DayStatus;
  label: string;
  hint: string;
  className: string;
}> = [
  {
    id: "shift",
    label: "Смена",
    hint: "09:00-18:00",
    className: "bg-[#FF0064] text-white",
  },
  {
    id: "split",
    label: "С разрывом",
    hint: "09:00-13:00 / 16:00-20:00",
    className: "border border-[#FF0064] text-[#FF0064]",
  },
  {
    id: "dayoff",
    label: "Выходной",
    hint: "Свободный день",
    className: "border border-white/18 text-white/72",
  },
  {
    id: "vacation",
    label: "Отпуск",
    hint: "Вне смен",
    className: "bg-[#CCFF00] text-black",
  },
  {
    id: "empty",
    label: "Стереть",
    hint: "Убрать отметку",
    className: "bg-white/8 text-white/72",
  },
];

const DAYS = Array.from({ length: 30 }, (_, index) => index + 1);
const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export function UserDashboard() {
  const [activeTool, setActiveTool] = useState<DayStatus>("shift");
  const [days, setDays] = useState<Record<number, DayStatus>>({
    1: "shift",
    2: "shift",
    3: "split",
    6: "vacation",
    7: "vacation",
    13: "dayoff",
    14: "dayoff",
    18: "shift",
    19: "shift",
    22: "split",
    27: "dayoff",
  });

  const stats = useMemo(() => {
    return {
      shifts: Object.values(days).filter((value) => value === "shift").length,
      splits: Object.values(days).filter((value) => value === "split").length,
      dayoffs: Object.values(days).filter((value) => value === "dayoff").length,
      vacation: Object.values(days).filter((value) => value === "vacation").length,
    };
  }, [days]);

  const applyTool = (day: number) => {
    setDays((current) => {
      const next = { ...current };
      if (activeTool === "empty") {
        delete next[day];
        return next;
      }
      next[day] = activeTool;
      return next;
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <section className="rounded-[18px] border border-white/8 bg-[#111111] p-4">
        <div className="mb-5 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Инструменты
          </div>
          <p className="text-sm leading-6 text-white/60">
            Выберите тип дня слева, потом кликайте по датам в сетке.
          </p>
        </div>

        <div className="space-y-2">
          {TOOLS.map((tool) => {
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left transition ${
                  active
                    ? "border-[#FF0064] bg-white text-black"
                    : "border-white/10 bg-black text-white hover:border-white/18 hover:bg-white/3"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold uppercase tracking-[0.08em]">
                    {tool.label}
                  </div>
                  <div
                    className={`text-[11px] leading-4 ${
                      active ? "text-black/65" : "text-white/45"
                    }`}
                  >
                    {tool.hint}
                  </div>
                </div>
                <div
                  className={`min-w-[88px] rounded-sm px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] ${tool.className}`}
                >
                  {tool.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard label="Смен" value={stats.shifts} tone="white" />
          <StatCard label="Разрывов" value={stats.splits} tone="magenta" />
          <StatCard label="Выходных" value={stats.dayoffs} tone="muted" />
          <StatCard label="Отпуск" value={stats.vacation} tone="lime" />
        </div>
      </section>

      <section className="rounded-[18px] border border-white/8 bg-[#0B0B0B] p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Апрель 2026
            </div>
            <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">
              Матрица графика
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              color="ghost"
              className="rounded-md border border-white/12 bg-white/4 text-white"
            >
              Создать шаблон
            </Button>
            <Button type="button" color="magenta" className="rounded-md">
              Отправить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={`flex items-center justify-center rounded-md border border-white/6 px-2 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                index > 4 ? "text-[#FF0064]" : "text-white/42"
              }`}
            >
              {label}
            </div>
          ))}

          {DAYS.map((day) => {
            const status = days[day] ?? "empty";
            return (
              <button
                key={day}
                type="button"
                onClick={() => applyTool(day)}
                className={`aspect-[0.95] rounded-[14px] border p-3 text-left transition hover:-translate-y-[1px] ${
                  statusClasses(status)
                }`}
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="text-base font-extrabold">{day}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em]">
                    {statusLabels(status)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "white" | "magenta" | "lime" | "muted";
}) {
  const toneClass =
    tone === "magenta"
      ? "text-[#FF0064]"
      : tone === "lime"
        ? "text-[#CCFF00]"
        : tone === "muted"
          ? "text-white/78"
          : "text-white";

  return (
    <div className="rounded-[14px] border border-white/8 bg-black px-4 py-3">
      <div className={`text-2xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </div>
    </div>
  );
}

function statusClasses(status: DayStatus) {
  switch (status) {
    case "shift":
      return "border-[#FF0064] bg-[#FF0064] text-white";
    case "split":
      return "border-[#FF0064] bg-transparent text-[#FF0064]";
    case "dayoff":
      return "border-white/10 bg-[#121212] text-white";
    case "vacation":
      return "border-[#CCFF00] bg-[#CCFF00] text-black";
    default:
      return "border-white/8 bg-white/3 text-white/55";
  }
}

function statusLabels(status: DayStatus) {
  switch (status) {
    case "shift":
      return "Смена";
    case "split":
      return "Разрыв";
    case "dayoff":
      return "Выходной";
    case "vacation":
      return "Отпуск";
    default:
      return "Пусто";
  }
}
