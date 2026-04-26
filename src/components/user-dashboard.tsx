"use client";

import { useEffect, useMemo, useState } from "react";
import { StatusDialog } from "@/components/status-dialog";
import { fetchCurrentPeriod } from "@/features/periods/model";
import { fetchMySchedule, updateMySchedule } from "@/features/schedule/model";
import { createTemplate, deleteTemplate, fetchTemplates } from "@/features/templates/model";
import type { CollectionPeriod, ScheduleDayPayload, ScheduleTemplate } from "@/shared/types";
import { Button } from "@/ui/button";

type DayStatus = "shift" | "split" | "dayoff" | "vacation";
type SplitInterval = { start: string; end: string };
type CalendarEntry =
  | { status: "shift"; meta: Record<string, unknown> }
  | { status: "split"; intervals: SplitInterval[]; meta: Record<string, unknown> }
  | { status: "dayoff"; meta: Record<string, unknown> }
  | { status: "vacation"; meta: Record<string, unknown> };

type MonthGroup = {
  key: string;
  label: string;
  cells: Array<Date | null>;
};

const DEFAULT_RANGE_START = "2026-04-20";
const DEFAULT_RANGE_END = "2026-05-03";
const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const TOOLS: Array<{ id: DayStatus | "empty"; label: string; hint: string; className: string }> = [
  { id: "shift", label: "Смена", hint: "Рабочий день", className: "bg-[#FF0064] text-white" },
  { id: "split", label: "С разрывом", hint: "Два интервала", className: "border border-[#FF0064] text-[#FF0064]" },
  { id: "dayoff", label: "Выходной", hint: "Свободный день", className: "border border-white/18 text-white/72" },
  { id: "vacation", label: "Отпуск", hint: "Вне смен", className: "bg-[#CCFF00] text-black" },
  { id: "empty", label: "Стереть", hint: "Убрать отметку", className: "bg-white/8 text-white/72" },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
}

function getInitialRange(period: CollectionPeriod | null) {
  return {
    start: parseIsoDate(period?.period_start ?? DEFAULT_RANGE_START),
    end: parseIsoDate(period?.period_end ?? DEFAULT_RANGE_END),
  };
}

function buildRangeDates(start: Date, end: Date) {
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function buildMonthGroups(start: Date, end: Date): MonthGroup[] {
  const dates = buildRangeDates(start, end);
  const grouped = new Map<string, Date[]>();

  dates.forEach((date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
    const list = grouped.get(key) ?? [];
    list.push(date);
    grouped.set(key, list);
  });

  return Array.from(grouped.entries()).map(([key, monthDates]) => {
    const firstDay = monthDates[0];
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const cells: Array<Date | null> = Array.from({ length: offset }, () => null);
    monthDates.forEach((date) => cells.push(date));
    while (cells.length % 7 !== 0) cells.push(null);
    return { key, label: formatMonthLabel(firstDay), cells };
  });
}

function normalizeIntervals(meta: Record<string, unknown>) {
  const fromArray = Array.isArray(meta.intervals)
    ? meta.intervals
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const value = item as { start?: unknown; end?: unknown };
          return typeof value.start === "string" && typeof value.end === "string" ? { start: value.start, end: value.end } : null;
        })
        .filter((item): item is SplitInterval => Boolean(item))
    : [];

  if (fromArray.length) return fromArray;

  const splitStart1 = typeof meta.splitStart1 === "string" ? meta.splitStart1 : "";
  const splitEnd1 = typeof meta.splitEnd1 === "string" ? meta.splitEnd1 : "";
  const splitStart2 = typeof meta.splitStart2 === "string" ? meta.splitStart2 : "";
  const splitEnd2 = typeof meta.splitEnd2 === "string" ? meta.splitEnd2 : "";

  return [
    splitStart1 && splitEnd1 ? { start: splitStart1, end: splitEnd1 } : null,
    splitStart2 && splitEnd2 ? { start: splitStart2, end: splitEnd2 } : null,
  ].filter((item): item is SplitInterval => Boolean(item));
}

