import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";

export default function SignIn() {
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
      <form className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Email
          </div>
          <Input
            type="email"
            placeholder="Логин"
            className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Пароль
          </div>
          <Input
            type="password"
            placeholder="Пароль"
            className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 w-full rounded-md"
          color="magenta"
          size="lg"
        >
          Войти
        </Button>
      </form>
    </AuthShell>
  );
}
