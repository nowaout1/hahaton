import { Button } from "@/ui/button";
import { H1 } from "@/ui/h1";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";
import { Select } from "@/ui/select";

export default function SignUp() {
  return (
    <div className="w-screen flex h-[80dvh]  flex-col items-center justify-center">
      <section className="flex flex-col items-center gap-4">
        <form className="flex flex-col gap-4 items-center">
          <H1>Регистрация</H1>
          <div className="grid gap-2">
            <Input type="text" placeholder="Фамилия" />
            <Input type="text" placeholder="Имя" />
            <Input type="text" placeholder="Отчество" />
            <Input type="email" placeholder="Логин" />
            <Input type="password" placeholder="Пароль" />
            <Select
              options={[{ value: "alians", label: "Альянс" }]}
              color="primary"
              size="md"
              placeholder="Выбрать альянс"
            />
          </div>
          <Button type="submit" className="w-full" color="blue-light">
            Создать аккаунт
          </Button>
        </form>
        <Link href="/sign_in">Авторизация</Link>
      </section>
    </div>
  );
}
