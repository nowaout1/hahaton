import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-screen h-20 px-8 py-4 items-center flex top-0 sticky bg-white/80 backdrop-blur-xl">
      <Link href="/dashboard">
        <Image
          src="/logo/t2_Logo_Black_sRGB.svg"
          alt="t2 logo"
          width={42}
          height={42}
        />
      </Link>
    </header>
  );
}
