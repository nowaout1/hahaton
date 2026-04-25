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
      subtitle="Сохраняем ваш состав полей, но приводим подачу к новой системе: черный контур, маджента и рабочая плотность интерфейса."
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
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Фамилия
            </div>
            <Input
              type="text"
              placeholder="Фамилия"
              className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
            />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Имя
            </div>
            <Input
              type="text"
              placeholder="Имя"
              className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Отчество
          </div>
          <Input
            type="text"
            placeholder="Отчество"
            className="w-full rounded-[14px] border-white/10 bg-black px-4 py-4 text-white placeholder:text-white/30 focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

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

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Альянс
          </div>
          <Select
            options={[{ value: "alians", label: "Альянс" }]}
            color="primary"
            size="md"
            placeholder="Выбрать альянс"
            className="rounded-[14px] border-white/10 bg-black px-4 py-4 text-white focus:border-[#FF0064] focus:ring-[#FF0064]/10"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 w-full rounded-md"
          color="magenta"
          size="lg"
        >
          Создать аккаунт
        </Button>
      </form>
    </AuthShell>
  );
}
