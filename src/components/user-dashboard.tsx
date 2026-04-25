import { Button } from "@/ui/button";
import { H2 } from "@/ui/h2";
import { Separator } from "@/ui/separator";
import { twMerge } from "tailwind-merge";

type MonthLabel =
  | "Январь"
  | "Февраль"
  | "Март"
  | "Апрель"
  | "Май"
  | "Июнь"
  | "Июль"
  | "Август"
  | "Сентябрь"
  | "Октябрь"
  | "Ноябрь"
  | "Декабрь";

export function UserDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <Header />
      <Month monthLabel="Апрель" />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div className="flex gap-8 items-center justify-between flex-wrap">
      <Markers />
      <div className="flex items-center gap-4">
        <Button color="blue-dark">Создать шаблон</Button>
        <Button color="gray">Применить шаблон</Button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex items-center justify-between w-full flex-wrap gap-4">
      <div className="flex gap-2">
        <div className="grid gap-1 bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-2xl">14</span>
          <span className="text-md">Смен</span>
        </div>
        <div className="grid gap-1 bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-2xl">0</span>
          <span className="text-md">Выходных</span>
        </div>
        <div className="grid gap-1 bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-2xl">0</span>
          <span className="text-md">Отпуск</span>
        </div>
      </div>
      <Button color="lime">Отправить</Button>
    </div>
  );
}

function Markers() {
  return (
    <div className="flex flex-wrap gap-4  md:gap-6">
      <div className="flex gap-1.5 items-center">
        <div className="size-5 bg-pink-600 rounded-sm"></div>
        <span>Смена</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="size-5 border-2 border-pink-600 rounded-sm"></div>
        <span>С разрывом</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="size-5 border-2 rounded-sm"></div>
        <span>Выходной</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="size-5 bg-lime-400 rounded-sm"></div>
        <span>Отпуск</span>
      </div>
      <div className="flex gap-1.5 items-center">
        <div className="size-5 bg-gray-400 rounded-sm"></div>
        <span>Не заполнено</span>
      </div>
    </div>
  );
}

function Month({ monthLabel }: { monthLabel: MonthLabel }) {
  const DAY_LABELS = [
    { day: "ПН", isWeekend: false },
    { day: "ВТ", isWeekend: false },
    { day: "СР", isWeekend: false },
    { day: "ЧТ", isWeekend: false },
    { day: "ПТ", isWeekend: false },
    { day: "СБ", isWeekend: true },
    { day: "ВС", isWeekend: true },
  ] as const;

  return (
    <section className="flex flex-col gap-2">
      <H2>{monthLabel}</H2>
      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map(({ day, isWeekend }) => (
          <span
            key={day}
            className={twMerge(
              "flex items-center justify-center p-2",
              isWeekend && "text-pink-600",
            )}
          >
            {day}
          </span>
        ))}
        {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((i) => (
          <Day key={i}>{i}</Day>
        ))}
      </div>
    </section>
  );
}

function Day({ children }: { children: React.ReactNode }) {
  return (
    <button className="aspect-square bg-pink-600 text-white text-xl rounded-md cursor-pointer">
      {children}
    </button>
  );
}
