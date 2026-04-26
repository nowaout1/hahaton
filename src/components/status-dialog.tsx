"use client";

import { Button } from "@/ui/button";

export function StatusDialog({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4">
      <div className="w-full max-w-[440px] rounded-[22px] border border-white/10 bg-[#0B0B0B] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Статус</div>
        <h3 className="mt-2 text-2xl font-extrabold uppercase text-white">{title}</h3>
        <p className="mt-4 text-sm leading-6 text-white/65">{message}</p>
        <div className="mt-6 flex justify-end">
          <Button type="button" color="magenta" className="rounded-md" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}
