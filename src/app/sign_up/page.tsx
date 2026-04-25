import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";
import { Select } from "@/ui/select";

export default function SignUp() {
  return (
    <AuthShell
      eyebrow="Регистрация"
      title="Создать аккаунт"
      subtitle="Состав полей остается прежним, но сама форма получает более уверенную фирменную подачу в системе t2."
      helperLink={
        <p>
          Уже есть аккаунт?{" "}
          <Link href="/sign_in">
            <span className="text-white underline decoration-[#FF3495] underline-offset-4">
              Авторизация
            </span>
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.16em] text-white/54">
              Фамилия
            </div>
            <Input
              type="text"
              placeholder="Фамилия"
              className="w-full border-white/18 bg-white text-black placeholder:text-black/45"
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.16em] text-white/54">
              Имя
            </div>
            <Input
              type="text"
              placeholder="Имя"
              className="w-full border-white/18 bg-white text-black placeholder:text-black/45"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.16em] text-white/54">
            Отчество
          </div>
          <Input
            type="text"
            placeholder="Отчество"
            className="w-full border-white/18 bg-white text-black placeholder:text-black/45"
          />
        </div>

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

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.16em] text-white/54">
            Альянс
          </div>
          <Select
            options={[{ value: "alians", label: "Альянс" }]}
            color="primary"
            size="md"
            placeholder="Выбрать альянс"
            className="border-white/18 bg-white text-black"
          />
        </div>

        <Button type="submit" className="mt-2 w-full" color="magenta" size="lg">
          Создать аккаунт
        </Button>
      </form>
    </AuthShell>
  );
}