function mapScheduleFromApi(data: Record<string, ScheduleDayPayload>) {
  const mapped: Record<string, CalendarEntry> = {};

  Object.entries(data).forEach(([dateKey, payload]) => {
    const meta = (payload.meta ?? {}) as Record<string, unknown>;

    if (payload.status === "split") {
      mapped[dateKey] = { status: "split", intervals: normalizeIntervals(meta), meta };
      return;
    }

    if (payload.status === "shift") {
      mapped[dateKey] = { status: "shift", meta };
      return;
    }

    if (payload.status === "dayoff") {
      mapped[dateKey] = { status: "dayoff", meta };
      return;
    }

    if (payload.status === "vacation") {
      mapped[dateKey] = { status: "vacation", meta };
    }
  });

  return mapped;
}

function createShiftMeta(template?: ScheduleTemplate) {
  if (!template) {
    return {
      shiftStart: "09:00",
      shiftEnd: "18:00",
    };
  }

  return {
    shiftStart: template.shift_start,
    shiftEnd: template.shift_end,
    ...(template.has_break && template.break_start && template.break_end
      ? { breakStart: template.break_start, breakEnd: template.break_end }
      : {}),
  };
}

function createSplitMeta(intervals: SplitInterval[]) {
  const [first, second] = intervals;
  return {
    splitStart1: first?.start ?? "",
    splitEnd1: first?.end ?? "",
    splitStart2: second?.start ?? "",
    splitEnd2: second?.end ?? "",
  };
}

function toPayloadEntry(entry: CalendarEntry): ScheduleDayPayload {
  if (entry.status === "split") {
    return {
      status: "split",
      meta: createSplitMeta(entry.intervals),
    };
  }

  if (entry.status === "shift") {
    return {
      status: "shift",
      meta: entry.meta,
    };
  }

  return {
    status: entry.status,
    meta: undefined,
  };
}

function isDateWithinRange(dateKey: string, start: Date, end: Date) {
  const target = parseIsoDate(dateKey).getTime();
  return target >= start.getTime() && target <= end.getTime();
}

function buildTemplateSchedule(start: Date, end: Date, template: ScheduleTemplate) {
  const dates = buildRangeDates(start, end);
  const totalCycle = template.work_days + template.rest_days;
  const schedule: Record<string, CalendarEntry> = {};

  dates.forEach((date, index) => {
    const cycleDay = totalCycle ? index % totalCycle : 0;
    const dateKey = toIsoDate(date);

    if (cycleDay < template.work_days) {
      schedule[dateKey] = {
        status: "shift",
        meta: createShiftMeta(template),
      };
      return;
    }

    schedule[dateKey] = {
      status: "dayoff",
      meta: {},
    };
  });

  return schedule;
}

function inferTemplateFromState(templateName: string, days: Record<string, CalendarEntry>, selectedTemplate: ScheduleTemplate | null) {
  if (selectedTemplate) {
    return {
      name: templateName,
      work_days: selectedTemplate.work_days,
      rest_days: selectedTemplate.rest_days,
      shift_start: selectedTemplate.shift_start,
      shift_end: selectedTemplate.shift_end,
      has_break: selectedTemplate.has_break,
      break_start: selectedTemplate.break_start,
      break_end: selectedTemplate.break_end,
    };
  }

  const firstShift = Object.values(days).find((entry) => entry.status === "shift") as Extract<CalendarEntry, { status: "shift" }> | undefined;
  const shiftStart = typeof firstShift?.meta.shiftStart === "string" ? firstShift.meta.shiftStart : "09:00";
  const shiftEnd = typeof firstShift?.meta.shiftEnd === "string" ? firstShift.meta.shiftEnd : "18:00";
  const breakStart = typeof firstShift?.meta.breakStart === "string" ? firstShift.meta.breakStart : undefined;
  const breakEnd = typeof firstShift?.meta.breakEnd === "string" ? firstShift.meta.breakEnd : undefined;

  return {
    name: templateName,
    work_days: 5,
    rest_days: 2,
    shift_start: shiftStart,
    shift_end: shiftEnd,
    has_break: Boolean(breakStart && breakEnd),
    break_start: breakStart,
    break_end: breakEnd,
  };
}

