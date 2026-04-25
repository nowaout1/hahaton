import { Button } from "@/ui/button";
import { H1 } from "@/ui/h1";
import { Input } from "@/ui/input";
import { Link } from "@/ui/link";

export default function SignIn() {
  return (
    <div className="w-screen h-[80dvh] grid items-center justify-center">
      <section className="flex flex-col items-center gap-4">
        <form className="flex flex-col gap-4 items-center">
          <H1>Авторизация</H1>
          <div className="grid gap-2">
            <Input type="email" placeholder="Логин" />
            <Input type="password" placeholder="Пароль" />
          </div>
          <Button type="submit" className="w-full" color="blue-light">
            Войти
          </Button>
        </form>
        <Link href="/sign_up">Регистрация</Link>
      </section>
    </div>
  );
}
