"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";
import { login } from "@/features/auth/model";
import { useSession } from "@/stores/session-context";

export default function SignIn() {
  const router = useRouter();
  const { setUser } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login({ username, password });
      setUser(user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось авторизоваться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Авторизация"
      title="Войти в систему"
      subtitle="Тот же плотный и контрастный язык, что и в дашборде: минимум шума, быстрый сценарий и уверенный ритм t2."
      helperLink={
        <p>
          Нет аккаунта?{" "}
          <Link href="/sign_up">
            <span className="text-white underline decoration-[#FF3495] underline-offset-4">
              Регистрация
            </span>
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Email</div>
          <Input
            type="email"
            placeholder="Логин"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Пароль</div>
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        {error ? <p className="text-sm text-[#FF6B9E]">{error}</p> : null}

        <Button type="submit" className="mt-2 w-full rounded-md" color="magenta" size="lg" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </AuthShell>
  );
}
