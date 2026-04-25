"use client";

import { useMemo, useState } from "react";
import { Button } from "@/ui/button";

type DayStatus = "shift" | "split" | "dayoff" | "vacation";
type SplitInterval = { start: string; end: string };
type CalendarEntry =
  | { status: "shift" }
  | { status: "split"; intervals: SplitInterval[] }
  | { status: "dayoff" }
  | { status: "vacation" };

const CALENDAR_YEAR = 2026;
const CALENDAR_MONTH_INDEX = 3;
const MONTH_LABEL = "Апрель 2026";
const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const TOOLS: Array<{
  id: DayStatus | "empty";
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
    hint: "Несколько интервалов",
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

const INITIAL_DAYS: Record<number, CalendarEntry> = {
  1: { status: "shift" },
  2: { status: "shift" },
  3: {
    status: "split",
    intervals: [
      { start: "09:00", end: "13:00" },
      { start: "16:00", end: "20:00" },
    ],
  },
  6: { status: "vacation" },
  7: { status: "vacation" },
  11: { status: "dayoff" },
  12: { status: "dayoff" },
  18: { status: "shift" },
  19: { status: "shift" },
  22: {
    status: "split",
    intervals: [
      { start: "08:30", end: "12:00" },
      { start: "15:00", end: "18:30" },
    ],
  },
  25: { status: "dayoff" },
};

function buildCalendarGrid(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayBasedOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: Array<number | null> = Array.from(
    { length: mondayBasedOffset },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function UserDashboard() {
  const [activeTool, setActiveTool] = useState<DayStatus | "empty">("shift");
  const [days, setDays] = useState<Record<number, CalendarEntry>>(INITIAL_DAYS);
  const [activity, setActivity] = useState(
    "Выберите тип дня слева и кликайте по датам. Для смены с разрывом откроется отдельное окно.",
  );
  const [templateLabel, setTemplateLabel] = useState("Шаблон не выбран");
  const [splitEditorOpen, setSplitEditorOpen] = useState(false);
  const [splitDraft, setSplitDraft] = useState<SplitInterval[]>([
    { start: "09:00", end: "13:00" },
  ]);

  const calendarCells = useMemo(
    () => buildCalendarGrid(CALENDAR_YEAR, CALENDAR_MONTH_INDEX),
    [],
  );

  const stats = useMemo(
    () => ({
      shifts: Object.values(days).filter((entry) => entry.status === "shift").length,
      splits: Object.values(days).filter((entry) => entry.status === "split").length,
      dayoffs: Object.values(days).filter((entry) => entry.status === "dayoff").length,
      vacation: Object.values(days).filter((entry) => entry.status === "vacation").length,
    }),
    [days],
  );

  const applyTool = (day: number) => {
    setDays((current) => {
      const next = { ...current };
      if (activeTool === "empty") {
        delete next[day];
      } else if (activeTool === "split") {
        next[day] = { status: "split", intervals: splitDraft };
      } else {
        next[day] = { status: activeTool };
      }
      return next;
    });

    setActivity(
      activeTool === "empty"
        ? `Отметка для ${day} числа удалена.`
        : activeTool === "split"
          ? `Для ${day} числа установлена смена с разрывом: ${splitDraft
              .map((item) => `${item.start}-${item.end}`)
              .join(", ")}.`
        : `Для ${day} числа установлен статус "${statusLabels(activeTool)}".`,
    );
  };

  const saveSplitDraft = () => {
    const cleaned = splitDraft.filter(
      (interval) => interval.start.trim() && interval.end.trim(),
    );

    if (!cleaned.length) return;

    setSplitDraft(cleaned);
    setActiveTool("split");
    setActivity(
      `Интервалы для смены с разрывом сохранены: ${cleaned
        .map((item) => `${item.start}-${item.end}`)
        .join(", ")}.`,
    );
    setSplitEditorOpen(false);
  };

  return (
    <>
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
                  onClick={() => {
                    if (tool.id === "split") {
                      setSplitEditorOpen(true);
                      return;
                    }
                    setActiveTool(tool.id);
                  }}
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

          <div className="mt-5 rounded-[14px] border border-white/8 bg-black px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
              Активность
            </div>
            <p className="mt-3 text-sm leading-6 text-white/65">{activity}</p>
          </div>
        </section>

        <section className="rounded-[18px] border border-white/8 bg-[#0B0B0B] p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                {MONTH_LABEL}
              </div>
              <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">
                Матрица графика
              </h2>
              <p className="mt-2 text-sm text-white/45">{templateLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                color="ghost"
                className="rounded-md border border-white/12 bg-white/4 text-white"
                onClick={() =>
                  setActivity("Текущий график сохранен как шаблон 'Мой шаблон'.")
                }
              >
                Сохранить текущее как шаблон
              </Button>
              <Button
                type="button"
                color="ghost"
                className="rounded-md border border-white/12 bg-white/4 text-white"
                onClick={() => {
                  setTemplateLabel("Выбран шаблон: 5/2 09:00-18:00");
                  setActivity("Шаблон '5/2 09:00-18:00' выбран для текущего месяца.");
                }}
              >
                Выбрать шаблон
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

            {calendarCells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-[0.95] rounded-[14px] border border-transparent bg-transparent"
                  />
                );
              }

              const entry = days[day];
              const status = entry?.status ?? "empty";

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => applyTool(day)}
                  className={`aspect-[0.95] rounded-[14px] border p-2 text-left transition hover:-translate-y-[1px] sm:p-3 ${
                    statusClasses(status)
                  }`}
                >
                  <div className="flex h-full flex-col justify-between">
                    <span className="text-sm font-extrabold sm:text-base">{day}</span>
                    <span className="hidden text-[10px] uppercase tracking-[0.14em] sm:block">
                      {statusLabels(status)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {splitEditorOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4">
          <div className="w-full max-w-[560px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Смена с разрывом
                </div>
                <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">
                  Настройка интервалов
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSplitEditorOpen(false)}
                className="rounded-sm border border-white/12 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60 transition hover:border-[#FF0064] hover:text-[#FF0064]"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {splitDraft.map((interval, index) => (
                <div
                  key={`${index}-${interval.start}-${interval.end}`}
                  className="flex items-center gap-3"
                >
                  <input
                    type="time"
                    value={interval.start}
                    onChange={(event) =>
                      setSplitDraft((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, start: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                  />
                  <input
                    type="time"
                    value={interval.end}
                    onChange={(event) =>
                      setSplitDraft((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, end: event.target.value }
                            : item,
                        ),
                      )
                    }
                    className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSplitDraft((current) =>
                        current.length === 1
                          ? current
                          : current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    className="flex size-[52px] items-center justify-center rounded-[14px] border border-white/12 text-xl text-white/65 transition hover:border-[#FF0064] hover:text-[#FF0064]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setSplitDraft((current) => [
                  ...current,
                  { start: "14:00", end: "18:00" },
                ])
              }
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-white/12 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/68 transition hover:border-white/25 hover:text-white"
            >
              + Добавить интервал
            </button>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                color="ghost"
                className="rounded-md border border-white/12 bg-white/4 text-white"
                onClick={() => setSplitEditorOpen(false)}
              >
                Отмена
              </Button>
              <Button type="button" color="magenta" className="rounded-md" onClick={saveSplitDraft}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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

function statusClasses(status: DayStatus | "empty") {
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

function statusLabels(status: DayStatus | "empty") {
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
