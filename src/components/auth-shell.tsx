import Image from "next/image";
import { H1 } from "@/ui/h1";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  helperLink: React.ReactNode;
  children: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  helperLink,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,52,149,0.18),_transparent_30%),linear-gradient(180deg,_rgba(0,0,0,0.02),_transparent_20%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56vw] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,_rgba(255,52,149,0.22),_transparent_26%)]" />
        <div className="absolute inset-y-0 left-[6%] w-[70%]">
          <Image
            src="/images/dedfoncrutoi.png"
            alt="Персонаж с планшетом и календарем графика"
            fill
            priority
            className="object-contain object-bottom opacity-[0.95]"
          />
        </div>
        <div className="absolute inset-y-0 left-0 w-[72%] bg-gradient-to-r from-white via-white/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/75 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38vw] border-l border-black/8 bg-black lg:block" />

      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 px-5 pb-8 pt-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.72fr)] lg:px-8 lg:pt-24">
        <section className="flex items-start py-6 lg:py-12">
          <div className="flex w-full flex-col gap-8 lg:max-w-[620px] lg:pr-12">
            <div className="flex max-w-[560px] flex-col gap-5">
              <span className="inline-flex w-fit rounded-full border border-black/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-black/60">
                {eyebrow}
              </span>
              <H1 className="max-w-[10ch] text-[clamp(3rem,6vw,6.5rem)]">
                {title}
              </H1>
              <p className="max-w-[36ch] text-base leading-6 text-black/62 sm:text-lg">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-start justify-end py-6 lg:py-12">
          <div className="w-full max-w-[560px] rounded-[36px] border border-black/10 bg-white p-4 shadow-[0_32px_80px_rgba(0,0,0,0.08)] sm:p-6 lg:p-8">
            <div className="rounded-[28px] bg-black p-6 text-white sm:p-8">
              {children}
              <div className="mt-6 border-t border-white/12 pt-5 text-sm text-white/72">
                {helperLink}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
