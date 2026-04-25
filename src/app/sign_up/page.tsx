"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { register } from "@/features/auth/model";
import { DEFAULT_ALLIANCES, loadStoredAlliances } from "@/shared/alliances";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";
import { Select } from "@/ui/select";

export default function SignUp() {
  const router = useRouter();
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [allianceOptions] = useState(() => loadStoredAlliances());
  const [alliance, setAlliance] = useState(() => loadStoredAlliances()[0] ?? DEFAULT_ALLIANCES[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectOptions = useMemo(() => allianceOptions.map((value) => ({ value, label: value })), [allianceOptions]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await register({
        email,
        password,
        full_name: `${lastName} ${firstName} ${middleName}`.trim(),
        alliance,
      });
      setMessage("Аккаунт создан. Выполните вход в систему.");
      router.push("/sign_in");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Регистрация"
      title="Создать аккаунт"
      subtitle="Регистрация теперь использует тот же список альянсов, который поддерживается во фронте и назначается пользователям через API."
      helperLink={
        <p>
          Уже есть аккаунт?{" "}
          <Link href="/sign_in">
            <span className="text-white underline decoration-[#FF3495] underline-offset-4">Авторизация</span>
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Фамилия</div>
            <Input type="text" placeholder="Фамилия" value={lastName} onChange={(event) => setLastName(event.target.value)} required className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10" />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Имя</div>
            <Input type="text" placeholder="Имя" value={firstName} onChange={(event) => setFirstName(event.target.value)} required className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Отчество</div>
          <Input type="text" placeholder="Отчество" value={middleName} onChange={(event) => setMiddleName(event.target.value)} className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Email</div>
          <Input type="email" placeholder="Логин" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Пароль</div>
          <Input type="password" placeholder="Пароль" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Альянс</div>
          <Select
            options={selectOptions}
            color="primary"
            size="md"
            placeholder="Выбрать альянс"
            value={alliance}
            onChange={(event) => setAlliance(event.target.value)}
            className="rounded-[14px] border-white/10 bg-black px-4 py-4 text-white focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        {message ? <p className="text-sm text-white/70">{message}</p> : null}

        <Button type="submit" className="mt-2 w-full rounded-md" color="magenta" size="lg" disabled={loading}>
          {loading ? "Создание..." : "Создать аккаунт"}
        </Button>
      </form>
    </AuthShell>
  );
}
