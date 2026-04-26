import Image from "next/image";
import { H1 } from "@/ui/h1";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  helperLink: React.ReactNode;
  children: React.ReactNode;
};

const FEATURE_LINES = [
  "Удобный интерфейс",
  "Гибкая настройка",
  "Поддержка всех устройств",
];

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  helperLink,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-4 pb-8 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-[24px] border border-white/8 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.72fr)]">
          <section className="relative flex items-center border-b border-white/8 px-5 py-8 sm:px-6 lg:border-b-0 lg:border-r lg:border-white/8 lg:px-8 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,0,100,0.22),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_30%)]" />

            <div className="relative flex w-full max-w-[620px] flex-col gap-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/t2_Logo_White_sRGB.svg"
                  alt="t2 logo"
                  width={40}
                  height={40}
                />
                <span className="inline-flex rounded-sm bg-[#FF0064] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                  {eyebrow}
                </span>
              </div>

              <div className="space-y-4">
                <H1 className="max-w-[11ch] text-[clamp(3rem,6vw,6rem)] text-white">
                  {title}
                </H1>
                <p className="max-w-[38ch] text-sm leading-6 text-white/58 sm:text-base">
                  {subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {FEATURE_LINES.map((line, index) => (
                  <div
                    key={line}
                    className="rounded-[16px] border border-white/8 bg-[#111111] px-4 py-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                      0{index + 1}
                    </div>
                    <div className="mt-3 text-sm font-bold uppercase leading-5 text-white">
                      {line}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-end bg-[#0B0B0B] px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
            <div className="w-full max-w-[560px] rounded-[22px] border border-white/8 bg-black p-4 sm:p-5 lg:p-6">
              <div className="rounded-[18px] border border-white/8 bg-[#111111] p-5 sm:p-6">
                {children}
                <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/72">
                  {helperLink}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