export function UserDashboard({ userName, isVerified = false }: { userName?: string; isVerified?: boolean }) {
  const [activeTool, setActiveTool] = useState<DayStatus | "empty">("shift");
  const [days, setDays] = useState<Record<string, CalendarEntry>>({});
  const [activity, setActivity] = useState("Загружаю текущий период, ваш график и шаблоны.");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [splitEditorOpen, setSplitEditorOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [splitDraft, setSplitDraft] = useState<SplitInterval[]>([
    { start: "09:00", end: "13:00" },
    { start: "16:00", end: "20:00" },
  ]);
  const [templateName, setTemplateName] = useState("");
  const [period, setPeriod] = useState<CollectionPeriod | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const periodResponse = await fetchCurrentPeriod().catch(() => null);
        setPeriod(periodResponse);

        if (!isVerified) {
          setTemplates([]);
          setDays({});
          setActivity(
            periodResponse
              ? "Аккаунт еще не верифицирован. Период виден, но отправка графика и работа с шаблонами откроются после верификации."
              : "Аккаунт еще не верифицирован. После верификации здесь появятся график и шаблоны.",
          );
          return;
        }

        const [templatesResponse, scheduleResponse] = await Promise.all([
          fetchTemplates().catch(() => []),
          fetchMySchedule().catch(() => ({})),
        ]);

        setTemplates(templatesResponse);
        setDays(mapScheduleFromApi(scheduleResponse));
        setActivity(periodResponse ? "График загружен из API." : "Активный период пока не открыт.");
      } catch (error) {
        setTemplates([]);
        setPeriod(null);
        setDays({});
        setActivity(getErrorMessage(error, "Не удалось загрузить данные сотрудника из API."));
      }
    };

    void loadData();
  }, [isVerified]);

  const { start, end } = useMemo(() => getInitialRange(period), [period]);
  const monthGroups = useMemo(() => buildMonthGroups(start, end), [start, end]);
  const selectedTemplate = templates.find((template) => String(template.id) === selectedTemplateId) ?? null;

  const stats = useMemo(
    () => ({
      shifts: Object.values(days).filter((entry) => entry.status === "shift").length,
      splits: Object.values(days).filter((entry) => entry.status === "split").length,
      dayoffs: Object.values(days).filter((entry) => entry.status === "dayoff").length,
      vacation: Object.values(days).filter((entry) => entry.status === "vacation").length,
    }),
    [days],
  );

  const applyTool = (dateKey: string) => {
    setDays((current) => {
      const next = { ...current };

      if (activeTool === "empty") {
        delete next[dateKey];
        return next;
      }

      if (activeTool === "split") {
        next[dateKey] = {
          status: "split",
          intervals: splitDraft,
          meta: createSplitMeta(splitDraft),
        };
        return next;
      }

      if (activeTool === "shift") {
        next[dateKey] = {
          status: "shift",
          meta: createShiftMeta(selectedTemplate ?? undefined),
        };
        return next;
      }

      next[dateKey] = { status: activeTool, meta: {} };
      return next;
    });

    setActivity(
      activeTool === "empty"
        ? `Отметка на ${dateKey} удалена.`
        : activeTool === "split"
          ? `Для ${dateKey} сохранена смена с разрывом: ${splitDraft.map((item) => `${item.start}-${item.end}`).join(", ")}.`
          : `Для ${dateKey} установлен статус "${statusLabels(activeTool)}".`,
    );
  };

  const saveSplitDraft = () => {
    const cleaned = splitDraft.filter((interval) => interval.start.trim() && interval.end.trim());
    if (!cleaned.length) return;
    setSplitDraft(cleaned);
    setActiveTool("split");
    setActivity(`Интервалы для смены с разрывом сохранены: ${cleaned.map((item) => `${item.start}-${item.end}`).join(", ")}.`);
    setSplitEditorOpen(false);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => String(item.id) === templateId);
    if (!template) return;

    const nextDays = buildTemplateSchedule(start, end, template);
    setDays(nextDays);
    setActivity(`Шаблон "${template.name}" применен к текущему периоду.`);
  };

  const openSaveTemplate = () => {
    const fallbackName = selectedTemplate?.name ? `${selectedTemplate.name} копия` : `Шаблон ${new Date().toLocaleDateString("ru-RU")}`;
    setTemplateName(fallbackName);
    setSaveTemplateOpen(true);
  };

  const submitTemplate = async () => {
    const trimmedName = templateName.trim();
    if (!trimmedName) return;

    if (!isVerified) {
      setActivity("Шаблон нельзя сохранить, пока аккаунт не верифицирован.");
      setDialog({
        open: true,
        title: "Нужна верификация",
        message: "Сохранение шаблонов станет доступно после верификации аккаунта.",
      });
      return;
    }

    setSavingTemplate(true);
    try {
      const payload = inferTemplateFromState(trimmedName, days, selectedTemplate);
      const created = await createTemplate(payload);
      setTemplates((current) => [created, ...current]);
      setSelectedTemplateId(String(created.id));
      setActivity(`Шаблон "${created.name}" сохранен в API.`);
      setSaveTemplateOpen(false);
      setDialog({
        open: true,
        title: "Шаблон сохранен",
        message: `Шаблон "${created.name}" успешно сохранен.`,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Не удалось сохранить шаблон в API.");
      setActivity(message);
      setDialog({
        open: true,
        title: "Ошибка",
        message,
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const removeTemplate = async () => {
    if (!selectedTemplate) return;

    if (!isVerified) {
      setDialog({
        open: true,
        title: "Нужна верификация",
        message: "Удаление шаблонов станет доступно после верификации аккаунта.",
      });
      return;
    }

    try {
      await deleteTemplate(selectedTemplate.id);
      setTemplates((current) => current.filter((template) => template.id !== selectedTemplate.id));
      setSelectedTemplateId("");
      setActivity(`Шаблон "${selectedTemplate.name}" удален.`);
      setDialog({
        open: true,
        title: "Шаблон удален",
        message: `Шаблон "${selectedTemplate.name}" удален.`,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Не удалось удалить шаблон из API.");
      setActivity(message);
      setDialog({
        open: true,
        title: "Ошибка",
        message,
      });
    }
  };

  const submitSchedule = async () => {
    if (!isVerified) {
      setActivity("График нельзя отправить, пока аккаунт не верифицирован.");
      setDialog({
        open: true,
        title: "Нужна верификация",
        message: "Отправка графика станет доступна после верификации аккаунта.",
      });
      return;
    }

    if (!period) {
      setActivity("Сейчас нет открытого периода сбора графиков.");
      setDialog({
        open: true,
        title: "Нет активного периода",
        message: "Сейчас нет открытого периода сбора графиков, поэтому отправить расписание нельзя.",
      });
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(days)
        .filter(([dateKey]) => isDateWithinRange(dateKey, start, end))
        .map(([dateKey, entry]) => [dateKey, toPayloadEntry(entry)]),
    );

    setScheduleBusy(true);
    try {
      const updated = await updateMySchedule({ days: payload });
      setDays(mapScheduleFromApi(updated));
      setActivity("График отправлен и сохранен в API.");
      setDialog({
        open: true,
        title: "График отправлен",
        message: "Ваш график успешно сохранен.",
      });
    } catch (error) {
      const message = getErrorMessage(error, "Не удалось отправить график в API.");
      setActivity(message);
      setDialog({
        open: true,
        title: "Ошибка",
        message,
      });
    } finally {
      setScheduleBusy(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="rounded-[18px] border border-white/8 bg-[#111111] p-4">
          <div className="mb-5 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Инструменты</div>
            <p className="text-sm leading-6 text-white/60">Выбирайте тип дня и отмечайте даты в матрице. Данные отправляются в API только в рамках открытого периода.</p>
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
                  className={`flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left transition ${active ? "border-[#FF0064] bg-white text-black" : "border-white/10 bg-black text-white hover:border-white/18 hover:bg-white/3"}`}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-bold uppercase tracking-[0.08em]">{tool.label}</div>
                    <div className={`text-[11px] leading-4 ${active ? "text-black/65" : "text-white/45"}`}>{tool.hint}</div>
                  </div>
                  <div className={`min-w-[88px] rounded-sm px-3 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] ${tool.className}`}>
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
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Шаблон</div>
            <select
              value={selectedTemplateId}
              onChange={(event) => applyTemplate(event.target.value)}
              className="mt-3 w-full rounded-[14px] border border-white/10 bg-[#111111] px-4 py-4 text-sm text-white outline-none transition focus:border-[#FF0064]"
            >
              <option value="">Выберите сохраненный шаблон</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={openSaveTemplate}>
                Сохранить шаблон
              </Button>
              <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={removeTemplate} disabled={!selectedTemplate}>
                Удалить
              </Button>
            </div>
            <div className="mt-3 text-[11px] leading-5 text-white/48">
              {selectedTemplate ? `Выбран: ${selectedTemplate.name}` : templates.length ? "Шаблон пока не выбран." : "Сохраненных шаблонов пока нет."}
            </div>
          </div>

          <div className="mt-5 rounded-[14px] border border-white/8 bg-black px-4 py-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">Активность</div>
            <p className="mt-3 text-sm leading-6 text-white/65">{activity}</p>
          </div>
        </section>

        <section className="rounded-[18px] border border-white/8 bg-[#0B0B0B] p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                {formatShortDate(start)} - {formatShortDate(end)}
              </div>
              <h2 className="mt-2 text-2xl font-extrabold uppercase sm:text-3xl">Матрица графика</h2>
              <p className="mt-2 text-sm text-white/45">{userName ? `Сотрудник: ${userName}` : "Сотрудник текущей сессии"}</p>
              {!isVerified ? (
                <p className="mt-2 text-sm text-[#CCFF00]">
                  Аккаунт не верифицирован. Можно подготовить график, но отправка и шаблоны станут доступны после верификации.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" color="magenta" className="rounded-md" onClick={submitSchedule} disabled={scheduleBusy}>
                Отправить
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {monthGroups.map((group) => (
              <div key={group.key} className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{group.label}</div>
                <div className="grid grid-cols-7 gap-2">
                  {DAY_LABELS.map((label, index) => (
                    <div
                      key={`${group.key}-${label}`}
                      className={`flex items-center justify-center rounded-md border border-white/6 px-2 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] ${index > 4 ? "text-[#FF0064]" : "text-white/42"}`}
                    >
                      {label}
                    </div>
                  ))}
                  {group.cells.map((date, index) =>
                    date === null ? (
                      <div key={`${group.key}-empty-${index}`} className="aspect-[0.95] rounded-[14px] border border-transparent bg-transparent" />
                    ) : (
                      <button
                        key={toIsoDate(date)}
                        type="button"
                        onClick={() => applyTool(toIsoDate(date))}
                        className={`aspect-[0.95] rounded-[14px] border p-2 text-left transition hover:-translate-y-[1px] sm:p-3 ${statusClasses(days[toIsoDate(date)]?.status ?? "empty")}`}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <span className="text-sm font-extrabold sm:text-base">{date.getDate()}</span>
                          <span className="hidden text-[10px] uppercase tracking-[0.14em] opacity-90 sm:block">
                            {statusLabels(days[toIsoDate(date)]?.status ?? "empty")}
                          </span>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {splitEditorOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4">
          <div className="w-full max-w-[560px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Смена с разрывом</div>
                <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">Настройка интервалов</h3>
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
                <div key={`${index}-${interval.start}-${interval.end}`} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={interval.start}
                    onChange={(event) => setSplitDraft((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, start: event.target.value } : item)))}
                    className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                  />
                  <input
                    type="time"
                    value={interval.end}
                    onChange={(event) => setSplitDraft((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, end: event.target.value } : item)))}
                    className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-[#FF0064]"
                  />
                  <button
                    type="button"
                    onClick={() => setSplitDraft((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)))}
                    className="flex size-[52px] items-center justify-center rounded-[14px] border border-white/12 text-xl text-white/65 transition hover:border-[#FF0064] hover:text-[#FF0064]"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSplitDraft((current) => [...current, { start: "14:00", end: "18:00" }])}
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-white/12 px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/68 transition hover:border-white/25 hover:text-white"
            >
              + Добавить интервал
            </button>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={() => setSplitEditorOpen(false)}>
                Отмена
              </Button>
              <Button type="button" color="magenta" className="rounded-md" onClick={saveSplitDraft}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}

      {saveTemplateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/72 px-4">
          <div className="w-full max-w-[460px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Сохранение шаблона</div>
            <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">Название шаблона</h3>
            <input
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Например, 5/2 апрель-май"
              className="mt-5 w-full rounded-[14px] border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#FF0064]"
            />
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button type="button" color="ghost" className="rounded-md border border-white/12 bg-white/4 text-white" onClick={() => setSaveTemplateOpen(false)}>
                Закрыть
              </Button>
              <Button type="button" color="magenta" className="rounded-md" onClick={submitTemplate} disabled={!templateName.trim() || savingTemplate}>
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

function StatCard({ label, value, tone }: { label: string; value: number; tone: "white" | "magenta" | "lime" | "muted" }) {
  const toneClass = tone === "magenta" ? "text-[#FF0064]" : tone === "lime" ? "text-[#CCFF00]" : tone === "muted" ? "text-white/78" : "text-white";
  return (
    <div className="rounded-[14px] border border-white/8 bg-black px-4 py-3">
      <div className={`text-2xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/42">{label}</div>
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
