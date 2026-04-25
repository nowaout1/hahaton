import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";

export default function SignIn() {
  return (
    <AuthShell
      eyebrow="Авторизация"
      title="Войти в систему"
      subtitle="Чистая авторизация в логике t2: жесткий контраст, крупная типографика и только нужные действия."
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
          <div className="text-xs uppercase tracking-[0.16em] text-white/54">
            Email
          </div>
          <Input
            type="email"
            placeholder="Логин"
            className="w-full border-white/18 bg-white text-black placeholder:text-black/45"
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.16em] text-white/54">
            Пароль
          </div>
          <Input
            type="password"
            placeholder="Пароль"
            className="w-full border-white/18 bg-white text-black placeholder:text-black/45"
          />
        </div>

        <Button type="submit" className="mt-2 w-full" color="magenta" size="lg">
          Войти
        </Button>
      </form>
    </AuthShell>
  );
}
